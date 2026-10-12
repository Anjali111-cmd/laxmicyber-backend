const API_URL = 'http://localhost:5000/api/complaints';
let complaintsList = [];
let cc, sc;

const esc = x => String(x ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

async function fetchComplaints() {
  try {
    const res = await fetch(API_URL);
    complaintsList = await res.json();
    render();
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

function render() {
  let q = document.getElementById('search').value.toLowerCase();
  let ca = document.getElementById('category').value;
  let p = document.getElementById('priority').value;
  let s = document.getElementById('status').value;

  let filtered = complaintsList.filter(c =>
    (!q || c.id.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)) &&
    (ca === 'All' || c.category === ca) &&
    (p === 'All' || c.priority === p) &&
    (s === 'All' || c.status === s)
  );

  document.getElementById('total').textContent = complaintsList.length;
  document.getElementById('high').textContent = complaintsList.filter(c => c.priority === 'High').length;
  document.getElementById('review').textContent = complaintsList.filter(c => c.status === 'Under Review').length;
  document.getElementById('resolved').textContent = complaintsList.filter(c => c.status === 'Resolved').length;

  document.getElementById('complaintTable').innerHTML = filtered.length ? filtered.map(c => `
    <tr>
      <td>${esc(c.id)}</td>
      <td>${esc(c.text)}</td>
      <td>${esc(c.category)}</td>
      <td><b class="p-${c.priority}">${c.priority}</b></td>
      <td>
        <select onchange="changeStatus('${c.id}', this.value)">
          <option ${c.status === 'Registered' ? 'selected' : ''}>Registered</option>
          <option ${c.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
          <option ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </td>
      <td>📎${c.evidence?.length || 0}<br>📸${c.screenshots?.length || 0}</td>
      <td>${esc(c.date)}</td>
      <td>
        <button onclick="view('${c.id}')">👁️</button>
        <button onclick="del('${c.id}')">🗑️</button>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8">No complaints found.</td></tr>';

  charts();
}

async function changeStatus(id, status) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchComplaints();
  } catch (err) {
    alert('Failed to update status');
  }
}

async function del(id) {
  if (confirm('Delete this complaint?')) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchComplaints();
    } catch (err) {
      alert('Failed to delete complaint');
    }
  }
}

async function clearAll() {
  if (confirm('Clear all complaints permanently from database?')) {
    try {
      await fetch(API_URL, { method: 'DELETE' });
      fetchComplaints();
    } catch (err) {
      alert('Failed to clear database');
    }
  }
}

function resetFilters() {
  ['search', 'category', 'priority', 'status'].forEach((x, i) => document.getElementById(x).value = i ? 'All' : '');
  render();
}

function view(id) {
  const c = complaintsList.find(x => x.id === id);
  if (!c) return;
  let files = (c.screenshots || []).map(x => `<img class="modalimg" src="${x.data}">`).join('');
  document.getElementById('modalBody').innerHTML = `
    <h2>${esc(c.id)}</h2>
    <p><b>Category:</b> ${esc(c.category)}<br><b>Priority:</b> ${esc(c.priority)}<br><b>Status:</b> ${esc(c.status)}<br><b>Date:</b> ${esc(c.date)}</p>
    <hr>
    <h3>Complaint</h3><p>${esc(c.text)}</p>
    <h3>Evidence</h3><p>${(c.evidence || []).map(x => '📎 ' + esc(x.name)).join('<br>') || 'None'}</p>
    <h3>Screenshots</h3><div>${files || 'None'}</div>
  `;
  document.getElementById('modal').classList.add('show');
}

function closeModal() {
  document.getElementById('modal').classList.remove('show');
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  location.replace('login.html');
}

function charts() {
  if (typeof Chart === 'undefined') return;
  const cats = ['UPI / Financial Fraud', 'Phishing', 'Account Hacking', 'Social Media Fraud', 'Other'];
  const sts = ['Registered', 'Under Review', 'Resolved'];

  cc?.destroy();
  sc?.destroy();

  cc = new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: { labels: cats, datasets: [{ label: 'Complaints', data: cats.map(x => complaintsList.filter(c => c.category === x).length) }] },
    options: { responsive: true, maintainAspectRatio: false }
  });

  sc = new Chart(document.getElementById('statusChart'), {
    type: 'doughnut',
    data: { labels: sts, datasets: [{ data: sts.map(x => complaintsList.filter(c => c.status === x).length) }] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

fetchComplaints();

['search', 'category', 'priority', 'status'].forEach(id => document.getElementById(id).addEventListener(id === 'search' ? 'input' : 'change', render));
window.addEventListener('click', e => { if (e.target === document.getElementById('modal')) closeModal(); });