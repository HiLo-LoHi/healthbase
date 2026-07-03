// API base URL — replace with Castillo's Render URL in Week 3
const API = 'http://localhost:5000';

// ---- LOGIN ----
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  if (!username || !password) {
    document.getElementById('loginError').innerText = 'Please enter username and password.';
    return;
  }
  // Temporary — real fetch() added in Week 3
  console.log('Login attempt:', username);
  document.getElementById('loginError').innerText = 'Backend not connected yet — Week 3.';
}

// ---- LOAD RESIDENTS (placeholder) ----
function loadResidents(name) {
  const list = document.getElementById('residentList');
  if (list) {
    list.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px;">' +
      'Backend not connected yet — Week 3.</p>';
  }
}

function searchResidents() {
  const q = document.getElementById('searchInput').value;
  loadResidents(q);
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  loadResidents('');
}

// ---- TOPBAR NAME ----
const savedName = localStorage.getItem('name');
if (savedName && document.getElementById('topbarName')) {
  document.getElementById('topbarName').innerText = savedName;
}

// Load residents on residents.html
if (document.getElementById('residentList')) loadResidents('');


function logout() {
  localStorage.removeItem('healthbase_current_user');
  localStorage.removeItem('role');
  localStorage.removeItem('name');

  location.href = 'login.html';
}

function openNotifications() {
  alert('Notifications and reminders will be available soon.');
}

function openAccountMenu() {
  const name = localStorage.getItem('name') || 'Health Worker';
  const role = localStorage.getItem('role') || 'admin';

  alert(`Signed in as ${name} (${role})`);
}