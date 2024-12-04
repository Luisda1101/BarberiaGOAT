import { getDatabase, ref, get} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

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
        const liquidacionesRef = ref(db, "liquidaciones");
        const snapshot = await get(liquidacionesRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            procesarLiquidaciones(data);
        } else {
            console.error("No se encontraron liquidaciones en la base de datos.");
        }
    } catch (error) {
        console.error("Error al obtener las liquidaciones:", error);
    }
}

function procesarLiquidaciones(data) {
    dataBarberos.style.display = "block";
    tablaPorBarbero.innerHTML = "";

    for (const fecha in data) {
        const serviciosPorFecha = data[fecha];

        for (const idServicio in serviciosPorFecha) {
            const { nombre, tipo, valor } = serviciosPorFecha[idServicio];
            const filaServicio = document.createElement("tr");

            filaServicio.innerHTML = `
                <td>${nombre}</td>
                <td>${tipo}</td>
                <td>${valor}</td>
            `;
            tablaPorBarbero.appendChild(filaServicio);
        }

        const filaFecha = document.createElement("tr");
        filaFecha.innerHTML = `
            <td colspan="3" class="fecha-label">${fecha}</td>
        `;
        tablaPorBarbero.appendChild(filaFecha);
    }
}

btnReports.addEventListener("click", () => {
    obtenerLiquidaciones();
});