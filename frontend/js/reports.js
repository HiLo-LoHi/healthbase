let pieChart = null;
let barChart = null;

document.addEventListener('DOMContentLoaded', () => {

    const name = localStorage.getItem('name');

    if (name) {

        const topbar = document.getElementById('topbarName');
        const accountName = document.getElementById('accountMenuName');

        if (topbar) topbar.innerText = name;
        if (accountName) accountName.innerText = name;

    }

    const role = localStorage.getItem('role');

    const accountRole = document.getElementById('accountMenuRole');

    if (role && accountRole) {

        accountRole.innerText =
            role.charAt(0).toUpperCase() + role.slice(1);

    }

    loadReport();

});

async function loadReport() {

    const token = localStorage.getItem('token');
    const range = document.getElementById('reportRange').value;

    try {

        const response = await fetch(
            API + '/api/reports?range=' + range,
            {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }
        );

        const report = await response.json();

        document.getElementById('reportTypeDisplay').innerText =
            range.charAt(0).toUpperCase() + range.slice(1);

        document.getElementById('generatedDate').innerText =
            new Date().toLocaleString();

        document.getElementById('preparedBy').innerText =
            localStorage.getItem('name') || 'Administrator';

        if (!response.ok) {
            throw new Error(report.error || 'Unable to load reports.');
        }

        // Cards
        document.getElementById('residentCount').innerText = report.residents;
        document.getElementById('consultationCount').innerText = report.consultations;
        document.getElementById('vaccinationCount').innerText = report.vaccinations;
        document.getElementById('medicationCount').innerText = report.medications;
        document.getElementById('appointmentCount').innerText = report.appointments;

        // Summary Table
        document.getElementById('residentSummary').innerText = report.residents;
        document.getElementById('consultationSummary').innerText = report.consultations;
        document.getElementById('vaccinationSummary').innerText = report.vaccinations;
        document.getElementById('medicationSummary').innerText = report.medications;
        document.getElementById('appointmentSummary').innerText = report.appointments;

        renderCharts(report);

    }
    catch (err) {

        console.error(err);
        alert(err.message);

    }

}

function renderCharts(report) {

    const pieCanvas = document.getElementById('reportPieChart');
    const barCanvas = document.getElementById('reportBarChart');

    if (!pieCanvas || !barCanvas) return;

    if (pieChart) {
        pieChart.destroy();
    }

    if (barChart) {
        barChart.destroy();
    }

    pieChart = new Chart(pieCanvas, {

        type: 'pie',

        data: {

            labels: [
                'Residents',
                'Consultations',
                'Vaccinations',
                'Medications',
                'Appointments'
            ],

            datasets: [{

                data: [
                    report.residents,
                    report.consultations,
                    report.vaccinations,
                    report.medications,
                    report.appointments
                ],
                backgroundColor: [
                '#2563eb',
                '#16a34a',
                '#f59e0b',
                '#9333ea',
                '#ef4444'
                ],

                borderRadius: 8
            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: 'bottom'
                }

            }

        }

    });

    barChart = new Chart(barCanvas, {

        type: 'bar',

        data: {

            labels: [
                'Residents',
                'Consultations',
                'Vaccinations',
                'Medications',
                'Appointments'
            ],

            datasets: [{

                label: 'Records',

                data: [
                    report.residents,
                    report.consultations,
                    report.vaccinations,
                    report.medications,
                    report.appointments
                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        precision: 0

                    }

                }

            }

        }

    });

}

function openAccountMenu() {

    const menu = document.getElementById('accountMenu');

    if (!menu) return;

    menu.classList.toggle('show');

}

function goToMyProfile() {

    const residentId = localStorage.getItem('residentId');

    if (residentId) {

        location.href =
            'resident-profile.html?id=' +
            encodeURIComponent(residentId);

    }

}