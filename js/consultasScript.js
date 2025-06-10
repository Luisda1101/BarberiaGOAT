import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getCookie, deleteCookie } from "./sessionsUtils.js";
import { push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

import {
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
} from "./sweetAlertsModule.js";

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
const serviciosRef = ref(database, "servicios");

const auth = getAuth();

const sessionCookie = getCookie("user");

onAuthStateChanged(auth, (user) => {
    const session = sessionCookie ? JSON.parse(sessionCookie) : null;
    if (!user || !session) {
        window.location.href = "../index.html";
    } else {
        const { rol, loginTime, expireTime } = session;
        const currentTime = Date.now();
        if (loginTime && expireTime && (currentTime - loginTime > expireTime)) {
        // Sesión expirada
        deleteCookie("user");
        window.location.href = "../index.html";
        return;
    }
        if (rol !== "Administrador" && rol !== "Suplente") {
            showErrorAlert("Acceso denegado", "No tienes permiso para acceder a esta página.");
            window.location.href = "../index.html";
        } else {
            document.getElementById("user-role").textContent = `rol: ${rol}`;
        }
    }
});

const btnEndDay = document.getElementById("btn-terminardia");

window.addEventListener("DOMContentLoaded", () => {
    const session = sessionStorage.getItem("user");
    if (session) {
        const { rol } = JSON.parse(session);
        if (rol !== "Administrador") {
            // Oculta pestañas solo para admin
            document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
        }
    }
});

function mostrarTodosLosServicios() {
    document.getElementById("data-todos").style.display = "block";
    document.getElementById("data-barberos").style.display = "none";
    document.getElementById("data-liquidacion").style.display = "none";

    const tbody = document.getElementById("tablaServicios").getElementsByTagName("tbody")[0];
    onValue(serviciosRef, (snapshot) => {
        const data = snapshot.val();
        tbody.innerHTML = "";


        if (data) {
            for (const id in data) {
                if (id === "checkpoint") continue;
                const fila = tbody.insertRow();
                fila.insertCell(0).textContent = data[id].nombre;
                fila.insertCell(1).textContent = data[id].tipo;
                fila.insertCell(2).textContent = data[id].valor;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="3">No se encontraron datos</td></tr>`;
        }

    });
}

// Mostrar servicios agrupados por barbero
function mostrarServiciosPorBarbero() {
    document.getElementById("data-todos").style.display = "none";
    document.getElementById("data-barberos").style.display = "block";
    document.getElementById("data-liquidacion").style.display = "none";

    const tabla = document.getElementById("tablaPorBarbero");
    const tbody = tabla.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    onValue(serviciosRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            // Agrupa servicios por barbero
            const serviciosPorBarbero = {};

            for (const id in data) {
                if (id === "checkpoint") continue; // Ignora checkpoint
                const servicio = data[id];
                const barbero = servicio.nombre || "Desconocido";

                if (!serviciosPorBarbero[barbero]) {
                    serviciosPorBarbero[barbero] = [];
                }

                serviciosPorBarbero[barbero].push(servicio);
            }

            let hayDatos = false;
            tbody.innerHTML = ""; // Limpiar antes de agregar

            for (const barbero in serviciosPorBarbero) {
                if (barbero === "Desconocido") continue;

                // Fila de encabezado para el barbero
                const thRow = document.createElement("tr");
                const thBarbero = document.createElement("th");
                thBarbero.colSpan = 4;
                thBarbero.className = "table-dark text-center";
                thBarbero.textContent = barbero;
                thRow.appendChild(thBarbero);
                tbody.appendChild(thRow);

                // Fila de encabezados de columnas
                const thHeaderRow = document.createElement("tr");
                const thServicio = document.createElement("th");
                thServicio.textContent = "Servicio";
                const thDescripcion = document.createElement("th");
                thDescripcion.textContent = "Descripción";
                const thPrecio = document.createElement("th");
                thPrecio.textContent = "Precio";
                // Primer th vacío para alinear con el nombre del barbero
                const thVacio = document.createElement("th");
                thVacio.style.display = "none"; // Oculto, solo para estructura
                thHeaderRow.appendChild(thVacio);
                thHeaderRow.appendChild(thServicio);
                thHeaderRow.appendChild(thDescripcion);
                thHeaderRow.appendChild(thPrecio);
                tbody.appendChild(thHeaderRow);

                // Filas de servicios
                serviciosPorBarbero[barbero].forEach(servicio => {
                    const fila = document.createElement("tr");
                    // Primera celda vacía para alinear con el nombre del barbero
                    const tdVacio = document.createElement("td");
                    tdVacio.style.display = "none";
                    fila.appendChild(tdVacio);

                    const tdServicio = document.createElement("td");
                    tdServicio.textContent = servicio.tipo;
                    fila.appendChild(tdServicio);

                    const tdDescripcion = document.createElement("td");
                    tdDescripcion.textContent = servicio.descripcion || "";
                    fila.appendChild(tdDescripcion);

                    const tdPrecio = document.createElement("td");
                    tdPrecio.textContent = servicio.valor;
                    fila.appendChild(tdPrecio);

                    tbody.appendChild(fila);
                    hayDatos = true;
                });
            }

            if (!hayDatos) {
                tbody.innerHTML = `<tr><td colspan="4">No se encontraron servicios</td></tr>`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="4">No se encontraron servicios</td></tr>`;
        }
    });
}

function mostrarLiquidacion() {
    document.getElementById("data-todos").style.display = "none";
    document.getElementById("data-barberos").style.display = "none";
    document.getElementById("data-liquidacion").style.display = "block";

    const tbody = document.getElementById("tablaLiquidacion").getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    onValue(serviciosRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            const liquidacionPorBarbero = {};

            for (const id in data) {
                const servicio = data[id];
                const barbero = servicio.nombre || "Desconocido";
                const valorServicio = parseFloat(servicio.valor) || 0;

                if (!liquidacionPorBarbero[barbero]) {
                    liquidacionPorBarbero[barbero] = 0;
                }

                liquidacionPorBarbero[barbero] += valorServicio * 0.4; // Comisión del 40%
            }

            for (const barbero in liquidacionPorBarbero) {
                if (barbero === "Desconocido") {
                    continue;
                } else {
                    const fila = tbody.insertRow();
                    fila.insertCell(0).textContent = barbero;
                    fila.insertCell(1).textContent = `$${liquidacionPorBarbero[barbero].toFixed(2)}`;
                }
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="2">No se encontraron datos</td></tr>`;
        }
    });
}

btnEndDay.addEventListener("click", async () => {
    console.log("Iniciando el proceso para finalizar el día...");

    try {
        // Obtener todos los nodos de la colección servicios
        console.log("Obteniendo datos de la colección 'servicios'...");
        const snapshot = await get(serviciosRef);

        if (!snapshot.exists()) {
            console.log("La colección 'servicios' está vacía.");
            showWarningAlert("Advertencia", "No hay servicios registrados para liquidar.");
            return;
        }

        // Servicios existentes
        const servicios = snapshot.val();
        console.log("Datos obtenidos de 'servicios':", servicios);

        // Generar la fecha actual en formato 'dd-mm-yyyy'
        const today = new Date();
        const formattedDate = today
            .toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");
        console.log("Fecha generada:", formattedDate);

        // Calcular sumatoria por barbero
        const sumatoriaPorBarbero = {};
        for (const [key, detalles] of Object.entries(servicios)) {
            if (key === "checkpoint") continue;
            const barbero = detalles.nombre || "Desconocido";
            const valor = parseFloat(detalles.valor) || 0;
            if (!sumatoriaPorBarbero[barbero]) {
                sumatoriaPorBarbero[barbero] = 0;
            }
            sumatoriaPorBarbero[barbero] += valor * 0.4; // Comisión del 40%
        }

        // Guardar la sumatoria en liquidaciones bajo la fecha, usando llave aleatoria
        const liquidacionesRef = ref(database, `liquidaciones/${formattedDate}`);
        for (const barbero in sumatoriaPorBarbero) {
            if (barbero === "Desconocido") continue;
            const nuevaLlaveRef = push(liquidacionesRef);
            await set(nuevaLlaveRef, {
                nombre: barbero,
                ganancia: sumatoriaPorBarbero[barbero]
            });
        }

        // Eliminar todos los servicios (excepto checkpoint)
        for (const key of Object.keys(servicios)) {
            if (key !== "checkpoint") {
                await remove(ref(database, `servicios/${key}`));
            }
        }

        showSuccessAlert(
            "Proceso completado",
            "La liquidación diaria ha sido guardada. Ve a la pestaña de reportes para visualizar la información."
        );
    } catch (error) {
        console.error("Error al procesar los datos:", error);
        showErrorAlert("Error", "Hubo un error al intentar finalizar el día.");
    }
});


// Asociar eventos
document.getElementById("btn-todos").addEventListener("click", mostrarTodosLosServicios);
document.getElementById("btn-barbero").addEventListener("click", mostrarServiciosPorBarbero);
document.getElementById("btn-liquidacion").addEventListener("click", mostrarLiquidacion);
