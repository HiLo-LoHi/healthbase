//api url
const API = 'https://healthbase.onrender.com';


const HB_KEYS = {
  residents: 'healthbase_residents',
  consultations: 'healthbase_consultations',
  vaccinations: 'healthbase_vaccinations',
  medications: 'healthbase_medications',
  appointments: 'healthbase_appointments',
  requests: 'healthbase_requests'
};

function getRecords(type) {
  return JSON.parse(localStorage.getItem(HB_KEYS[type])) || [];
}

function saveRecords(type, records) {
  localStorage.setItem(HB_KEYS[type], JSON.stringify(records));
}

function addRecord(type, data) {
  const records = getRecords(type);

  const record = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data
  };

  records.push(record);
  saveRecords(type, records);

  return record;
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}


//to restore shared button functions
function logout() {
  localStorage.removeItem('healthbase_current_user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');

  location.href = 'login.html';
}

function openNotifications() {
  alert('Notifications and reminders will be available soon.');
}

function openAccountMenu() {
  const menu = document.getElementById('accountMenu');
  if (!menu) return;

  menu.classList.toggle('show');
}

document.addEventListener('click', event => {
  const menu = document.getElementById('accountMenu');
  const button = document.getElementById('accountMenuButton');

  if (!menu || !button) return;

  if (!menu.contains(event.target) && !button.contains(event.target)) {
    menu.classList.remove('show');
  }
});

//for authorization
function requireAuth(allowedRoles = []) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const residentId = localStorage.getItem('residentId');

  if (!token) {
    location.href = 'login.html';
    return false;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    if (role === 'patient' || role === 'resident') {
      location.href = residentId
        ? 'resident-profile.html?id=' + encodeURIComponent(residentId)
        : 'login.html';
      return false;
    }

    location.href = 'dashboard.html';
    return false;
  }

  return true;
}

function isPatientRole(role) {
  return role === 'patient' || role === 'resident';
}

function applyRoleBasedUI() {
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'My Account';
  const residentId = localStorage.getItem('residentId');

  const topbarName = document.getElementById('topbarName');
  if (topbarName) topbarName.innerText = name;

  const accountMenuName = document.getElementById('accountMenuName');
if (accountMenuName) accountMenuName.innerText = name;

const accountMenuRole = document.getElementById('accountMenuRole');
if (accountMenuRole) accountMenuRole.innerText = role ? 'Signed in as ' + role : 'Signed in';


  document.querySelectorAll('.admin-only').forEach(el => {
    if (isPatientRole(role)) el.style.display = 'none';
  })

  document.querySelectorAll('.patient-only').forEach(el => {
    el.style.display = isPatientRole(role) ? '' : 'none';
  });

  const myProfileLink = document.getElementById('myProfileLink');
  if (myProfileLink && residentId) {
    myProfileLink.href = 'resident-profile.html?id=' + encodeURIComponent(residentId);
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyRoleBasedUI);
} else {
  applyRoleBasedUI();
}

//
function goToMyProfile() {
  const role = localStorage.getItem('role');
  const residentId = localStorage.getItem('residentId');

  if ((role === 'patient' || role === 'resident') && residentId) {
    location.href = 'resident-profile.html?id=' + encodeURIComponent(residentId);
    return;
  }

  alert('Profile shortcut is only available for linked resident accounts.');
}

document.addEventListener('click', event => {
  const menu = document.getElementById('accountMenu');
  const button = document.getElementById('accountMenuButton');

  if (!menu || !button) return;

  if (!menu.contains(event.target) && !button.contains(event.target)) {
    menu.classList.remove('show');
  }
});