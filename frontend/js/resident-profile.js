let currentResident = null;

// Loads resident info first, then optional health records.
async function loadResidentProfile() {
  const residentId = getQueryParam('id');

  if (!residentId) {
    showProfileError('Resident ID is missing.');
    clearProfileTables();
    return;
  }

  try {
    const residentResult = await apiGet('/api/residents/' + encodeURIComponent(residentId));
    currentResident = unwrapApiData(residentResult, 'resident');

    renderProfileHeader(currentResident);
    renderPersonalInfo(currentResident);

    const [consultations, vaccinations, medications] = await Promise.all([
      safeApiGet('/api/consultations?residentId=' + encodeURIComponent(residentId), []),
      safeApiGet('/api/vaccinations?residentId=' + encodeURIComponent(residentId), []),
      safeApiGet('/api/medications?residentId=' + encodeURIComponent(residentId), [])
    ]);

    renderMedicalSummary(currentResident, consultations);
    renderRecentConsultations(consultations);
    renderRecentVaccinations(vaccinations);
    renderAllConsultations(consultations);
    renderAllVaccinations(vaccinations);
    renderAllMedications(medications);
  } catch (err) {
    console.error('loadResidentProfile error:', err);
    showProfileError('Unable to load resident profile.');
    clearProfileTables();
  }
}

// Handles either direct data or wrapped backend response.
function unwrapApiData(data, key) {
  if (data && data[key]) return data[key];
  return data;
}

// Renders the main resident header area.
function renderProfileHeader(resident) {
  const fullName = getResidentFullName(resident);
  const age = getAge(resident.birthdate);
  const meta = [
    resident.sex,
    age !== null ? age + ' years old' : null,
    resident.bloodType
  ].filter(Boolean).join(' | ');

  setText('pName', fullName);
  setText('pMeta', meta || '--');
  setText('pContact', resident.contact || '--');
  setText('pAddress', resident.address || '--');
}

// Renders personal information fields if those IDs exist in HTML.
function renderPersonalInfo(resident) {
  const healthId = resident.healthNo || resident.healthId || resident._id || resident.id || '--';

  setText('pName', getResidentFullName(resident));
  setText('pBirthdate', formatDate(resident.birthdate));
  setText('pSex', resident.sex || '--');
  setText('pContact', resident.contact || '--');
  setText('pAddress', resident.address || '--');
  setText('pBlood', resident.bloodType || '--');
  setText('pBloodType', resident.bloodType || '--');
  setText('pOccupation', resident.occupation || '--');
  setText('pHealthId', healthId);
}
// Renders allergies and conditions summary.
function renderMedicalSummary(resident, consultations) {
  setText('pAllergies', resident.allergies || 'None');

  const conditions = consultations
    .map(item => item.diagnosis)
    .filter(Boolean);

  const uniqueConditions = [...new Set(conditions)];

  setText(
    'pConditions',
    uniqueConditions.length ? uniqueConditions.join(', ') : 'None'
  );
}

// Renders latest 3 consultations.
function renderRecentConsultations(consultations) {
  const body = document.getElementById('recentConsult');
  if (!body) return;

  const recent = consultations.slice(0, 3);

  if (recent.length === 0) {
    body.innerHTML = emptyRow(3, 'No consultations yet.');
    return;
  }

  body.innerHTML = recent.map(item => `
    <tr>
      <td>${escapeHtml(formatDate(item.visitDate || item.date || item.createdAt))}</td>
      <td>${escapeHtml(item.complaint || '-')}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
    </tr>
  `).join('');
}

// Renders latest 3 vaccinations.
function renderRecentVaccinations(vaccinations) {
  const body = document.getElementById('recentVax');
  if (!body) return;

  const recent = vaccinations.slice(0, 3);

  if (recent.length === 0) {
    body.innerHTML = emptyRow(2, 'No vaccinations yet.');
    return;
  }

  body.innerHTML = recent.map(item => `
    <tr>
      <td>${escapeHtml(item.vaccineType || item.vaccine || '-')}</td>
      <td>${escapeHtml(formatDate(item.dateAdministered || item.date || item.createdAt))}</td>
    </tr>
  `).join('');
}

