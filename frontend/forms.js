// ---- TAB CLEAR ----
function clearTab(tabName) {
  document.getElementById('tab-' + tabName)
    .querySelectorAll('input, select, textarea')
    .forEach(el => el.value = '');
}

// ---- SHOW MESSAGE HELPER ----
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.className = 'form-message ' + type;
  el.innerText = text;
  setTimeout(() => el.innerText = '', 4000);
}

// ---- SAVE CONSULTATION ----
function saveConsultation() {
  const data = {
    resident:    document.getElementById('c-resident').value,
    date:        document.getElementById('c-date').value,
    complaint:   document.getElementById('c-complaint').value,
    diagnosis:   document.getElementById('c-diagnosis').value,
    temperature: document.getElementById('c-temp').value,
    bloodPressure: document.getElementById('c-bp').value,
    heartRate:   document.getElementById('c-hr').value,
    notes:       document.getElementById('c-notes').value
  };
  if (!data.resident || !data.date || !data.complaint || !data.diagnosis) {
    showMsg('consultMsg', '❌ Please fill in all required fields.', 'error');
    return;
  }
  console.log('Consultation to save:', data);
  showMsg('consultMsg', '✅ Consultation saved! (backend connects in Week 3)', 'success');
}

// ---- SAVE VACCINATION ----
function saveVaccination() {
  const data = {
    resident: document.getElementById('v-resident').value,
    date:     document.getElementById('v-date').value,
    vaccine:  document.getElementById('v-vaccine').value,
    dose:     document.getElementById('v-dose').value
  };
  if (!data.resident || !data.date || !data.vaccine) {
    showMsg('vacMsg', '❌ Please fill in all required fields.', 'error');
    return;
  }
  console.log('Vaccination to save:', data);
  showMsg('vacMsg', '✅ Vaccination saved! (backend connects in Week 3)', 'success');
}

// ---- SAVE MEDICATION ----
function saveMedication() {
  const data = {
    resident: document.getElementById('m-resident').value,
    name:     document.getElementById('m-name').value,
    dosage:   document.getElementById('m-dosage').value,
    date:     document.getElementById('m-date').value,
    duration: document.getElementById('m-duration').value
  };
  if (!data.resident || !data.name || !data.dosage || !data.date) {
    showMsg('medMsg', '❌ Please fill in all required fields.', 'error');
    return;
  }
  console.log('Medication to save:', data);
  showMsg('medMsg', '✅ Medication saved! (backend connects in Week 3)', 'success');
}

// ---- SAVE RESIDENT ----
function saveResident() {
  const data = {
    firstName:  document.getElementById('r-firstName').value,
    lastName:   document.getElementById('r-lastName').value,
    birthdate:  document.getElementById('r-birthdate').value,
    sex:        document.getElementById('r-sex').value,
    address:    document.getElementById('r-address').value,
    contact:    document.getElementById('r-contact').value,
    bloodType:  document.getElementById('r-blood').value,
    occupation: document.getElementById('r-occupation').value
  };
  if (!data.firstName || !data.lastName || !data.birthdate || !data.sex || !data.address) {
    showMsg('residentMsg', '❌ Please fill in all required fields.', 'error');
    return;
  }
  console.log('Resident to save:', data);
  showMsg('residentMsg', '✅ Resident saved! (backend connects in Week 3)', 'success');
}