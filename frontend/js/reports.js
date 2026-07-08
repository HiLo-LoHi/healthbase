document.addEventListener('DOMContentLoaded', loadReport);

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

        if (!response.ok) {
            throw new Error(report.error || 'Unable to load report.');
        }

        document.getElementById('residentCount').innerText = report.residents;
        document.getElementById('consultationCount').innerText = report.consultations;
        document.getElementById('vaccinationCount').innerText = report.vaccinations;
        document.getElementById('medicationCount').innerText = report.medications;
        document.getElementById('appointmentCount').innerText = report.appointments;

        document.getElementById('residentSummary').innerText = report.residents;
        document.getElementById('consultationSummary').innerText = report.consultations;
        document.getElementById('vaccinationSummary').innerText = report.vaccinations;
        document.getElementById('medicationSummary').innerText = report.medications;
        document.getElementById('appointmentSummary').innerText = report.appointments;

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}