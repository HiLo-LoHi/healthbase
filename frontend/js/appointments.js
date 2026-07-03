document.addEventListener('DOMContentLoaded', () => {
  loadAppointmentsPage();

  if (window.location.hash === '#requests') {
    const requestsTab = document.querySelectorAll('.tab')[1];
    showApptTab('requests', requestsTab);
  }
});

function loadAppointmentsPage() {
  if (typeof getRecords !== 'function') {
    renderTableMessage('apptList', 6, 'Unable to load appointments. Please make sure data-store.js is loaded.');
    renderTableMessage('requestsList', 5, 'Unable to load requests. Please make sure data-store.js is loaded.');
    return;
  }

  renderAppointments();
  renderRequests();
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

function saveAppointment() {
  if (typeof addRecord !== 'function') {
    showMessage('apptMsg', 'Unable to save. Please make sure data-store.js is loaded.', 'error');
    return;
  }

  const dateTimeValue = document.getElementById('apptDateTime').value;
  const dateParts = splitDateTime(dateTimeValue);

  const data = {
    resident: document.getElementById('apptResident').value.trim(),
    dateTime: dateTimeValue,
    date: dateParts.date,
    time: dateParts.time,
    purpose: document.getElementById('apptPurpose').value.trim(),
    worker: document.getElementById('apptWorker').value.trim() || getTopbarName(),
    status: document.getElementById('apptStatus').value
  };

  if (!data.resident || !data.dateTime || !data.purpose) {
    showMessage('apptMsg', 'Please fill in all required fields.', 'error');
    return;
  }

  addRecord('appointments', data);

  showMessage('apptMsg', 'Appointment saved.', 'success');
  clearAppointmentForm();
  renderAppointments();

  setTimeout(() => {
    toggleAppointmentForm(false);
  }, 700);
}

function renderAppointments() {
  const appointments = getRecords('appointments')
    .sort((a, b) => new Date(a.dateTime || a.date) - new Date(b.dateTime || b.date));

  if (appointments.length === 0) {
    renderTableMessage('apptList', 6, 'No appointments yet.');
    return;
  }

  const body = document.getElementById('apptList');

  body.innerHTML = appointments.map(item => `
    <tr>
      <td>${escapeHtml(formatDateTime(item))}</td>
      <td>${escapeHtml(item.resident || 'Unknown resident')}</td>
      <td>${escapeHtml(item.purpose || '-')}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
      <td>${renderStatusBadge(item.status || 'Pending')}</td>
      <td>
        <button class="btn-action btn-approve" onclick="updateAppointmentStatus('${item.id}', 'Completed')">
          Complete
        </button>
        <button class="btn-action btn-decline" onclick="updateAppointmentStatus('${item.id}', 'Cancelled')">
          Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

function renderRequests() {
  const requests = getRecords('requests')
    .sort((a, b) => new Date(b.createdAt || b.dateRequested) - new Date(a.createdAt || a.dateRequested));

  if (requests.length === 0) {
    renderTableMessage('requestsList', 5, 'No vaccination drive requests yet.');
    return;
  }

  const body = document.getElementById('requestsList');

  body.innerHTML = requests.map(item => `
    <tr>
      <td>${escapeHtml(item.requester || item.resident || 'Unknown requester')}</td>
      <td>${escapeHtml(item.location || '-')}</td>
      <td>${escapeHtml(formatDate(item.dateRequested || item.createdAt))}</td>
      <td>${renderStatusBadge(item.status || 'Pending')}</td>
      <td>${renderRequestActions(item)}</td>
    </tr>
  `).join('');
}

function renderRequestActions(item) {
  const status = item.status || 'Pending';

  if (status !== 'Pending') {
    return '<span style="color:var(--gray); font-size:12px;">Reviewed</span>';
  }

  return `
    <button class="btn-action btn-approve" onclick="updateRequestStatus('${item.id}', 'Approved')">
      Approve
    </button>
    <button class="btn-action btn-decline" onclick="updateRequestStatus('${item.id}', 'Declined')">
      Decline
    </button>
  `;
}

function updateAppointmentStatus(id, status) {
  const appointments = getRecords('appointments');
  const updated = appointments.map(item =>
    String(item.id) === String(id)
      ? { ...item, status: status, updatedAt: new Date().toISOString() }
      : item
  );

  saveRecords('appointments', updated);
  renderAppointments();
}

function updateRequestStatus(id, status) {
  const requests = getRecords('requests');
  const updated = requests.map(item =>
    String(item.id) === String(id)
      ? { ...item, status: status, reviewedAt: new Date().toISOString() }
      : item
  );

  saveRecords('requests', updated);
  renderRequests();
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}