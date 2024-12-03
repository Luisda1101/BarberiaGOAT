import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

const btnEndDay = document.getElementById("btn-terminardia");

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

    const contenedor = document.getElementById("tablaPorBarbero");
    contenedor.innerHTML = "";

    onValue(serviciosRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            const serviciosPorBarbero = {};

            for (const id in data) {
                const servicio = data[id];
                const barbero = servicio.nombre || "Desconocido";

                if (!serviciosPorBarbero[barbero]) {
                    serviciosPorBarbero[barbero] = [];
                }

                serviciosPorBarbero[barbero].push(servicio);
            }

            // Crear tablas por barbero
            for (const barbero in serviciosPorBarbero) {
                const tabla = document.createElement("table");
                tabla.classList.add("tablaBarbero");
                const thead = tabla.createTHead();
                const th = thead.insertRow().insertCell(0);
                th.colSpan = 2;
                th.textContent = `Barbero: ${barbero}`;
                th.style.textAlign = "center";
                th.style.fontWeight = "bold";
                


                const tbody = tabla.createTBody();
                serviciosPorBarbero[barbero].forEach((servicio) => {
                    const fila = tbody.insertRow();
                    fila.insertCell(0).textContent = servicio.tipo;
                    fila.insertCell(1).textContent = servicio.valor;
                });

                contenedor.appendChild(tabla);
            }
        } else {
            contenedor.innerHTML = `<p>No se encontraron servicios</p>`;
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
                if (barbero == "Desconocido"){
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
        console.log("Generando la fecha actual...");
        const today = new Date();
        const formattedDate = today
            .toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");
        console.log("Fecha generada:", formattedDate);

        // Preparar la referencia para liquidaciones con el nodo de fecha
        console.log(`Preparando referencia para 'liquidaciones/${formattedDate}'...`);
        const liquidacionesRef = ref(database, `liquidaciones/${formattedDate}`);

        // Crear una estructura para guardar múltiples nodos bajo la fecha
        let dataToMove = {};

        console.log("Procesando datos para mover a liquidaciones...");
        for (const [key, detalles] of Object.entries(servicios)) {
            if (key !== "checkpoint") {
                console.log(`Incluyendo el nodo '${key}' en los datos para liquidaciones.`);
                // Agregar cada servicio con su clave única bajo el nodo de fecha
                dataToMove[key] = detalles;
                // Eliminar el nodo de 'servicios'
                console.log(`Eliminando nodo '${key}' de la colección 'servicios'...`);
                await remove(ref(database, `servicios/${key}`));
                console.log(`Nodo '${key}' eliminado.`);
            } else {
                console.log(`Nodo '${key}' identificado como 'checkpoint'; se omitirá.`);
            }
        }

        console.log("Datos consolidados para liquidaciones:", dataToMove);

        // Guardar en liquidaciones con la fecha como nodo
        console.log("Guardando datos en 'liquidaciones'...");
        await set(liquidacionesRef, dataToMove);
        console.log("Datos guardados exitosamente en 'liquidaciones'.");

        showSuccessAlert(
            "Proceso completado",
            "Los datos han sido guardados. Ve a la pestaña de reportes para visualizar la información."
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
