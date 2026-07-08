let currentPage = 1;
const residentsPerPage = 5;
let currentFilteredResidents = [];

document.addEventListener('DOMContentLoaded', () => {
  loadResidents('');
});

async function loadResidents(name = '') {
  const token = localStorage.getItem('token');
  const query = name ? '?name=' + encodeURIComponent(name) : '';
  const headers = token ? { Authorization: 'Bearer ' + token } : {};

  renderResidentMessage('Loading residents...');

  try {
    const res = await fetch(API + '/api/residents' + query, { headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load residents.');
    }

    currentFilteredResidents = applyResidentFilters(Array.isArray(data) ? data : []);
    sortResidentResults(currentFilteredResidents, document.getElementById('sortResidents').value);

    currentPage = 1;
    updateResultCount(currentFilteredResidents.length);
    renderCurrentPage();
  } catch (err) {
    console.error('loadResidents error:', err);
    currentFilteredResidents = [];
    updateResultCount(0);
    updatePagination(0);
    renderResidentMessage('Cannot load residents from server. Try again.');
  }
}

function applyResidentFilters(residents) {
  const ageFilter = document.getElementById('filterAge').value;
  const conditionFilter = document.getElementById('filterCondition').value;
  const vaxFilter = document.getElementById('filterVax').value;

  return residents.filter(resident => {
    const age = getAge(resident.birthdate);
    const condition = getResidentCondition(resident);
    const vaccinated = isResidentVaccinated(resident);

    const matchesAge = !ageFilter || ageMatchesFilter(age, ageFilter);
    const matchesCondition =
      !conditionFilter || condition.toLowerCase().includes(conditionFilter.toLowerCase());
    const matchesVaccination =
      !vaxFilter || String(vaccinated) === vaxFilter;

    return matchesAge && matchesCondition && matchesVaccination;
  });
}

function displayResidents(residents) {
  renderResidents(residents);
}

function searchResidents() {
  loadResidents(document.getElementById('searchInput').value.trim());
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterAge').value = '';
  document.getElementById('filterCondition').value = '';
  document.getElementById('filterVax').value = '';
  document.getElementById('sortResidents').value = 'name-asc';

  loadResidents('');
}

function changePage(direction) {
  const totalPages = Math.ceil(currentFilteredResidents.length / residentsPerPage) || 1;
  const nextPage = currentPage + direction;

  if (nextPage < 1 || nextPage > totalPages) return;

  currentPage = nextPage;
  renderCurrentPage();
}

function renderCurrentPage() {
  const start = (currentPage - 1) * residentsPerPage;
  const end = start + residentsPerPage;
  const pageResidents = currentFilteredResidents.slice(start, end);

  displayResidents(pageResidents);
  updatePagination(currentFilteredResidents.length);
}

function renderResidents(residents) {
  if (residents.length === 0) {
    renderResidentMessage('No resident records found.');
    return;
  }

  const list = document.getElementById('residentList');

  list.innerHTML = residents.map(resident => {
    const id = resident._id || resident.id;
    const fullName = getResidentName(resident);
    const age = getAge(resident.birthdate);
    const condition = getResidentCondition(resident) || 'No condition recorded';
    const vaccinated = isResidentVaccinated(resident);

    return `
      <div class="resident-card">
        <div class="avatar">&#128100;</div>

        <div class="rinfo" onclick="openResidentProfile('${escapeJsValue(id)}')" style="cursor:pointer;">
          <h4>${escapeHtml(fullName)}</h4>
          <p>
            ${escapeHtml(resident.sex || 'Sex not set')}
            &bull;
            ${age !== null ? age + ' years old' : 'Age not set'}
            &bull;
            ${escapeHtml(resident.address || 'Address not set')}
          </p>
          <p>
            <span class="badge ${vaccinated ? 'badge-green' : 'badge-gray'}">
              ${vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
            </span>
            <span class="badge badge-yellow">${escapeHtml(condition)}</span>
          </p>
        </div>

        <div style="display:flex;align-items:center;">
          <button
            class="btn-secondary"
            style="background:#dc3545;color:white;border:none;"
            onclick="event.stopPropagation(); deleteResident('${escapeJsValue(id)}')">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function sortResidentResults(residents, sortValue) {
  residents.sort((a, b) => {
    const nameA = getResidentName(a).toLowerCase();
    const nameB = getResidentName(b).toLowerCase();
    const ageA = getAge(a.birthdate);
    const ageB = getAge(b.birthdate);

    if (sortValue === 'name-desc') return nameB.localeCompare(nameA);
    if (sortValue === 'age-asc') return safeAge(ageA) - safeAge(ageB);
    if (sortValue === 'age-desc') return safeAge(ageB) - safeAge(ageA);

    return nameA.localeCompare(nameB);
  });
}

function safeAge(age) {
  return age === null ? 999 : age;
}

function updateResultCount(total) {
  document.getElementById('resultCount').innerText =
    `${total} resident${total === 1 ? '' : 's'} found`;
}

function updatePagination(totalResidents) {
  const paginationBar = document.getElementById('paginationBar');
  const totalPages = Math.ceil(totalResidents / residentsPerPage) || 1;

  paginationBar.style.display = totalResidents === 0 ? 'none' : 'flex';
  document.getElementById('pageInfo').innerText = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPageBtn').disabled = currentPage <= 1;
  document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
}

function renderResidentMessage(message) {
  document.getElementById('residentList').innerHTML = `
    <p style="text-align:center; color:#aaa; padding:40px;">
      ${escapeHtml(message)}
    </p>
  `;
}

function openResidentProfile(id) {
  location.href = 'resident-profile.html?id=' + encodeURIComponent(id);
}

function getResidentName(resident) {
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

function ageMatchesFilter(age, filter) {
  if (age === null) return false;

  if (filter === '0-18') return age >= 0 && age <= 18;
  if (filter === '19-40') return age >= 19 && age <= 40;
  if (filter === '41-60') return age >= 41 && age <= 60;
  if (filter === '60+') return age > 60;

  return true;
}

function getResidentCondition(resident) {
  return resident.condition || '';
}

function isResidentVaccinated(resident) {
  return resident.vaccinated === true || String(resident.vaccinated).toLowerCase() === 'true';
}

function escapeJsValue(value) {
  return String(value || '').replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
async function deleteResident(id) {
  const confirmed = confirm(
    'Are you sure you want to delete this resident? This action cannot be undone.'
  );

  if (!confirmed) return;

  const token = localStorage.getItem('token');

  try {
    const res = await fetch(API + '/api/residents/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + token
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to delete resident.');
    }

    alert('Resident deleted successfully.');

    loadResidents(document.getElementById('searchInput').value.trim());

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}