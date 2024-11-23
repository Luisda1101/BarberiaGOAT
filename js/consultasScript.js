import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Configuración de Firebase
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

// Mostrar todos los servicios
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
    contenedor.innerHTML = ""; // Limpiar el contenido

    onValue(serviciosRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
            const serviciosPorBarbero = {};

            // Agrupar servicios por barbero
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

// Mostrar liquidación
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
                const fila = tbody.insertRow();
                fila.insertCell(0).textContent = barbero;
                fila.insertCell(1).textContent = `$${liquidacionPorBarbero[barbero].toFixed(2)}`;
            }
        } else {
            tbody.innerHTML = `<tr><td colspan="2">No se encontraron datos</td></tr>`;
        }
    });
}

// Asociar eventos
document.getElementById("btn-todos").addEventListener("click", mostrarTodosLosServicios);
document.getElementById("btn-barbero").addEventListener("click", mostrarServiciosPorBarbero);
document.getElementById("btn-liquidacion").addEventListener("click", mostrarLiquidacion);


