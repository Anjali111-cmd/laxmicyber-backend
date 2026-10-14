const API_BASE_URL = 'https://laxmicyber-backend.vercel.app/api/admin';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm') || document.querySelector('form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username')?.value || document.querySelector('input[type="text"]')?.value;
      const passwordInput = document.getElementById('password')?.value || document.querySelector('input[type="password"]')?.value;

      if (!usernameInput || !passwordInput) {
        alert('Please enter both username and password.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          localStorage.setItem('adminToken', data.token);
          window.location.href = 'admin.html';
        } else {
          alert(data.message || 'Invalid username or password!');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Could not connect to backend server.');
      }
    });
  }
});