const API_URL = ' https://laxmicyber-backend.onrender.com/api/complaints'; // Update this to your backend URL

let evidence = [];
let shots = [];
let rec = null;
let listening = false;

function esc(x) {
  return String(x ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function analyze(t) {
  t = t.toLowerCase();
  if (['upi', 'money', 'bank', 'payment', 'transaction', 'fraud', 'atm', 'debit', 'credit'].some(x => t.includes(x))) return ['UPI / Financial Fraud', 'High'];
  if (['phishing', 'suspicious link', 'malicious link', 'otp', 'fake website', 'fake link'].some(x => t.includes(x))) return ['Phishing', 'High'];
  if (['hack', 'hacked', 'password stolen', 'unauthorized access', 'account compromised'].some(x => t.includes(x))) return ['Account Hacking', 'High'];
  if (['instagram', 'facebook', 'social media', 'fake profile', 'fake account', 'whatsapp', 'telegram'].some(x => t.includes(x))) return ['Social Media Fraud', 'Medium'];
  return ['Other', 'Low'];
}

const dataURL = f => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(f);
});

function renderFiles() {
  document.getElementById('evidenceList').innerHTML = evidence.length
    ? evidence.map((f, i) => `<div class="file">📎 ${esc(f.name)} <button onclick="removeEvidence(${i})">×</button></div>`).join('')
    : '<small>No evidence selected</small>';
  
  document.getElementById('preview').innerHTML = '';
  shots.forEach((f, i) => {
    const r = new FileReader();
    r.onload = e => document.getElementById('preview').insertAdjacentHTML('beforeend', `<div class="thumb"><img src="${e.target.result}"><button onclick="removeShot(${i})">×</button></div>`);
    r.readAsDataURL(f);
  });
}

function removeEvidence(i) { evidence.splice(i, 1); renderFiles(); }
function removeShot(i) { shots.splice(i, 1); renderFiles(); }

document.getElementById('evidence').onchange = e => { evidence = evidence.concat([...e.target.files]).slice(0, 5); renderFiles(); };
document.getElementById('screenshots').onchange = e => { shots = shots.concat([...e.target.files].filter(f => f.size <= 1048576)).slice(0, 3); renderFiles(); };

const text = document.getElementById('complaint');
text.oninput = () => document.getElementById('charCount').textContent = text.value.length;

function setupVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    document.getElementById('voiceStatus').textContent = '⚠️ Voice recognition is not supported. Use Chrome or Edge.';
    return;
  }
  rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = 'en-IN';
  rec.onstart = () => {
    listening = true;
    document.getElementById('voiceStatus').textContent = '🔴 Listening...';
    document.getElementById('stopVoice').classList.remove('hidden');
    document.getElementById('startVoice').classList.add('hidden');
    document.getElementById('voiceBtn').classList.add('listening');
  };
  rec.onresult = e => {
    let s = '';
    for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) s += e.results[i][0].transcript + ' ';
    if (s) { text.value = (text.value + ' ' + s).trim(); text.oninput(); }
  };
  rec.onerror = e => document.getElementById('voiceStatus').textContent = '⚠️ ' + e.error;
  rec.onend = () => {
    listening = false;
    document.getElementById('stopVoice').classList.add('hidden');
    document.getElementById('startVoice').classList.remove('hidden');
    document.getElementById('voiceBtn').classList.remove('listening');
    document.getElementById('voiceStatus').textContent = '🎙️ Click microphone to speak';
  };
  const start = () => { if (!listening) try { rec.start(); } catch {} };
  document.getElementById('voiceBtn').onclick = () => listening ? rec.stop() : start();
  document.getElementById('startVoice').onclick = start;
  document.getElementById('stopVoice').onclick = () => rec.stop();
}

setupVoice();
document.getElementById('readVoice').onclick = () => {
  if (!text.value.trim()) return alert('Enter a complaint first.');
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text.value));
};
renderFiles();

// SUBMIT COMPLAINT
document.getElementById('submit').onclick = async () => {
  if (text.value.trim().length < 10) return alert('Please enter more complaint details.');

  const a = analyze(text.value);
  const now = new Date().toLocaleString();
  // Unique timestamp-based ID generator to prevent duplicate key errors
  const uniqueNum = Math.floor(1000 + Math.random() * 9000);
  const id = `CG-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}${uniqueNum}`;
  
  const ss = [];
  for (const f of shots) ss.push({ name: f.name, type: f.type, size: f.size, data: await dataURL(f) });

  const complaintData = {
    id,
    text: text.value.trim(),
    category: a[0],
    priority: a[1],
    status: 'Registered',
    date: now,
    updatedAt: now,
    evidence: evidence.map(f => ({ name: f.name, type: f.type, size: f.size })),
    screenshots: ss
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaintData)
    });

    const resultData = await response.json();

    if (response.ok) {
      document.getElementById('result').innerHTML = `<div class="success">✅ <b>Complaint Registered!</b><br>Your Complaint ID: <strong>${id}</strong><br>Category: ${a[0]} | Priority: ${a[1]}</div>`;
      text.value = '';
      text.oninput();
      evidence = [];
      shots = [];
      document.getElementById('evidence').value = '';
      document.getElementById('screenshots').value = '';
      renderFiles();
    } else {
      alert(`Error saving complaint: ${resultData.error || 'Server rejected the request.'}`);
    }
  } catch (err) {
    alert('Server Error: Make sure node server.js is running on http://localhost:5000.');
  }
};

// TRACK COMPLAINT
document.getElementById('trackBtn').onclick = async () => {
  const id = document.getElementById('trackId').value.trim().toUpperCase();
  const r = document.getElementById('trackResult');

  if (!id) return alert('Please enter a Complaint ID.');

  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) return r.innerHTML = '<div class="errorbox">❌ Complaint not found in system.</div>';

    const c = await res.json();
    r.innerHTML = `<div class="tracking"><b>${esc(c.id)}</b><span class="badge2">${esc(c.status)}</span><p><b>Category:</b> ${esc(c.category)}<br><b>Priority:</b> ${esc(c.priority)}<br><b>Date:</b> ${esc(c.date)}<br><b>Evidence:</b> ${c.evidence?.length || 0} | <b>Screenshots:</b> ${c.screenshots?.length || 0}</p><div class="timeline">📝 Registered → 🔍 Under Review → ✅ Resolved</div><p>${esc(c.text)}</p></div>`;
  } catch (err) {
    r.innerHTML = '<div class="errorbox">❌ Unable to fetch status. Check server connection.</div>';
  }
};