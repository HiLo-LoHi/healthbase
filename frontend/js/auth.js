const AUTH_USER_KEY = 'healthbase_current_user';
const REMEMBERED_USERNAME_KEY = 'healthbase_remembered_username';

document.addEventListener('DOMContentLoaded', () => {
  const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);

  if (rememberedUsername) {
    document.getElementById('username').value = rememberedUsername;
    document.getElementById('rememberMe').checked = true;
  }
});

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  clearLoginError();

  if (!username || !password) {
    showLoginError('Please enter username and password.');
    return;
  }

  if (rememberMe) {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  }

  try {
    const res = await fetch(API + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      showLoginError(data.error || 'Login failed.');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data));

    redirectByRole(data.role);
  } catch (err) {
    showLoginError('Cannot connect to server. Try again.');
    console.error(err);
  }
}

function redirectByRole(role, residentId) {
  if (role === 'admin') {
    location.href = 'dashboard.html';
    return;
  }

  if (role === 'patient') {
    location.href = residentId
      ? 'resident-profile.html?id=' + encodeURIComponent(residentId)
      : 'resident-profile.html';
    return;
  }

  showLoginError('User role is not recognized.');
}

function forgotPassword(event) {
  event.preventDefault();
  showLoginError('Password recovery will be available when backend authentication is connected.');
}

function showLoginError(message) {
  document.getElementById('loginError').innerText = message;
}

function clearLoginError() {
  document.getElementById('loginError').innerText = '';
}

//to preview password
function togglePasswordVisibility(button) {
  const passwordInput = document.getElementById('password');
  const isHidden = passwordInput.type === 'password';

  passwordInput.type = isHidden ? 'text' : 'password';
  button.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}
