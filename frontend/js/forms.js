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

// ---- SAVE CONSULTATION ----
function saveConsultation() {
  if (!canSaveRecords('consultMsg')) return;

  const data = {
    resident: document.getElementById('c-resident').value.trim(),
    date: document.getElementById('c-date').value,
    complaint: document.getElementById('c-complaint').value.trim(),
    diagnosis: document.getElementById('c-diagnosis').value.trim(),
    temperature: document.getElementById('c-temp').value.trim(),
    bloodPressure: document.getElementById('c-bp').value.trim(),
    heartRate: document.getElementById('c-hr').value.trim(),
    worker: getHealthWorkerName('c-worker'),
    notes: document.getElementById('c-notes').value.trim()
  };

  if (!data.resident || !data.date || !data.complaint || !data.diagnosis) {
    showMsg('consultMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  addRecord('consultations', data);
  showMsg('consultMsg', 'Consultation saved.', 'success');
}

// ---- SAVE VACCINATION ----
function saveVaccination() {
  if (!canSaveRecords('vacMsg')) return;

  const data = {
    resident: document.getElementById('v-resident').value.trim(),
    date: document.getElementById('v-date').value,
    vaccine: document.getElementById('v-vaccine').value.trim(),
    dose: document.getElementById('v-dose').value.trim(),
    worker: getHealthWorkerName('topbarName')
  };

  if (!data.resident || !data.date || !data.vaccine) {
    showMsg('vacMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  addRecord('vaccinations', data);
  showMsg('vacMsg', 'Vaccination saved.', 'success');
}

// ---- SAVE MEDICATION ----
function saveMedication() {
  if (!canSaveRecords('medMsg')) return;

  const data = {
    resident: document.getElementById('m-resident').value.trim(),
    name: document.getElementById('m-name').value.trim(),
    dosage: document.getElementById('m-dosage').value.trim(),
    date: document.getElementById('m-date').value,
    duration: document.getElementById('m-duration').value.trim(),
    worker: getHealthWorkerName('topbarName')
  };

  if (!data.resident || !data.name || !data.dosage || !data.date) {
    showMsg('medMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  addRecord('medications', data);
  showMsg('medMsg', 'Medication saved.', 'success');
}

// ---- SAVE RESIDENT ----
function saveResident() {
  if (!canSaveRecords('residentMsg')) return;

  const firstName = document.getElementById('r-firstName').value.trim();
  const lastName = document.getElementById('r-lastName').value.trim();

  const data = {
    firstName: firstName,
    lastName: lastName,
    fullName: `${firstName} ${lastName}`.trim(),
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

  addRecord('residents', data);
  showMsg('residentMsg', 'Resident saved.', 'success');
}