// Renders full consultation history.
function renderAllConsultations(consultations) {
  const body = document.getElementById('allConsult');
  if (!body) return;

  if (consultations.length === 0) {
    body.innerHTML = emptyRow(4, 'No consultations yet.');
    return;
  }

  body.innerHTML = consultations.map(item => `
    <tr>
      <td>${escapeHtml(formatDate(item.visitDate || item.date || item.createdAt))}</td>
      <td>${escapeHtml(item.complaint || '-')}</td>
      <td>${escapeHtml(item.diagnosis || '-')}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
    </tr>
  `).join('');
}

// Renders full vaccination history.
function renderAllVaccinations(vaccinations) {
  const body = document.getElementById('allVax');
  if (!body) return;

  if (vaccinations.length === 0) {
    body.innerHTML = emptyRow(3, 'No vaccinations yet.');
    return;
  }

  body.innerHTML = vaccinations.map(item => `
    <tr>
      <td>${escapeHtml(item.vaccineType || item.vaccine || '-')}</td>
      <td>${escapeHtml(item.doseNumber || item.dose || '-')}</td>
      <td>${escapeHtml(formatDate(item.dateAdministered || item.date || item.createdAt))}</td>
    </tr>
  `).join('');
}

// Renders full medication history.
function renderAllMedications(medications) {
  const body = document.getElementById('allMeds');
  if (!body) return;

  if (medications.length === 0) {
    body.innerHTML = emptyRow(4, 'No medications yet.');
    return;
  }

  body.innerHTML = medications.map(item => `
    <tr>
      <td>${escapeHtml(item.medicineName || item.name || '-')}</td>
      <td>${escapeHtml(item.dosage || '-')}</td>
      <td>${escapeHtml(formatDate(item.prescribedDate || item.date || item.createdAt))}</td>
      <td>${escapeHtml(item.duration || '-')}</td>
    </tr>
  `).join('');
}

// Switches between profile tabs.
function showProfileTab(name, clickedTab) {
  ['overview', 'consultations', 'vaccinations', 'medications'].forEach(tabName => {
    const section = document.getElementById('prof-' + tabName);
    if (section) section.style.display = 'none';
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  const target = document.getElementById('prof-' + name);
  if (target) target.style.display = name === 'overview' ? 'grid' : 'block';

  if (clickedTab) clickedTab.classList.add('active');
}

// Placeholder for future edit feature.
function editResident() {
  alert('Editing resident details will be connected when the backend is ready.');
}

// Shows profile-level error message.
function showProfileError(message) {
  setText('pName', message);
  setText('pMeta', '');
  setText('pContact', '');
  setText('pAddress', '');
  setText('pBlood', '');
}

// Clears table sections safely.
function clearProfileTables() {
  setTableHtml('recentConsult', emptyRow(3, 'No consultations available.'));
  setTableHtml('recentVax', emptyRow(2, 'No vaccinations available.'));
  setTableHtml('allConsult', emptyRow(4, 'No consultations available.'));
  setTableHtml('allVax', emptyRow(3, 'No vaccinations available.'));
  setTableHtml('allMeds', emptyRow(4, 'No medications available.'));
}

// Reads query string values like ?id=...
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Builds resident full name.
function getResidentFullName(resident) {
  return `${resident.firstName || ''} ${resident.lastName || ''}`.trim() || '--';
}

// Calculates age from birthdate.
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

// Formats date for display.
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

// Creates an empty table row.
function emptyRow(colspan, message) {
  return `
    <tr>
      <td colspan="${colspan}" style="text-align:center;color:#aaa;padding:24px;">
        ${escapeHtml(message)}
      </td>
    </tr>
  `;
}

// Prevents unsafe HTML injection.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Fetches JSON from backend API.
async function apiGet(path) {
  if (typeof API === 'undefined') {
    throw new Error('API URL is not loaded. Make sure data-store.js loads before resident-profile.js.');
  }

  const token = localStorage.getItem('token');

  const res = await fetch(API + path, {
    headers: token ? { Authorization: 'Bearer ' + token } : {}
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}

// Fetches optional data without breaking the profile page.
async function safeApiGet(path, fallback) {
  try {
    return await apiGet(path);
  } catch (err) {
    console.warn('Optional profile data failed:', path, err);
    return fallback;
  }
}

// Safely updates text if the element exists.
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value || '--';
}

// Safely updates table HTML if the element exists.
function setTableHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// Starts profile loading whether script loads before or after DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadResidentProfile);
} else {
  loadResidentProfile();
}