import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
const db = getDatabase(app);

const btnReports = document.getElementById("btn-reports");
const tablaPorBarbero = document.getElementById("tablaPorBarbero");
const dataBarberos = document.getElementById("data-barberos");

async function obtenerLiquidaciones() {
    try {
        const liquidacionesSnapshot = await getDocs(collection(db, "liquidaciones"));
        const reportes = {};

        liquidacionesSnapshot.forEach(async (docFecha) => {
            const fecha = docFecha.id;
            const serviciosSnapshot = await getDocs(collection(db, `liquidaciones/${fecha}`));

            serviciosSnapshot.forEach((docServicio) => {
                const servicio = docServicio.data();
                const { nombre, tipo, valor } = servicio;

                if (!reportes[nombre]) {
                    reportes[nombre] = [];
                }
                reportes[nombre].push({ fecha, tipo, valor });
            });

            mostrarTabla(reportes);
        });
    } catch (error) {
        console.error("Error al obtener liquidaciones:", error);
    }
}

function mostrarTabla(reportes) {
    tablaPorBarbero.innerHTML = "";

    Object.keys(reportes).forEach((barbero) => {
        const servicios = reportes[barbero];
        let totalValor = 0;

        const barberoContainer = document.createElement("div");
        barberoContainer.classList.add("barbero-container");

        const encabezado = document.createElement("h3");
        encabezado.textContent = `Barbero: ${barbero}`;
        barberoContainer.appendChild(encabezado);

        const tabla = document.createElement("table");
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = tabla.querySelector("tbody");

        servicios.forEach(({ fecha, tipo, valor }) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${fecha}</td>
                <td>${tipo}</td>
                <td>$${valor}</td>
            `;
            totalValor += valor;
            tbody.appendChild(fila);
        });

        const resumen = document.createElement("p");
        resumen.textContent = `Total generado: $${totalValor}`;
        barberoContainer.appendChild(tabla);
        barberoContainer.appendChild(resumen);

        tablaPorBarbero.appendChild(barberoContainer);
    });

    dataBarberos.style.display = "block";
}

btnReports.addEventListener("click", obtenerLiquidaciones);