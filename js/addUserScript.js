import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

const usuariosRef = ref(database, "usuarios");
const versionRef = ref(database, "version");

const form = document.getElementById("user-form");

const btnShow = document.getElementById("showusers");
const tableUsers = document.getElementById("table-users");

const btnDelete = document.getElementById("deleteusers");

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

function generarLlaveAleatoria(longitud) {
    const caracteres = '123456';
    let llave = '';
    for (let i = 0; i < longitud; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        llave += caracteres[indice];
    }
    return llave;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const rol = document.querySelector('input[name="rol"]:checked').value;
    const keyRand = generarLlaveAleatoria(4);

    if (!email || !password || !rol) {
        showWarningAlert("Advertencia", "Por favor, ingrese todos los campos.");
        return;
    }

    try {
        // Registrar usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Guardar el rol en la colección 'roles' bajo el UID
        await set(ref(database, `roles/${user.uid}`), {
            rol: rol,
            email: email
        });

        // Obtener el siguiente índice autoincrementable para la colección 'usuarios'
        const usuariosRef = ref(database, "usuarios");
        const snapshot = await get(usuariosRef);
        let nuevoId = 1;
        if (snapshot.exists()) {
            const users = snapshot.val();
            const ids = Object.keys(users).map(Number).filter(n => !isNaN(n));
            if (ids.length > 0) {
                nuevoId = Math.max(...ids) + 1;
            }
        }
        // Guardar el correo y la key en la colección 'usuarios' bajo el índice autoincrementable
        await set(ref(database, `usuarios/${nuevoId}`), {
            correo: email,
            key: keyRand,
            rol: rol
        });

        const versionSnapshot = await get(versionRef);
        let currentVersion = versionSnapshot.exists() ? versionSnapshot.val() : 0;
        currentVersion += 1;

        await set(versionRef, currentVersion);
        showSuccessAlert("Éxito", "Usuario agregado con éxito.");
        form.reset();

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
            showErrorAlert("Error", "El correo ya está registrado en el sistema.");
        } else {
            showErrorAlert("Error", "Hubo un error al registrar al nuevo usuario");
        }
    }
});

btnShow.addEventListener("click", async () => {
    try {
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            tableUsers.innerHTML = `<thead>
                <tr>
                    <th>Email</th>
                    <th>Rol</th>
                </tr>
            </thead>`;

            Object.values(usuarios).forEach((usuario) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${usuario.correo}</td>
                    <td>${usuario.rol}</td>
                `;
                tableUsers.appendChild(row);
            });
        } else {
            showWarningAlert("Advertencia", "No hay usuarios registrados.");
        }
    } catch (error) {
        showErrorAlert("Error", "Hubo un error al mostrar los usuarios");
    }
});

btnDelete.addEventListener("click", async () => {
    const emailToDelete = document.getElementById("email-delete").value.trim();

    if (!emailToDelete) {
        showWarningAlert("Advertencia", "Por favor ingrese el email del usuario a eliminar");
    }

    try {
        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            let userKeyToDelete = null;

            for (const [key, user] of Object.entries(usuarios)) {
                if (user.correo == emailToDelete) {
                    userKeyToDelete = key;
                    break;
                }
            }

            if (userKeyToDelete) {
                await remove(ref(database, `usuarios/${userKeyToDelete}`));
                showSuccessAlert("Éxito", `El usuario ${emailToDelete} ha sido eliminado con éxito`);

                const versionSnapshot = await get(versionRef);
                let currentVersion = versionSnapshot.exists() ? versionSnapshot.val() : 0;
                currentVersion += 1;

                await set(versionRef, currentVersion);
            } else {
                showWarningAlert("Advertencia", `No se encontró un usuario con el email ${emailToDelete}`);
            }

        } else {
            showWarningAlert("Advertencia", "No hay usuarios registrados.");
        }
    } catch (error) {
        showErrorAlert("Error", `Hubo un error al intentar eliminar el usuario ${emailToDelete}`);
    }

    document.getElementById("email").value = "";
});
