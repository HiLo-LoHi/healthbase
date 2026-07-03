document.addEventListener('DOMContentLoaded', loadResidentProfile);

let currentResident = null;

function loadResidentProfile() {
  if (typeof getRecords !== 'function') {
    showProfileError('Unable to load profile. Please make sure data-store.js is loaded.');
    return;
  }

  const residentId = getQueryParam('id');
  const residents = getRecords('residents');

  currentResident = residents.find(resident =>
    String(resident.id) === String(residentId)
  );

  if (!currentResident) {
    showProfileError('Resident record not found.');
    clearProfileTables();
    return;
  }

  const consultations = getResidentRecords('consultations', currentResident);
  const vaccinations = getResidentRecords('vaccinations', currentResident);
  const medications = getResidentRecords('medications', currentResident);

  renderProfileHeader(currentResident);
  renderPersonalInfo(currentResident);
  renderMedicalSummary(currentResident, consultations);
  renderRecentConsultations(consultations);
  renderRecentVaccinations(vaccinations);
  renderAllConsultations(consultations);
  renderAllVaccinations(vaccinations);
  renderAllMedications(medications);
}

function renderProfileHeader(resident) {
  const fullName = getResidentName(resident);
  const age = getAge(resident.birthdate);

  document.getElementById('pName').innerText = fullName;
  document.getElementById('pMeta').innerText = [
    age !== null ? `${age} years old` : 'Age not set',
    resident.sex || 'Sex not set'
  ].join(' • ');

  document.getElementById('pContact').innerText =
    resident.contact ? `Contact: ${resident.contact}` : 'Contact: —';

  document.getElementById('pAddress').innerText =
    resident.address ? `Address: ${resident.address}` : 'Address: —';

  document.getElementById('pBlood').innerText =
    resident.bloodType ? `Blood Type: ${resident.bloodType}` : 'Blood Type: Unknown';
}

function renderPersonalInfo(resident) {
  document.getElementById('pCivil').innerText = resident.civilStatus || '—';
  document.getElementById('pOccupation').innerText = resident.occupation || '—';
  document.getElementById('pHealthId').innerText = resident.healthId || resident.id || '—';
}

function renderMedicalSummary(resident, consultations) {
  document.getElementById('pAllergies').innerText = resident.allergies || 'None';

  const conditions = consultations
    .map(item => item.diagnosis)
    .filter(Boolean);

  const uniqueConditions = [...new Set(conditions)];

  document.getElementById('pConditions').innerText =
    uniqueConditions.length ? uniqueConditions.join(', ') : 'None';
}

function renderRecentConsultations(consultations) {
  const body = document.getElementById('recentConsult');
  const recent = consultations.slice(0, 3);

  if (recent.length === 0) {
    body.innerHTML = emptyRow(3, 'No consultations yet.');
    return;
  }

  body.innerHTML = recent.map(item => `
    <tr>
      <td>${escapeHtml(formatDate(item.date))}</td>
      <td>${escapeHtml(item.complaint || '-')}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
    </tr>
  `).join('');
}

function renderRecentVaccinations(vaccinations) {
  const body = document.getElementById('recentVax');
  const recent = vaccinations.slice(0, 3);

  if (recent.length === 0) {
    body.innerHTML = emptyRow(2, 'No vaccinations yet.');
    return;
  }

  body.innerHTML = recent.map(item => `
    <tr>
      <td>${escapeHtml(item.vaccine || '-')}</td>
      <td>${escapeHtml(formatDate(item.date))}</td>
    </tr>
  `).join('');
}

function renderAllConsultations(consultations) {
  const body = document.getElementById('allConsult');

  if (consultations.length === 0) {
    body.innerHTML = emptyRow(4, 'No consultations yet.');
    return;
  }

  body.innerHTML = consultations.map(item => `
    <tr>
      <td>${escapeHtml(formatDate(item.date))}</td>
      <td>${escapeHtml(item.complaint || '-')}</td>
      <td>${escapeHtml(item.diagnosis || '-')}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
    </tr>
  `).join('');
}

function renderAllVaccinations(vaccinations) {
  const body = document.getElementById('allVax');

  if (vaccinations.length === 0) {
    body.innerHTML = emptyRow(3, 'No vaccinations yet.');
    return;
  }

  body.innerHTML = vaccinations.map(item => `
    <tr>
      <td>${escapeHtml(item.vaccine || '-')}</td>
      <td>${escapeHtml(item.dose || '-')}</td>
      <td>${escapeHtml(formatDate(item.date))}</td>
    </tr>
  `).join('');
}

function renderAllMedications(medications) {
  const body = document.getElementById('allMeds');

  if (medications.length === 0) {
    body.innerHTML = emptyRow(4, 'No medications yet.');
    return;
  }

  body.innerHTML = medications.map(item => `
    <tr>
      <td>${escapeHtml(item.name || '-')}</td>
      <td>${escapeHtml(item.dosage || '-')}</td>
      <td>${escapeHtml(formatDate(item.date))}</td>
      <td>${escapeHtml(item.duration || '-')}</td>
    </tr>
  `).join('');
}

function getResidentRecords(type, resident) {
  const records = getRecords(type);
  const fullName = getResidentName(resident).toLowerCase();

  return records
    .filter(item => {
      if (item.residentId && resident.id) {
        return String(item.residentId) === String(resident.id);
      }

      return item.resident &&
        item.resident.toLowerCase() === fullName;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function showProfileTab(name, clickedTab) {
  ['overview', 'consultations', 'vaccinations', 'medications', 'files'].forEach(tabName => {
    const section = document.getElementById('prof-' + tabName);
    if (section) section.style.display = 'none';
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  const target = document.getElementById('prof-' + name);

  if (target) {
    target.style.display = name === 'overview' ? 'grid' : 'block';
  }

  clickedTab.classList.add('active');
}

function editResident() {
  alert('Editing resident details will be connected when the backend is ready.');
}

function showProfileError(message) {
  document.getElementById('pName').innerText = message;
  document.getElementById('pMeta').innerText = '';
  document.getElementById('pContact').innerText = '';
  document.getElementById('pAddress').innerText = '';
  document.getElementById('pBlood').innerText = '';
}

function clearProfileTables() {
  document.getElementById('recentConsult').innerHTML = emptyRow(3, 'No consultations available.');
  document.getElementById('recentVax').innerHTML = emptyRow(2, 'No vaccinations available.');
  document.getElementById('allConsult').innerHTML = emptyRow(4, 'No consultations available.');
  document.getElementById('allVax').innerHTML = emptyRow(3, 'No vaccinations available.');
  document.getElementById('allMeds').innerHTML = emptyRow(4, 'No medications available.');
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getResidentName(resident) {
  if (resident.fullName) return resident.fullName;

  return `${resident.firstName || ''} ${resident.lastName || ''}`.trim() || 'Unnamed Resident';
}

function getAge(birthdate) {
  if (!birthdate) return null;

  const birth = new Date(birthdate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function formatDate(dateValue) {
  if (!dateValue) return '-';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return dateValue;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
}

function emptyRow(colspan, message) {
  return `
    <tr>
      <td colspan="${colspan}" style="text-align:center;color:#aaa;padding:24px;">
        ${escapeHtml(message)}
      </td>
    </tr>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}