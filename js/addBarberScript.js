import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getCookie, deleteCookie } from "./sessionsUtils.js";

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

const barberosRef = ref(database, "barberos");
const versionRef = ref(database, "version");

const form = document.getElementById("barbero-form");

const btnShow = document.getElementById("showbarbers");
const tableBarbers = document.getElementById("table-barbers");

const btnDelete = document.getElementById("deletebarbers");

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

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const pin = document.getElementById("pin").value;

    if(!nombre || !telefono || !pin) {
        showWarningAlert("Advertencia", "Por favor, ingrese todos los campos.");
        return;
    }

    try {
        const snapshot = await get(barberosRef);

        if (snapshot.exists()) {
            const barbers = snapshot.val();
            const pinExists = Object.values(barbers).some(barber => barber.id == pin);
            if (pinExists) {
                showWarningAlert("El pin ya está ocupado.", "Por favor, elige otro.");
                return;
            }
        }

        let nuevoId = 1;

        if (snapshot.exists()) {
            const barberos = snapshot.val();
            const ids = Object.keys(barberos).map(Number);
            nuevoId = Math.max(...ids) + 1;
        }

        await set(ref(database, `barberos/${nuevoId}`), {
            id: pin,
            nom: nombre,
            telf: telefono
        });

        const versionSnapshot = await get(versionRef);
        let currentVersion = versionSnapshot.exists() ? versionSnapshot.val(): 0;
        currentVersion += 1;

        await set(versionRef, currentVersion);
        showSuccessAlert("Guardado exitoso.", "El barbero ha sido agregado con éxito.");
        form.reset();

    } catch (error) {
        console.error("Error al guardar datos:", error);
        showErrorAlert("Error.", "Ha ocurrido un error al guardar los datos.");
    }
});

btnShow.addEventListener("click", async () => {
    try {
        const snapshot = await get(barberosRef);

        if(snapshot.exists()) {
            const barberos = snapshot.val();
            tableBarbers.innerHTML = `<thead>
                <tr>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>PIN</th>
                </tr>
            </thead>`;

            Object.values(barberos).forEach((barbero) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${barbero.nom}</td>
                    <td>${barbero.telf}</td>
                    <td>${barbero.id}</td>
                    
                `;
                tableBarbers.appendChild(row);
            });
        } else {
            showWarningAlert("Advertencia.", "No hay barberos registrados.");
        }
    } catch (error) {
        console.error("Error al mostrar datos:", error);
        showErrorAlert("Error", "Error al mostrar los datos");
    }
});

btnDelete.addEventListener("click", async () => {
        const pinToDelete = document.getElementById("id").value.trim();
    
        if (!pinToDelete) {
            showWarningAlert("Advertencia.", "Por favor ingrese el PIN del barbero a eliminar.");
        }
    
        try {
            const snapshot = await get(barberosRef);
    
            if (snapshot.exists()) {
                const barberos = snapshot.val();
                let barberokeyToDelete = null;
    
                for (const [key, barbero] of Object.entries(barberos)) {
                    if (barbero.id == pinToDelete) {
                        barberokeyToDelete = key;
                        break;
                    }
                }

                if (barberokeyToDelete) {
                    await remove(ref(database, `barberos/${barberokeyToDelete}`));
                    showSuccessAlert("Eliminado.", "Barbero eliminado con éxito.");

                    const versionSnapshot = await get(versionRef);
                    let currentVersion = versionSnapshot.exists() ? versionSnapshot.val(): 0;
                    currentVersion += 1;

                    await set(versionRef, currentVersion);
                } else {
                    showWarningAlert("Advertencia.", `No se encontró el barbero con el PIN ${pinToDelete}`);
                }

            } else {
                showWarningAlert("Advertencia.", "No hay barberos registrados.");
            }
        } catch (error) {
            showErrorAlert("Error", "Error al eliminar el barbero");
        }
    
        document.getElementById("id").value = "";
});