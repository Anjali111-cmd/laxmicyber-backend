const API_BASE_URL = 'https://laxmicyber-backend.vercel.app/api/admin';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') || document.querySelector('form');

  if (!loginForm) {
    alert('Error: Login form element not found in HTML!');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username')?.value || document.querySelector('input[type="text"]')?.value;
    const passwordInput = document.getElementById('password')?.value || document.querySelector('input[type="password"]')?.value;

    if (!usernameInput || !passwordInput) {
      alert('Please enter both username and password.');
      return;
    }

    try {
      alert('Sending request to backend...');

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        alert('Login successful! Navigating to dashboard...');
        window.location.href = 'admin.html';
      } else {
        alert('Server Response: ' + (data.message || 'Invalid username or password!'));
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Connection Error: ' + err.message);
    }
  });
});