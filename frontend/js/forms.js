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
    notes: document.getElementById('c-notes').value.trim()
  };

  if (!residentName || !data.visitDate || !data.complaint || !data.diagnosis) {
    showMsg('consultMsg', 'Please fill in all required fields.', 'error');
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
async function saveMedication() {
  const token = localStorage.getItem('token');
  const residentName = document.getElementById('m-resident').value.trim();

  const data = {
    medicineName: document.getElementById('m-name').value.trim(),
    dosage: document.getElementById('m-dosage').value.trim(),
    prescribedDate: document.getElementById('m-date').value,
    duration: document.getElementById('m-duration').value.trim()
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