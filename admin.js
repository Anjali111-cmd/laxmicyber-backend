const API_URL = 'https://laxmicyber-backend.onrender.com/api/complaints';

// Immediate Route Guard: Check for token right away
const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  if (token) {
    fetchAdminComplaints();
    setupLogout();
  }
});

// Fetch all complaints with authorization header
async function fetchAdminComplaints() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      alert('Session expired. Please log in again.');
      logoutAdmin();
      return;
    }

    const complaints = await res.json();
    
    // Ensure render function exists before executing
    if (typeof renderComplaintsTable === 'function') {
      renderComplaintsTable(complaints);
    } else if (typeof displayComplaints === 'function') {
      displayComplaints(complaints);
    } else {
      console.log('Complaints data loaded:', complaints);
    }
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

// Delete a single complaint
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
      alert('Complaint deleted successfully!');
      fetchAdminComplaints();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete complaint.');
    }
  } catch (err) {
    console.error('Error deleting complaint:', err);
  }
}

// Clear all complaints
async function clearAllComplaints() {
  if (!confirm('WARNING: Are you sure you want to delete ALL complaints? This action cannot be undone.')) return;

  try {
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      alert('All complaints cleared successfully!');
      fetchAdminComplaints();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to clear complaints.');
    }
  } catch (err) {
    console.error('Error clearing complaints:', err);
  }
}

// Attach logout event handler
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }
}

// Logout helper
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}