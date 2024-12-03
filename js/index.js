import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const usuariosRef = ref(database, "usuarios");

        const snapshot = await get(usuariosRef);

        if (snapshot.exists()) {
            const usuarios = snapshot.val();
            let usuarioEncontrado = false;
            let rolUsuario = "";

            for (const id in usuarios) {
                const usuario = usuarios[id];
                if (usuario.correo == email && usuario.contr == password) {
                    usuarioEncontrado = true;
                    rolUsuario = usuario.rol;
                    break;
                }
            }

            if(usuarioEncontrado == true) {
                if(rolUsuario == "Administrador"){
                    showSuccessAlert("Éxito", "Inicio como administrador");
                    setTimeout(() => {
                        window.location.href = "/BarberiaGOAT/html/pagAdmin.html";
                    }, 3000);
                } else if (rolUsuario == "Suplente") {
                    showSuccessAlert("Éxito", "Inicio como suplente");
                    setTimeout(() => {
                        window.location.href = "/BarberiaGOAT/html/pagSupl.html";
                    }, 3000);
                }else {
                    showErrorAlert("Error", "Rol no conocido, por favor contacta con el administrador");
                }
            } else {
                showErrorAlert("Error", "Correo o contraseña incorrectos");
            }
        } else {
           showWarningAlert("Advertencia", "No hay usuarios registrados");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Hubo un error al verificar los datos. Inténtalo de nuevo.");
    }
});
