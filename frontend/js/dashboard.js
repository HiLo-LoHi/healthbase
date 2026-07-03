document.addEventListener('DOMContentLoaded', loadDashboard);

function loadDashboard() {
  const residents = getRecords('residents');
  const consultations = getRecords('consultations');
  const vaccinations = getRecords('vaccinations');
  const medications = getRecords('medications');
  const appointments = getRecords('appointments');
  const requests = getRecords('requests');

  const today = getTodayDate();

  document.getElementById('totalResidents').innerText = residents.length;
  document.getElementById('consultationsToday').innerText =
    consultations.filter(c => c.date === today).length;
  document.getElementById('pendingAppointments').innerText =
    appointments.filter(a => a.status === 'Pending').length;
  document.getElementById('vaccinationRequests').innerText =
    requests.filter(r => r.status === 'Pending').length;

  renderRecentLogs(consultations, vaccinations, medications);
}

function renderRecentLogs(consultations, vaccinations, medications) {
  const body = document.getElementById('recentLogsBody');

  const logs = [
    ...consultations.map(item => ({ ...item, type: 'Consultation', details: item.complaint })),
    ...vaccinations.map(item => ({ ...item, type: 'Vaccination', details: item.vaccine })),
    ...medications.map(item => ({ ...item, type: 'Medication', details: item.name }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (logs.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:#aaa;padding:30px;">
          No health logs yet.
        </td>
      </tr>
    `;
    return;
  }

  body.innerHTML = logs.slice(0, 5).map(log => `
    <tr>
      <td>${log.resident || 'Unknown resident'}</td>
      <td><span class="badge badge-green">${log.type}</span></td>
      <td>${log.details || '-'}</td>
      <td>${log.date || log.createdAt.split('T')[0]}</td>
      <td>${log.worker || 'Health Worker'}</td>
    </tr>
  `).join('');
}