document.addEventListener('DOMContentLoaded', loadDashboard);

function loadDashboard() {
  const residents = getRecords('residents');
  const consultations = getRecords('consultations');
  const vaccinations = getRecords('vaccinations');
  const medications = getRecords('medications');
  const appointments = getRecords('appointments');

  const today = getTodayDate();

  document.getElementById('totalResidents').innerText = residents.length;
  document.getElementById('totalCases').innerText = consultations.length;
  document.getElementById('vaccinationRate').innerText =
    calculateVaccinationRate(residents, vaccinations) + '%';
  document.getElementById('appointmentsToday').innerText =
    appointments.filter(item => item.date === today).length;

  renderHealthTrends(consultations, vaccinations, medications);
  renderAlerts(residents, consultations, vaccinations, appointments);
  renderRecentActivities(consultations, vaccinations, medications, appointments);
}

function calculateVaccinationRate(residents, vaccinations) {
  if (residents.length === 0) return 0;

  const vaccinatedResidents = new Set(
    vaccinations
      .map(item => item.resident)
      .filter(Boolean)
  );

  return Math.round((vaccinatedResidents.size / residents.length) * 100);
}

function renderHealthTrends(consultations, vaccinations, medications) {
  const chart = document.getElementById('healthTrendsChart');

  const total =
    consultations.length +
    vaccinations.length +
    medications.length;

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
    ? alerts.map(alert => `<div class="alert-item">${alert}</div>`).join('')
    : '<div class="alert-item">No alerts or reminders yet.</div>';
}

function renderRecentActivities(consultations, vaccinations, medications, appointments) {
  const body = document.getElementById('recentActivitiesBody');

  const activities = [
    ...consultations.map(item => ({
      ...item,
      activity: 'Consultation',
      details: item.complaint || item.diagnosis
    })),
    ...vaccinations.map(item => ({
      ...item,
      activity: 'Vaccination',
      details: item.vaccine || item.dose
    })),
    ...medications.map(item => ({
      ...item,
      activity: 'Medication',
      details: item.name || item.dosage
    })),
    ...appointments.map(item => ({
      ...item,
      activity: 'Appointment',
      details: item.purpose || item.reason
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
      <td>${item.resident || item.fullName || 'Unknown resident'}</td>
      <td><span class="badge badge-green">${item.activity}</span></td>
      <td>${item.details || '-'}</td>
      <td>${item.date || item.createdAt.split('T')[0]}</td>
      <td>${item.worker || 'Health Worker'}</td>
    </tr>
  `).join('');
}