const API_URL = 'https://laxmicyber-backend.vercel.app/api/complaints';

const token = localStorage.getItem('adminToken');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  fetchAdminComplaints();
  setupLogout();
});

async function fetchAdminComplaints() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert('Session expired or invalid token. Please log in again.');
      logoutAdmin();
      return;
    }

    const complaints = await res.json();
    renderComplaintsTable(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

function renderComplaintsTable(complaints) {
  const container = document.getElementById('complaintsContainer') || 
                    document.getElementById('complaintsTable') || 
                    document.querySelector('tbody') || 
                    document.querySelector('.complaints-list');

  if (!container) return;

  if (!Array.isArray(complaints) || complaints.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No complaints found.</td></tr>';
    return;
  }

  container.innerHTML = complaints.map(c => `
    <tr>
      <td><strong>${c.id || c._id || 'N/A'}</strong></td>
      <td>${c.name || c.userName || 'Anonymous'}</td>
      <td>${c.category || c.type || 'N/A'}</td>
      <td>${c.description || ''}</td>
      <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button onclick="deleteComplaint('${c.id || c._id}')" style="background:#dc3545; color:white; border:none; padding: 6px 12px; border-radius: 4px; cursor:pointer;">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }
}

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}