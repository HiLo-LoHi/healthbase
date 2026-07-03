const AUTH_USER_KEY = 'healthbase_current_user';
const REMEMBERED_USERNAME_KEY = 'healthbase_remembered_username';

document.addEventListener('DOMContentLoaded', () => {
  const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY);

  if (rememberedUsername) {
    document.getElementById('username').value = rememberedUsername;
    document.getElementById('rememberMe').checked = true;
  }
});

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  clearLoginError();

  if (!username || !password) {
    showLoginError('Please enter username and password.');
    return;
  }

  const user = authenticateFrontendUser(username, password);

  if (!user) {
    showLoginError('Invalid username or password.');
    return;
  }

  if (rememberMe) {
    localStorage.setItem(REMEMBERED_USERNAME_KEY, username);
  } else {
    localStorage.removeItem(REMEMBERED_USERNAME_KEY);
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem('name', user.name);
  localStorage.setItem('role', user.role);

  redirectByRole(user.role, user.residentId);
}

function authenticateFrontendUser(username, password) {
 
 /*DEMO ACCOUNT ONLY FOR FRONTEND TESTING heheh*/
    const users = [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: 'Health Worker'
    },
    {
      username: 'patient',
      password: 'patient123',
      role: 'patient',
      name: 'Community Resident',
      residentId: 'demo-patient'
    }
  ];

  /*end here*/


  return users.find(user =>
    user.username === username &&
    user.password === password
  );
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