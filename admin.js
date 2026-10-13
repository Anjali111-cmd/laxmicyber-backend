const API_URL = 'https://laxmicyber-backend.onrender.com/api/complaints';

// Immediate Route Protection Check
const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAdminComplaints();
  setupLogout();
});

// Fetch all complaints
async function fetchAdminComplaints() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert('Session expired or invalid login. Please log in again.');
      logoutAdmin();
      return;
    }

    const complaints = await res.json();
    renderComplaintsTable(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

// Dynamically render complaints into the HTML table/container
function renderComplaintsTable(complaints) {
  const container = document.getElementById('complaintsContainer') || 
                    document.getElementById('complaintsTable') || 
                    document.querySelector('tbody') || 
                    document.querySelector('.complaints-list');

  if (!container) {
    console.warn('No container element found in HTML to display complaints.');
    return;
  }

  if (complaints.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">No complaints found.</td></tr>';
    return;
  }

  // Populate rows
  container.innerHTML = complaints.map(c => `
    <tr>
      <td><strong>${c.id || 'N/A'}</strong></td>
      <td>${c.name || c.userName || 'Anonymous'}</td>
      <td>${c.category || c.type || 'N/A'}</td>
      <td>${c.description || ''}</td>
      <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button onclick="deleteComplaint('${c.id}')" style="background:#dc3545; color:white; border:none; padding: 5px 10px; borderRadius: 4px; cursor:pointer;">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

// Delete single complaint
async function deleteComplaint(id) {
  if (!confirm(`Are you sure you want to delete complaint ${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      alert('Complaint deleted!');
      fetchAdminComplaints();
    } else {
      const errData = await res.json();
      alert(errData.error || 'Failed to delete complaint.');
    }
  } catch (err) {
    console.error('Error deleting complaint:', err);
  }
}

// Clear all complaints
async function clearAllComplaints() {
  if (!confirm('WARNING: Are you sure you want to delete ALL complaints?')) return;

  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    });

    if (res.ok) {
      alert('All complaints cleared!');
      fetchAdminComplaints();
    } else {
      const errData = await res.json();
      alert(errData.error || 'Failed to clear complaints.');
    }
  } catch (err) {
    console.error('Error clearing complaints:', err);
  }
}

// Logout handler
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