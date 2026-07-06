document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  try {
    const [residents, consultations, vaccinations, medications, appointments] =
      await Promise.all([
        fetchJson('/api/residents', headers),
        fetchJson('/api/consultations', headers),
        fetchJson('/api/vaccinations', headers),
        fetchJson('/api/medications', headers),
        fetchJson('/api/appointments', headers)
      ]);

    document.getElementById('totalResidents').innerText = residents.length;
    document.getElementById('totalCases').innerText = consultations.length;
    document.getElementById('vaccinationRate').innerText =
     calculateVaccinationRate(residents, vaccinations) + '%';
    document.getElementById('appointmentsToday').innerText =
      appointments.filter(isTodayAppointment).length;

    renderHealthTrends(consultations, vaccinations, medications);
    renderAlerts(residents, consultations, vaccinations, appointments);
   //edited this part
   renderRecentActivities(residents, consultations, vaccinations, medications, appointments);

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

async function fetchJson(path, headers) {
  const res = await fetch(API + path, { headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return Array.isArray(data) ? data : [];
}


//vaccination rate: to display on dashboard
function calculateVaccinationRate(residents, vaccinations) {
  if (residents.length === 0) return 0;

  const vaccinatedResidentIds = new Set(
    vaccinations
      .map(item => item.residentId?._id || item.residentId)
      .filter(Boolean)
      .map(String)
  );

  const vaccinatedCount = residents.filter(resident => {
    const id = resident._id || resident.id;

    return resident.vaccinated || vaccinatedResidentIds.has(String(id));
  }).length;

  return Math.round((vaccinatedCount / residents.length) * 100);
}

//to display on dashboard appointments of the day
function isTodayAppointment(item) {
  const dateValue = item.date || item.dateTime || item.createdAt;

  if (!dateValue) return false;

  return formatLocalDate(dateValue) === formatLocalDate(new Date());
}

function renderHealthTrends(consultations, vaccinations, medications) {
  const chart = document.getElementById('healthTrendsChart');
  const total = consultations.length + vaccinations.length + medications.length;

  if (total === 0) {
    chart.innerText = 'No health trend data yet.';
    return;
  }

  chart.innerHTML = `
    Consultations: ${consultations.length}<br>
    Vaccinations: ${vaccinations.length}<br>
    Medications: ${medications.length}
  `;
}

function renderAlerts(residents, consultations, vaccinations, appointments) {
  const alertsList = document.getElementById('alertsList');
  const alerts = [];
  const pendingAppointments = appointments.filter(item => item.status === 'Pending');

  if (residents.length === 0) alerts.push('No residents have been added yet.');
  if (consultations.length === 0) alerts.push('No consultations recorded yet.');
  if (vaccinations.length === 0) alerts.push('No vaccination records saved yet.');
  if (pendingAppointments.length > 0) {
    alerts.push(`${pendingAppointments.length} appointment(s) still pending.`);
  }

  alertsList.innerHTML = alerts.length
    ? alerts.map(alert => `<div class="alert-item">${escapeHtml(alert)}</div>`).join('')
    : '<div class="alert-item">No alerts or reminders yet.</div>';
}
//ACTIVITIES FUNTION
function renderRecentActivities(residents, consultations, vaccinations, medications, appointments) {
  const body = document.getElementById('recentActivitiesBody');
  const residentNames = buildResidentNameMap(residents);

  const activities = [
    ...consultations.map(item => ({
      ...item,
      residentName: getActivityResidentName(item, residentNames),
      activity: 'Consultation',
      details: item.complaint || item.diagnosis,
      date: item.visitDate || item.createdAt
    })),
    ...vaccinations.map(item => ({
      ...item,
      residentName: getActivityResidentName(item, residentNames),
      activity: 'Vaccination',
      details: item.vaccineType || item.vaccine || item.doseNumber,
      date: item.dateAdministered || item.createdAt
    })),
    ...medications.map(item => ({
      ...item,
      residentName: getActivityResidentName(item, residentNames),
      activity: 'Medication',
      details: item.medicineName || item.name || item.dosage,
      date: item.prescribedDate || item.date || item.createdAt
    })),
    ...appointments.map(item => ({
      ...item,
      residentName: item.resident || getActivityResidentName(item, residentNames),
      activity: 'Appointment',
      details: item.purpose || item.reason,
      date: item.date || item.dateTime || item.createdAt
    }))
  ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  if (activities.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#aaa;padding:30px;">
          No recent activities yet.
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = activities.slice(0, 8).map(item => `
    <tr>
      <td>${escapeHtml(item.residentName)}</td>
      <td><span class="badge badge-green">${escapeHtml(item.activity)}</span></td>
      <td>${escapeHtml(item.details || '-')}</td>
      <td>${escapeHtml(formatDate(item.date || item.createdAt))}</td>
      <td>${escapeHtml(item.worker || 'Health Worker')}</td>
    </tr>
  `).join('');
}

//FORMAT DATE
function formatDate(dateValue) {
  if (!dateValue) return '-';

  return String(dateValue).slice(0, 10);
}

//helper function for the date format
function formatLocalDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

//


function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
//HELPER FUNCTION
function buildResidentNameMap(residents) {
  const names = {};

  residents.forEach(resident => {
    const id = resident._id || resident.id;

    if (id) {
      names[String(id)] = getResidentName(resident);
    }
  });

  return names;
}

function getActivityResidentName(item, residentNames) {
  const id = item.residentId || item.resident || item._id;

  if (id && residentNames[String(id)]) {
    return residentNames[String(id)];
  }

  return item.residentName || item.fullName || 'Unknown resident';
}

function getResidentName(resident) {
  return `${resident.firstName || ''} ${resident.lastName || ''}`.trim() || 'Unknown resident';
}