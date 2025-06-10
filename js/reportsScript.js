import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getCookie, deleteCookie } from "./sessionsUtils.js";

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

let liquidacionesFiltradas = [];
let paginaActual = 1;
const filasPorPagina = 15; // Cambia este valor según lo que desees mostrar por página

const btnReports = document.getElementById("btn-reports");
const tablaPorBarbero = document.getElementById("tablaPorBarbero");
const dataBarberos = document.getElementById("data-barberos");

const auth = getAuth();

const sessionCookie = getCookie("user");

onAuthStateChanged(auth, (user) => {
    const session = sessionCookie ? JSON.parse(sessionCookie) : null;
    if (!user || !session) {
        window.location.href = "/BarberiaGOAT/index.html";
    } else {
        const { rol, loginTime, expireTime } = session;
        const currentTime = Date.now();
        if (loginTime && expireTime && (currentTime - loginTime > expireTime)) {
        // Sesión expirada
        deleteCookie("user");
        window.location.href = "/BarberiaGOAT/index.html";
        return;
    }
        if (rol !== "Administrador" && rol !== "Suplente") {
            showErrorAlert("Acceso denegado", "No tienes permiso para acceder a esta página.");
            window.location.href = "/BarberiaGOAT/index.html";
        } else {
            document.getElementById("user-role").textContent = `rol: ${rol}`;
        }
    }
});

function renderizarPaginacion() {
    const paginacion = document.getElementById("paginacionBarberos");
    paginacion.innerHTML = "";
    const totalPaginas = Math.ceil(liquidacionesFiltradas.length / filasPorPagina);
    

    // Botón anterior
    const liPrev = document.createElement("li");
    liPrev.className = "page-item" + (paginaActual === 1 ? " disabled" : "");
    liPrev.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
    liPrev.onclick = (e) => {
        e.preventDefault();
        if (paginaActual > 1) {
            paginaActual--;
            mostrarPaginaLiquidaciones();
        }
    };
    paginacion.appendChild(liPrev);

    // Botones de página
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement("li");
        li.className = "page-item" + (i === paginaActual ? " active" : "");
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = (e) => {
            e.preventDefault();
            paginaActual = i;
            mostrarPaginaLiquidaciones();
        };
        paginacion.appendChild(li);
    }

    // Botón siguiente
    const liNext = document.createElement("li");
    liNext.className = "page-item" + (paginaActual === totalPaginas ? " disabled" : "");
    liNext.innerHTML = `<a class="page-link" href="#">Siguiente</a>`;
    liNext.onclick = (e) => {
        e.preventDefault();
        if (paginaActual < totalPaginas) {
            paginaActual++;
            mostrarPaginaLiquidaciones();
        }
    };
    paginacion.appendChild(liNext);
}

function procesarLiquidaciones(data) {
    dataBarberos.style.display = "block";
    liquidacionesFiltradas = [];
    for (const fecha in data) {
        if (fecha === "checkpoint") continue;
        const barberosPorFecha = data[fecha];
        // Encabezado de fecha
        liquidacionesFiltradas.push({ tipo: "fecha", fecha });
        // Encabezado de columnas
        liquidacionesFiltradas.push({ tipo: "header" });
        // Cada barbero y su total
        for (const key in barberosPorFecha) {
            const barberoObj = barberosPorFecha[key];
            if (!barberoObj || !barberoObj.nombre) continue;
            liquidacionesFiltradas.push({
                tipo: "barbero",
                nombre: barberoObj.nombre,
                total: barberoObj.ganancia
            });
        }
    }
    paginaActual = 1;
    mostrarPaginaLiquidaciones();
}

function mostrarPaginaLiquidaciones() {
    tablaPorBarbero.innerHTML = "";

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const filasPagina = liquidacionesFiltradas.slice(inicio, fin);

    filasPagina.forEach(item => {
        if (item.tipo === "fecha") {
            const filaFecha = document.createElement("tr");
            const thFecha = document.createElement("th");
            thFecha.colSpan = 2;
            thFecha.className = "table-dark text-center";
            thFecha.textContent = item.fecha;
            filaFecha.appendChild(thFecha);
            tablaPorBarbero.appendChild(filaFecha);
        } else if (item.tipo === "header") {
            const filaHeaders = document.createElement("tr");
            ["Nombre", "Total ganado"].forEach(texto => {
                const th = document.createElement("th");
                th.textContent = texto;
                filaHeaders.appendChild(th);
            });
            tablaPorBarbero.appendChild(filaHeaders);
        } else if (item.tipo === "barbero") {
            const filaBarbero = document.createElement("tr");
            filaBarbero.innerHTML = `
                <td>${item.nombre}</td>
                <td>$${item.total.toFixed(2)}</td>
            `;
            tablaPorBarbero.appendChild(filaBarbero);
        }
    });

    renderizarPaginacion();
}

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

btnReports.addEventListener("click", () => {
    obtenerLiquidaciones();
});