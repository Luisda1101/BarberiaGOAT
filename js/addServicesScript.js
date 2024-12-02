import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

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

const servicesPRef = ref(database, "serviciosP");
const versionRef = ref(database, "version");

const form = document.getElementById("service-form");

const btnShow = document.getElementById("showservices");
const tableServices = document.getElementById("table-services");

const btnDelete = document.getElementById("deleteservices");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const value = document.getElementById("value").value;
    const comission = document.getElementById("comission").value;

    if(!name || !value || !comission) {
        showWarningAlert("Advertencia", "Por favor, ingrese todos los campos.");
        return;
    }

    try {
        const snapshot = await get(servicesPRef);
        let nuevoId = 1;

        if (snapshot.exists()) {
            const services = snapshot.val();
            const ids = Object.keys(services).map(Number);
            nuevoId = Math.max(...ids) + 1;
        }

        await set(ref(database, `serviciosP/${nuevoId}`), {
            comision: comission,
            tipo: name,
            valor: value
        });

        const versionSnapshot = await get(versionRef);
        let currentVersion = versionSnapshot.exists() ? versionSnapshot.val(): 0;
        currentVersion += 1;

        await set(versionRef, currentVersion);
        showSuccessAlert("Éxito", "Servicio agregado con éxito.");
        form.reset();

    } catch (error) {
        showErrorAlert("Error", "Hubo un error al registrar el nuevo servicio");
    }
});

btnShow.addEventListener("click", async () => {
    try {
        const snapshot = await get(servicesPRef);

        if(snapshot.exists()) {
            const servicios = snapshot.val();
            tableServices.innerHTML = `<thead>
                <tr>
                    <th>Servicio</th>
                    <th>Valor</th>
                    <th>Comisión</th>
                </tr>
            </thead>`;

            Object.values(servicios).forEach((servicio) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${servicio.tipo}</td>
                    <td>${servicio.valor}</td>
                    <td>${servicio.comision}</td>
                `;
                tableServices.appendChild(row);
            });
        } else {
            showWarningAlert("Advertencia", "No hay servicios registrados.");
        }
    } catch (error) {
        showErrorAlert("Error", "Hubo un error al mostrar los servicios");
    }
});

btnDelete.addEventListener("click", async () => {
    const nameToDelete = document.getElementById("name-delete").value.trim();

    if (!nameToDelete) {
        showWarningAlert("Advertencia", "Por favor ingrese el nombre del servicio a eliminar");
    }

    try {
        const snapshot = await get(servicesPRef);

        if (snapshot.exists()) {
            const services = snapshot.val();
            let userKeyToDelete = null;

            for (const [key, service] of Object.entries(services)) {
                if (service.tipo == nameToDelete) {
                    userKeyToDelete = key;
                    break;
                }
            }

            if (userKeyToDelete) {
                await remove(ref(database, `serviciosP/${userKeyToDelete}`));
                showSuccessAlert("Éxito", `El servicio ${nameToDelete} ha sido eliminado con éxito`);

                const versionSnapshot = await get(versionRef);
                let currentVersion = versionSnapshot.exists() ? versionSnapshot.val(): 0;
                currentVersion += 1;

                await set(versionRef, currentVersion);
            } else {
                showWarningAlert("Advertencia", `No se encontró un servicio con el nombre ${nameToDelete}`);
            }

        } else {
            showWarningAlert("Advertencia", "No hay servicios registrados.");
        }
    } catch (error) {
        showErrorAlert("Error", `Hubo un error al intentar eliminar el servicio ${nameToDelete}`);
    }

    document.getElementById("name").value = "";
});
