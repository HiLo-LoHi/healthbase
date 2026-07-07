// ---- TAB CLEAR ----
function clearTab(tabName) {
  const tab = document.getElementById('tab-' + tabName);

  if (!tab) return;

  tab.querySelectorAll('input, select, textarea')
    .forEach(el => el.value = '');
}

// ---- SHOW MESSAGE HELPER ----
function showMsg(id, text, type) {
  const el = document.getElementById(id);

  if (!el) return;

  el.className = 'form-message ' + type;
  el.innerText = text;

  setTimeout(() => {
    el.innerText = '';
    el.className = '';
  }, 4000);
}

// ---- STORAGE CHECK ----
function canSaveRecords(messageId) {
  if (typeof addRecord !== 'function') {
    showMsg(
      messageId,
      'Unable to save. Please make sure data-store.js is loaded before forms.js.',
      'error'
    );
    return false;
  }

  return true;
}

// ---- GET HEALTH WORKER NAME ----
function getHealthWorkerName(selectId) {
  const selectedWorker = document.getElementById(selectId)?.value;
  const topbarName = document.getElementById('topbarName')?.innerText;

  return selectedWorker || topbarName || 'Health Worker';
}

// ---- (NEW) SAVE CONSULTAION----//
async function saveConsultation() {
  const token = localStorage.getItem('token');
  const residentName = document.getElementById('c-resident').value.trim();

  const data = {
    visitDate: document.getElementById('c-date').value,
    complaint: document.getElementById('c-complaint').value.trim(),
    diagnosis: document.getElementById('c-diagnosis').value.trim(),
    temperature: document.getElementById('c-temp').value.trim(),
    bloodPressure: document.getElementById('c-bp').value.trim(),
    heartRate: document.getElementById('c-hr').value.trim(),
    worker: getHealthWorkerName('c-worker'),
    notes: document.getElementById('c-notes').value.trim()
  };

  if (!residentName || !data.visitDate || !data.complaint || !data.diagnosis) {
    showMsg('consultMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  if (data.temperature && !isDecimalNumber(data.temperature)) {
    showMsg('consultMsg', 'Please enter a valid temperature. Use numbers only, with optional decimal point.', 'error');
    return;
  }

  if (data.heartRate && !isDecimalNumber(data.heartRate)) {
    showMsg('consultMsg', 'Please enter a valid heart rate. Use numbers only, with optional decimal point.', 'error');
    return;
  }

  if (data.bloodPressure && !isBloodPressure(data.bloodPressure)) {
    showMsg('consultMsg', 'Please enter a valid blood pressure. Use numbers and one slash, like 120/80.', 'error');
    return;
  }

  try {
    const resident = await findResidentByName(residentName, token);

    if (!resident) {
      showMsg('consultMsg', 'Resident not found. Please enter an existing resident name.', 'error');
      return;
    }

    const res = await fetch(API + '/api/consultations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        residentId: resident._id || resident.id,
        ...data
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      showMsg('consultMsg', result.error || 'Error saving consultation.', 'error');
      return;
    }

    showMsg('consultMsg', 'Consultation saved successfully.', 'success');
    clearTab('consultation');
  } catch (err) {
    showMsg('consultMsg', 'Cannot connect to server.', 'error');
    console.error(err);
  }
}


// ---- new save vaccination
async function saveVaccination() {
  const token = localStorage.getItem('token');
  const residentName = document.getElementById('v-resident').value.trim();

  const data = {
    dateAdministered: document.getElementById('v-date').value,
    vaccineType: document.getElementById('v-vaccine').value.trim(),
    doseNumber: document.getElementById('v-dose').value.trim()
  };

  if (!residentName || !data.dateAdministered || !data.vaccineType) {
    showMsg('vacMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    const resident = await findResidentByName(residentName, token);

    if (!resident) {
      showMsg('vacMsg', 'Resident not found. Please enter an existing resident name.', 'error');
      return;
    }

    const res = await fetch(API + '/api/vaccinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        residentId: resident._id || resident.id,
        ...data
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      showMsg('vacMsg', result.error || 'Error saving vaccination.', 'error');
      return;
    }

    showMsg('vacMsg', 'Vaccination saved successfully.', 'success');
    clearTab('vaccination');
  } catch (err) {
    showMsg('vacMsg', 'Cannot connect to server.', 'error');
    console.error(err);
  }
}

// ---- SAVE MEDICATION ----
// ---- SAVE MEDICATION ----
async function saveMedication() {
  const token = localStorage.getItem('token');
  const residentName = document.getElementById('m-resident').value.trim();

  const durationValue = document.getElementById('m-duration-value')?.value.trim() || '';
  const durationUnit = document.getElementById('m-duration-unit')?.value || '';
  const duration = durationValue && durationUnit ? `${durationValue} ${durationUnit}` : '';

  if ((durationValue && !durationUnit) || (!durationValue && durationUnit)) {
    showMsg('medMsg', 'Please complete the medication duration with both number and unit.', 'error');
    return;
  }

  if (durationValue && !isPositiveInteger(durationValue)) {
    showMsg('medMsg', 'Please enter a valid medication duration number.', 'error');
    return;
  }

  const data = {
    medicineName: document.getElementById('m-name').value.trim(),
    dosage: document.getElementById('m-dosage').value.trim(),
    prescribedDate: document.getElementById('m-date').value,
    duration: duration
  };

  if (!residentName || !data.medicineName || !data.dosage || !data.prescribedDate) {
    showMsg('medMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    const resident = await findResidentByName(residentName, token);

    if (!resident) {
      showMsg('medMsg', 'Resident not found. Please enter an existing resident name.', 'error');
      return;
    }

    const res = await fetch(API + '/api/medications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        residentId: resident._id || resident.id,
        ...data
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      showMsg('medMsg', result.error || 'Error saving medication.', 'error');
      return;
    }

    showMsg('medMsg', 'Medication saved successfully.', 'success');
    clearTab('medication');
  } catch (err) {
    showMsg('medMsg', 'Cannot connect to server.', 'error');
    console.error(err);
  }
}

// ---- SAVE RESIDENT ----
async function saveResident() {
  const token = localStorage.getItem('token');

  const data = {
    firstName: document.getElementById('r-firstName').value.trim(),
    lastName: document.getElementById('r-lastName').value.trim(),
    birthdate: document.getElementById('r-birthdate').value,
    sex: document.getElementById('r-sex').value,
    address: document.getElementById('r-address').value.trim(),
    contact: document.getElementById('r-contact').value.trim(),
    bloodType: document.getElementById('r-blood').value,
    occupation: document.getElementById('r-occupation').value.trim()
  };

  if (!data.firstName || !data.lastName || !data.birthdate || !data.sex || !data.address) {
    showMsg('residentMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    const res = await fetch(API + '/api/residents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      showMsg('residentMsg', result.error || 'Error saving resident.', 'error');
      return;
    }

    showMsg('residentMsg', 'Resident saved successfully.', 'success');
    clearTab('addResident');
  } catch (err) {
    showMsg('residentMsg', 'Cannot connect to server.', 'error');
    console.error(err);
  }
}
//(NEW) helper funcitonn
async function findResidentByName(name, token) {
  const res = await fetch(API + '/api/residents', {
    headers: { Authorization: 'Bearer ' + token }
  });

  const residents = await res.json();

  if (!res.ok || !Array.isArray(residents)) {
    throw new Error('Unable to load residents.');
  }

  const searchName = normalizeName(name);

  return residents.find(resident =>
    normalizeName(`${resident.firstName || ''} ${resident.lastName || ''}`) === searchName
  ) || residents.find(resident =>
    normalizeName(`${resident.firstName || ''} ${resident.lastName || ''}`).includes(searchName)
  );
}

function normalizeName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

let residentSuggestions = [];

// Loads residents for name suggestions in health logging forms.
document.addEventListener('DOMContentLoaded', () => {
  loadResidentSuggestions();
  setupHealthInputValidation();
});

async function loadResidentSuggestions() {
  if (typeof API === 'undefined') return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(API + '/api/residents', {
      headers: token ? { Authorization: 'Bearer ' + token } : {}
    });

    const residents = await res.json();

    if (!res.ok || !Array.isArray(residents)) return;

    residentSuggestions = residents.map(resident => ({
      id: resident._id || resident.id,
      name: `${resident.firstName || ''} ${resident.lastName || ''}`.trim(),
      address: resident.address || ''
    })).filter(item => item.name);

    renderResidentOptions();
  } catch (err) {
    console.error('Unable to load resident suggestions:', err);
  }
}

function renderResidentOptions() {
  const list = document.getElementById('residentOptions');
  if (!list) return;

  list.innerHTML = residentSuggestions.map(item => `
    <option value="${escapeHtml(item.name)}">${escapeHtml(item.address)}</option>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

//helper for validation message 
// ---- INPUT VALIDATION HELPERS ----
function isDecimalNumber(value) {
  return /^\d+(\.\d+)?$/.test(value);
}

function isBloodPressure(value) {
  return /^\d+\/\d+$/.test(value);
}

function isPositiveInteger(value) {
  return /^[1-9]\d*$/.test(value);
}

// Shows a message immediately when invalid characters are typed.
function setupHealthInputValidation() {
  restrictInput('c-temp', /^\d*\.?\d*$/, 'Please enter a valid temperature.');
  restrictInput('c-hr', /^\d*\.?\d*$/, 'Please enter a valid heart rate.');
  restrictInput('c-bp', /^\d*\/?\d*$/, 'Please enter a valid blood pressure.');
}

function restrictInput(inputId, allowedPattern, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.addEventListener('beforeinput', event => {
    if (!event.data) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const nextValue = input.value.slice(0, start) + event.data + input.value.slice(end);

    if (!allowedPattern.test(nextValue)) {
      event.preventDefault();
      showMsg('consultMsg', message, 'error');
    }
  });
}