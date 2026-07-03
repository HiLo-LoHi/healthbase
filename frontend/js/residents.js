let currentPage = 1;
const residentsPerPage = 5;
let currentFilteredResidents = [];

document.addEventListener('DOMContentLoaded', () => {
  searchResidents();
});

function searchResidents() {
  if (typeof getRecords !== 'function') {
    renderResidentMessage('Unable to load residents. Please make sure data-store.js is loaded.');
    updateResultCount(0);
    updatePagination(0);
    return;
  }

  const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();
  const ageFilter = document.getElementById('filterAge').value;
  const conditionFilter = document.getElementById('filterCondition').value;
  const vaxFilter = document.getElementById('filterVax').value;
  const sortValue = document.getElementById('sortResidents').value;

  const residents = getRecords('residents');
  const consultations = getRecords('consultations');
  const vaccinations = getRecords('vaccinations');

  currentFilteredResidents = residents.filter(resident => {
    const fullName = getResidentName(resident);
    const age = getAge(resident.birthdate);
    const vaccinated = isResidentVaccinated(fullName, vaccinations);

    const matchesName = fullName.toLowerCase().includes(searchValue);
    const matchesAge = !ageFilter || ageMatchesFilter(age, ageFilter);
    const matchesCondition =
      !conditionFilter || residentHasCondition(fullName, conditionFilter, consultations);
    const matchesVaccination =
      !vaxFilter || String(vaccinated) === vaxFilter;

    return matchesName && matchesAge && matchesCondition && matchesVaccination;
  });

  sortResidentResults(currentFilteredResidents, sortValue);

  currentPage = 1;
  updateResultCount(currentFilteredResidents.length);
  renderCurrentPage();
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('filterAge').value = '';
  document.getElementById('filterCondition').value = '';
  document.getElementById('filterVax').value = '';
  document.getElementById('sortResidents').value = 'name-asc';

  searchResidents();
}

function changePage(direction) {
  const totalPages = Math.ceil(currentFilteredResidents.length / residentsPerPage) || 1;
  const nextPage = currentPage + direction;

  if (nextPage < 1 || nextPage > totalPages) return;

  currentPage = nextPage;
  renderCurrentPage();
}

function renderCurrentPage() {
  const consultations = getRecords('consultations');
  const vaccinations = getRecords('vaccinations');

  const start = (currentPage - 1) * residentsPerPage;
  const end = start + residentsPerPage;
  const pageResidents = currentFilteredResidents.slice(start, end);

  renderResidents(pageResidents, consultations, vaccinations);
  updatePagination(currentFilteredResidents.length);
}

function renderResidents(residents, consultations, vaccinations) {
  if (residents.length === 0) {
    renderResidentMessage('No resident records found.');
    return;
  }

  const list = document.getElementById('residentList');

  list.innerHTML = residents.map(resident => {
    const fullName = getResidentName(resident);
    const age = getAge(resident.birthdate);
    const vaccinated = isResidentVaccinated(fullName, vaccinations);
    const condition = getLatestCondition(fullName, consultations);

    return `
      <div class="resident-card" onclick="openResidentProfile('${resident.id}')">
        <div class="avatar">👤</div>

        <div class="rinfo">
          <h4>${escapeHtml(fullName)}</h4>
          <p>
            ${age !== null ? age + ' years old' : 'Age not set'}
            ${resident.sex ? ' • ' + escapeHtml(resident.sex) : ''}
            ${resident.address ? ' • ' + escapeHtml(resident.address) : ''}
          </p>
          <p>
            <span class="badge ${vaccinated ? 'badge-green' : 'badge-gray'}">
              ${vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
            </span>
            ${
              condition
                ? `<span class="badge badge-yellow">${escapeHtml(condition)}</span>`
                : ''
            }
          </p>
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

    if (sortValue === 'name-desc') {
      return nameB.localeCompare(nameA);
    }

    if (sortValue === 'age-asc') {
      return safeAge(ageA) - safeAge(ageB);
    }

    if (sortValue === 'age-desc') {
      return safeAge(ageB) - safeAge(ageA);
    }

    return nameA.localeCompare(nameB);
  });
}

function safeAge(age) {
  return age === null ? 999 : age;
}

function updateResultCount(total) {
  const resultCount = document.getElementById('resultCount');

  resultCount.innerText = `${total} resident${total === 1 ? '' : 's'} found`;
}

function updatePagination(totalResidents) {
  const paginationBar = document.getElementById('paginationBar');
  const totalPages = Math.ceil(totalResidents / residentsPerPage) || 1;
  const pageInfo = document.getElementById('pageInfo');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  paginationBar.style.display = totalResidents === 0 ? 'none' : 'flex';
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

function renderResidentMessage(message) {
  const list = document.getElementById('residentList');

  list.innerHTML = `
    <p style="text-align:center; color:#aaa; padding:40px;">
      ${escapeHtml(message)}
    </p>
  `;
}

function openResidentProfile(id) {
  location.href = 'resident-profile.html?id=' + encodeURIComponent(id);
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

function ageMatchesFilter(age, filter) {
  if (age === null) return false;

  if (filter === '0-18') return age >= 0 && age <= 18;
  if (filter === '19-40') return age >= 19 && age <= 40;
  if (filter === '41-60') return age >= 41 && age <= 60;
  if (filter === '60+') return age > 60;

  return true;
}

function isResidentVaccinated(fullName, vaccinations) {
  return vaccinations.some(item =>
    item.resident &&
    item.resident.toLowerCase() === fullName.toLowerCase()
  );
}

function residentHasCondition(fullName, condition, consultations) {
  return consultations.some(item =>
    item.resident &&
    item.resident.toLowerCase() === fullName.toLowerCase() &&
    (
      item.diagnosis?.toLowerCase().includes(condition.toLowerCase()) ||
      item.complaint?.toLowerCase().includes(condition.toLowerCase()) ||
      item.notes?.toLowerCase().includes(condition.toLowerCase())
    )
  );
}

function getLatestCondition(fullName, consultations) {
  const residentConsultations = consultations
    .filter(item =>
      item.resident &&
      item.resident.toLowerCase() === fullName.toLowerCase()
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return residentConsultations[0]?.diagnosis || '';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}