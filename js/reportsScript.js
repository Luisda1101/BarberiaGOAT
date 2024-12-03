import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");
const budgetTotal = document.getElementById("budget-total");
const reportTableBody = document.querySelector("#report-table tbody");

btnShowReport.addEventListener("click", () => {
    const selectedDate = datePicker.value;
    const start = startDate.value;
    const end = endDate.value;

    // Validar que el usuario no elija ambas opciones
    if (selectedDate && (start || end)) {
        alert("Por favor, selecciona solo una opción: día o intervalo.");
        return;
    }

    if (selectedDate) {
        loadReportsByDay(selectedDate);
    } else if (start && end) {
        loadReportsByInterval(start, end);
    } else {
        alert("Por favor, selecciona un día o define un intervalo.");
    }
});

// Función para cargar reportes por día
async function loadReportsByDay(date) {
    try {
        const dbRef = ref(database, `Liquidaciones/${date}`);
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            alert("No se encontraron reportes para la fecha seleccionada.");
            return;
        }

        const data = snapshot.val();
        displayReportsByBarber(data);
    } catch (error) {
        console.error("Error al cargar reportes por día:", error);
    }
}

// Función para cargar reportes por intervalo
async function loadReportsByInterval(start, end) {
    try {
        const dbRef = ref(database, "Liquidaciones");
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            alert("No se encontraron reportes en el intervalo seleccionado.");
            return;
        }

        const data = snapshot.val();
        const filteredData = {};

        // Filtrar las fechas en el intervalo
        Object.keys(data).forEach((date) => {
            if (isDateInRange(date, start, end)) {
                filteredData[date] = data[date];
            }
        });

        if (Object.keys(filteredData).length === 0) {
            alert("No se encontraron reportes en el intervalo seleccionado.");
            return;
        }

        displayReportsByInterval(filteredData);
    } catch (error) {
        console.error("Error al cargar reportes por intervalo:", error);
    }
}

// Función para verificar si una fecha está en el rango
function isDateInRange(date, start, end) {
    const [day, month, year] = date.split("-");
    const currentDate = new Date(year, month - 1, day);
    const startDate = new Date(start);
    const endDate = new Date(end);
    return currentDate >= startDate && currentDate <= endDate;
}

// Función para mostrar reportes agrupados por barbero (día)
function displayReportsByBarber(data) {
    reportTableBody.innerHTML = "";
    let totalBudget = 0;

    Object.keys(data).forEach((barber) => {
        data[barber].forEach((service) => {
            const { tipo, valor } = service;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${barber}</td>
                <td>${tipo}</td>
                <td>$${valor}</td>
            `;
            reportTableBody.appendChild(row);

            totalBudget += valor;
        });
    });

    budgetTotal.textContent = `$${totalBudget.toLocaleString()}`;
}

// Función para mostrar reportes por intervalo (agrega fecha)
function displayReportsByInterval(data) {
    reportTableBody.innerHTML = "";
    let totalBudget = 0;

    Object.keys(data).forEach((date) => {
        const dateRow = document.createElement("tr");
        dateRow.innerHTML = `<td colspan="3" class="date-row">Fecha: ${date}</td>`;
        reportTableBody.appendChild(dateRow);

        Object.keys(data[date]).forEach((barber) => {
            data[date][barber].forEach((service) => {
                const { tipo, valor } = service;

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${barber}</td>
                    <td>${tipo}</td>
                    <td>$${valor}</td>
                `;
                reportTableBody.appendChild(row);

                totalBudget += valor;
            });
        });
    });

    budgetTotal.textContent = `$${totalBudget.toLocaleString()}`;
}
