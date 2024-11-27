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
const monthPicker = document.getElementById("month-picker");
const budgetTotal = document.getElementById("budget-total");
const reportTableBody = document.querySelector("#report-table tbody");

async function loadReports(dateType, dateValue) {
    try {
        const dbRef = ref(database, "Liquidaciones");
        const snapshot = await get(dbRef);

        if (!snapshot.exists()) {
            alert("No se encontraron reportes.");
            return;
        }

        const liquidaciones = snapshot.val();
        const filteredReports = {};

        Object.keys(liquidaciones).forEach((key) => {
            if (
                (dateType === "day" && key === dateValue) ||
                (dateType === "month" && key.startsWith(dateValue))
            ) {
                filteredReports[key] = liquidaciones[key];
            }
        });

        if (Object.keys(filteredReports).length === 0) {
            alert("No se encontraron reportes para la fecha seleccionada.");
            return;
        }

        displayReports(filteredReports);
    } catch (error) {
        console.error("Error al cargar los reportes:", error);
        alert("Ocurrió un error al cargar los reportes.");
    }
}

function displayReports(reports) {
    let totalBudget = 0;
    reportTableBody.innerHTML = "";

    Object.values(reports).forEach((report) => {
        Object.values(report).forEach((service) => {
            const { servicio, barbero, valor } = service;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${servicio}</td>
                <td>${barbero}</td>
                <td>$${valor}</td>
            `;
            reportTableBody.appendChild(row);

            totalBudget += valor;
        });
    });

    budgetTotal.textContent = `$${totalBudget.toLocaleString()}`;
}

btnShowReport.addEventListener("click", () => {
    const selectedDate = datePicker.value;
    const selectedMonth = monthPicker.value;

    if (!selectedDate && !selectedMonth) {
        alert("Por favor, selecciona una fecha o un mes.");
        return;
    }

    if (selectedDate) {
        loadReports("day", selectedDate);
    } else if (selectedMonth) {
        loadReports("month", selectedMonth);
    }
});
