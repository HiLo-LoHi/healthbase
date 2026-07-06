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
  const name = localStorage.getItem('name') || 'Health Worker';
  const role = localStorage.getItem('role') || 'admin';

  alert(`Signed in as ${name} (${role})`);
}