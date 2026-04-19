const API = 'https://smart-parking-backend-4lx3.onrender.com/api';

// ── Helper: get token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// ── Helper: GET request
async function apiGet(url) {
  const res = await fetch(API + url, {
    headers: { 'authorization': getToken() }
  });
  return res.json();
}

// ── Helper: POST request
async function apiPost(url, body) {
  const res = await fetch(API + url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': getToken()
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

// ── Helper: PUT request
async function apiPut(url, body) {
  const res = await fetch(API + url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'authorization': getToken()
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

// ── Show alert message
function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

// ── Login
async function login() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    showAlert('errorMsg', 'Please fill in all fields');
    return;
  }

  const data = await apiPost('/auth/login', { email, password });

  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.user.role === 'admin') {
      window.location.href = 'pages/admin-dashboard.html';
    } else {
      window.location.href = 'pages/dashboard.html';
    }
  } else {
    showAlert('errorMsg', data.error || 'Login failed');
  }
}

// ── Register
async function register() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    showAlert('errorMsg', 'Please fill in all fields');
    return;
  }

  const data = await apiPost('/auth/register', { name, email, password });

  if (data.message) {
    showAlert('successMsg', data.message, 'success');
    setTimeout(() => window.location.href = '../index.html', 2000);
  } else {
    showAlert('errorMsg', data.error || 'Registration failed');
  }
}

// ── Logout
function logout() {
  localStorage.clear();
  window.location.href = '../index.html';
}
// ── Helper: DELETE request
async function apiDelete(url) {
  const res = await fetch(API + url, {
    method: 'DELETE',
    headers: { 'authorization': getToken() }
  });
  return res.json();
}