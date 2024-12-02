import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC78es1xjO7Ehb0Gt7Yt4aRaadR3wZDm3o",
    authDomain: "barberia-cd672.firebaseapp.com",
    databaseURL: "https://barberia-cd672-default-rtdb.firebaseio.com",
    projectId: "barberia-cd672",
    storageBucket: "barberia-cd672.appspot.com",
    messagingSenderId: "363001503057",
    appId: "1:363001503057:web:104276736e39d677aa0770",
    measurementId: "G-YJT9HN3FK3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const btnShowReport = document.getElementById("btn-show-report");
const datePicker = document.getElementById("date-picker");
const dateRangeStart = document.getElementById("date-range-start");
const dateRangeEnd = document.getElementById("date-range-end");
const budgetTotal = document.getElementById("budget-total");
const reportTable = document.getElementById("report-table");
const reportTableBody = reportTable.querySelector("tbody");
const reportTableHead = reportTable.querySelector("thead");

btnShowReport.addEventListener("click", async () => {
    const selectedDate = datePicker.value;
    const startDate = dateRangeStart.value;
    const endDate = dateRangeEnd.value;

    if ((selectedDate && (startDate || endDate)) || (startDate && !endDate) || (!startDate && endDate)) {
        alert("Por favor, selecciona solo una opción válida.");
        return;
    }

    if (selectedDate) {
        await loadReportsForDay(selectedDate);
    } else if (startDate && endDate) {
        await loadReportsForInterval(startDate, endDate);
    } else {
        alert("Debes seleccionar al menos una opción.");
    }
});

async function loadReportsForDay(date) {
    try {
        const snapshot = await get(ref(database, `liquidaciones/${formatDate(date)}`));

        if (!snapshot.exists()) {
            alert("No se encontraron reportes para el día seleccionado.");
            return;
        }

        const reports = snapshot.val();
        displayReports(reports, false);
    } catch (error) {
        console.error("Error al cargar el reporte del día:", error);
        alert("Ocurrió un error al cargar los reportes.");
    }
}

async function loadReportsForInterval(startDate, endDate) {
    try {
        const snapshot = await get(ref(database, "liquidaciones"));

        if (!snapshot.exists()) {
            alert("No se encontraron reportes.");
            return;
        }

        const reports = snapshot.val();
        const filteredReports = filterReportsByInterval(reports, startDate, endDate);
        
        if (Object.keys(filteredReports).length === 0) {
            alert("No se encontraron reportes para el intervalo de fechas seleccionado.");
            return;
        }

        displayReports(filteredReports, true);
    } catch (error) {
        console.error("Error al cargar los reportes:", error);
        alert("Ocurrió un error al cargar los reportes.");
    }
}

function filterReportsByInterval(reports, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filtered = {};

    Object.keys(reports).forEach((key) => {
        const reportDate = new Date(formatDate(key, false));
        if (reportDate >= start && reportDate <= end) {
            filtered[key] = reports[key];
        }
    });

    return filtered;
}

function displayReports(reports, includeDate) {
    let totalBudget = 0;
    reportTableBody.innerHTML = "";
    reportTableHead.innerHTML = `
        <tr>
            ${includeDate ? "<th>Fecha</th>" : ""}
            <th>Barbero</th>
            <th>Tipo</th>
            <th>Valor</th>
        </tr>
    `;

    Object.entries(reports).forEach(([date, services]) => {
        Object.values(services).forEach((service) => {
            const { nombre, tipo, valor } = service;

            const row = document.createElement("tr");
            row.innerHTML = `
                ${includeDate ? `<td>${date}</td>` : ""}
                <td>${nombre}</td>
                <td>${tipo}</td>
                <td>$${valor}</td>
            `;
            reportTableBody.appendChild(row);
            totalBudget += valor;
        });
    });

    budgetTotal.textContent = `$${totalBudget.toLocaleString()}`;
}

function formatDate(date, forFirebase = true) {
    const [year, month, day] = date.split("-");
    return forFirebase ? `${day}-${month}-${year}` : `${year}-${month}-${day}`;
}
