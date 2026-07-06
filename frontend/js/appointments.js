let currentAppointments = [];
let currentRequests = [];
let currentResidents = [];
document.addEventListener('DOMContentLoaded', () => {
  loadAppointmentsPage();

  if (window.location.hash === '#requests') {
    const requestsTab = document.querySelectorAll('.tab')[1];
    showApptTab('requests', requestsTab);
  }
});

async function loadAppointmentsPage() {
  await loadResidentsForAppointments();

  await Promise.all([
    loadAppointments(),
    loadRequests()
  ]);
}

//new
async function loadResidentsForAppointments() {
  try {
    const res = await fetch(API + '/api/residents', {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load residents.');
    }

    currentResidents = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('loadResidentsForAppointments error:', err);
    currentResidents = [];
  }
}



function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem('token');

  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

function showApptTab(name, clickedTab) {
  document.getElementById('appt-appointments').style.display = 'none';
  document.getElementById('appt-requests').style.display = 'none';

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.getElementById('appt-' + name).style.display = 'block';
  clickedTab.classList.add('active');

  if (name === 'requests') {
    history.replaceState(null, '', 'appointments.html#requests');
  } else {
    history.replaceState(null, '', 'appointments.html');
  }
}

function toggleAppointmentForm(show) {
  const form = document.getElementById('newAppointmentCard');
  form.style.display = show ? 'block' : 'none';

  if (!show) {
    clearAppointmentForm();
    clearMessage('apptMsg');
  }
}
//SAVE APPOINMENTSZ
// SAVE APPOINTMENTS
async function saveAppointment() {
  const dateTimeValue = document.getElementById('apptDateTime').value;
  const dateParts = splitDateTime(dateTimeValue);
  const residentName = document.getElementById('apptResident').value.trim();

  const data = {
    dateTime: dateTimeValue,
    date: dateParts.date,
    time: dateParts.time,
    purpose: document.getElementById('apptPurpose').value.trim(),
    worker: document.getElementById('apptWorker').value.trim() || getTopbarName(),
    status: document.getElementById('apptStatus').value
  };

  if (!residentName || !data.dateTime || !data.purpose) {
    showMessage('apptMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  try {
    const resident = await findResidentByName(residentName);

    if (!resident) {
      showMessage('apptMsg', 'Resident not found. Please enter an existing resident name.', 'error');
      return;
    }

    const res = await fetch(API + '/api/appointments', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        residentId: resident._id || resident.id,
        ...data
      })
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      showMessage('apptMsg', result.error || 'Error saving appointment.', 'error');
      return;
    }

    showMessage('apptMsg', 'Appointment saved successfully.', 'success');
    clearAppointmentForm();
    await loadAppointments();

    setTimeout(() => {
      toggleAppointmentForm(false);
    }, 700);
  } catch (err) {
    showMessage('apptMsg', 'Cannot connect to server.', 'error');
    console.error(err);
  }
}
//load APPOINTMENTS
async function loadAppointments() {
  try {
    const res = await fetch(API + '/api/appointments', {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load appointments.');
    }

    currentAppointments = Array.isArray(data) ? data : [];
    renderAppointments();
  } catch (err) {
    console.error('loadAppointments error:', err);
    currentAppointments = [];
    renderTableMessage('apptList', 6, 'Cannot load appointments from server.');
  }
}

function renderAppointments() {
  const appointments = currentAppointments
    .slice()
    .sort((a, b) => new Date(a.dateTime || a.date) - new Date(b.dateTime || b.date));

  if (appointments.length === 0) {
    renderTableMessage('apptList', 6, 'No appointments yet.');
    return;
  }

  const body = document.getElementById('apptList');

  body.innerHTML = appointments.map(item => {
    const id = item._id || item.id;

    return `
      <tr>
        <td>${escapeHtml(formatDateTime(item))}</td>
        <td>${escapeHtml(getResidentDisplayName(item))}</td>
        <td>${escapeHtml(item.purpose || '-')}</td>
        <td>${escapeHtml(item.worker || 'Health Worker')}</td>
        <td>${renderStatusBadge(item.status || 'Pending')}</td>
        <td>
          <button class="btn-action btn-approve" onclick="updateAppointmentStatus('${escapeJsValue(id)}', 'Completed')">
            Complete
          </button>
          <button class="btn-action btn-decline" onclick="updateAppointmentStatus('${escapeJsValue(id)}', 'Cancelled')">
            Cancel
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadRequests() {
  try {
    const res = await fetch(API + '/api/vaccination-drives', {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load requests.');
    }

    currentRequests = Array.isArray(data) ? data : [];
    renderRequests();
  } catch (err) {
    console.error('loadRequests error:', err);
    currentRequests = [];
    renderTableMessage('requestsList', 5, 'Cannot load vaccination drive requests from server.');
  }
}

function renderRequests() {
  const requests = currentRequests
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.dateRequested) - new Date(a.createdAt || a.dateRequested));

  if (requests.length === 0) {
    renderTableMessage('requestsList', 5, 'No vaccination drive requests yet.');
    return;
  }

  const body = document.getElementById('requestsList');

  body.innerHTML = requests.map(item => {
    const id = item._id || item.id;

    return `
      <tr>
        <td>${escapeHtml(getRequestDisplayName(item))}</td>
        <td>${escapeHtml(item.location || '-')}</td>
        <td>${escapeHtml(formatDate(item.dateRequested || item.createdAt))}</td>
        <td>${renderStatusBadge(item.status || 'Pending')}</td>
        <td>${renderRequestActions(id, item.status)}</td>
      </tr>
    `;
  }).join('');
}

function renderRequestActions(id, status) {
  const normalizedStatus = status || 'Pending';

  if (normalizedStatus !== 'Pending') {
    return '<span style="color:var(--gray); font-size:12px;">Reviewed</span>';
  }

  return `
    <button class="btn-action btn-approve" onclick="updateRequestStatus('${escapeJsValue(id)}', 'Approved')">
      Approve
    </button>
    <button class="btn-action btn-decline" onclick="updateRequestStatus('${escapeJsValue(id)}', 'Declined')">
      Decline
    </button>
  `;
}

async function updateAppointmentStatus(id, status) {
  try {
    const res = await fetch(API + '/api/appointments/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Unable to update appointment.');
    }

    await loadAppointments();
  } catch (err) {
    alert('Unable to update appointment status.');
    console.error(err);
  }
}

async function updateRequestStatus(id, status) {
  try {
    const res = await fetch(API + '/api/vaccination-drives/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      body: JSON.stringify({ status })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Unable to update request.');
    }

    await loadRequests();
  } catch (err) {
    alert('Unable to update request status.');
    console.error(err);
  }
}

function clearAppointmentForm() {
  document.getElementById('apptResident').value = '';
  document.getElementById('apptDateTime').value = '';
  document.getElementById('apptPurpose').value = '';
  document.getElementById('apptWorker').value = '';
  document.getElementById('apptStatus').value = 'Pending';
}

function splitDateTime(dateTimeValue) {
  if (!dateTimeValue) {
    return { date: '', time: '' };
  }

  const parts = dateTimeValue.split('T');

  return {
    date: parts[0] || '',
    time: parts[1] || ''
  };
}

function formatDateTime(item) {
  if (item.dateTime) {
    const date = new Date(item.dateTime);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  }

  return `${formatDate(item.date)} ${item.time || ''}`.trim();
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

function renderStatusBadge(status) {
  const normalizedStatus = status || 'Pending';
  let badgeClass = 'badge-gray';

  if (normalizedStatus === 'Approved' || normalizedStatus === 'Confirmed' || normalizedStatus === 'Completed') {
    badgeClass = 'badge-green';
  }

  if (normalizedStatus === 'Pending') {
    badgeClass = 'badge-yellow';
  }

  if (normalizedStatus === 'Declined' || normalizedStatus === 'Cancelled') {
    badgeClass = 'badge-red';
  }

  return `<span class="badge ${badgeClass}">${escapeHtml(normalizedStatus)}</span>`;
}

function renderTableMessage(bodyId, colspan, message) {
  document.getElementById(bodyId).innerHTML = `
    <tr>
      <td colspan="${colspan}" style="text-align:center;color:#aaa;padding:30px;">
        ${escapeHtml(message)}
      </td>
    </tr>
  `;
}

function showMessage(id, message, type) {
  const el = document.getElementById(id);

  el.className = 'form-message ' + type;
  el.innerText = message;
}

function clearMessage(id) {
  const el = document.getElementById(id);

  el.className = '';
  el.innerText = '';
}

function getTopbarName() {
  return document.getElementById('topbarName')?.innerText || 'Health Worker';
}

function escapeJsValue(value) {
  return String(value || '').replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}



//helper funtion
async function findResidentByName(name) {
  const res = await fetch(API + '/api/residents', {
    headers: getAuthHeaders()
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


//helper function to display name not 'unknown' for AppointmentsxResidents
function getResidentDisplayName(item) {
  if (item.resident) return item.resident;
  if (item.residentName) return item.residentName;

  if (item.residentId && typeof item.residentId === 'object') {
    return getResidentName(item.residentId);
  }

  const resident = currentResidents.find(person =>
    String(person._id || person.id) === String(item.residentId)
  );

  return resident ? getResidentName(resident) : 'Unknown resident';
}

//helper function:for formatting of resident name
function getResidentName(resident) {
  return `${resident.firstName || ''} ${resident.lastName || ''}`.trim() || 'Unknown resident';
}

//helper function to display name not 'unknown' for Residentx Vaccine Request
function getRequestDisplayName(item) {
  if (item.requester) return item.requester;
  if (item.residentName) return item.residentName;
  if (item.resident) return item.resident;
  if (item.firstName || item.lastName) return getResidentName(item);

  if (item.residentId && typeof item.residentId === 'object') {
    return getResidentName(item.residentId);
  }

  const id = item.residentId || item.requesterId || item.userId;

  const resident = currentResidents.find(person =>
    String(person._id || person.id) === String(id)
  );

  return resident ? getResidentName(resident) : 'Unknown requester';
}