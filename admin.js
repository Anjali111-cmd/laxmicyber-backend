const API_URL = 'https://laxmicyber-backend.onrender.com/api/complaints'; // Update this to your backend URL

// --- ROUTE PROTECTION CHECK ---
// Execute immediately before rendering anything
const token = localStorage.getItem('adminToken');
if (!token) {
  // If no token exists, immediately boot user to login page
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAdminComplaints();
  setupLogout();
});

// Fetch all complaints with authorization token
async function fetchAdminComplaints() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      // Token is invalid or expired
      alert('Session expired. Please log in again.');
      logoutAdmin();
      return;
    }

    const complaints = await res.json();
    renderComplaintsTable(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
  }
}

// Function to delete a complaint
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
      fetchAdminComplaints(); // Refresh list
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete complaint.');
    }
  } catch (err) {
    console.error('Error deleting complaint:', err);
  }
}

// Function to clear all complaints
async function clearAllComplaints() {
  if (!confirm('WARNING: Are you sure you want to delete ALL complaints? This cannot be undone.')) return;

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
      fetchAdminComplaints(); // Refresh list
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to clear complaints.');
    }
  } catch (err) {
    console.error('Error clearing complaints:', err);
  }
}

// Attach logout listener to button
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn') || document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }
}

// Logout function
function logoutAdmin() {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
}