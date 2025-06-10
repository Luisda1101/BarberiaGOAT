import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { setCookie } from "./sessionsUtils.js";

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
const auth = getAuth();

const loginForm = document.getElementById("login-form");

const timeSesion = 30; // minutos

function login(email, password){
    signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        const user = userCredential.user;
        const rolRef = ref(database, `roles/${user.uid}/rol`);
        const snapshot = await get(rolRef);
        const rol = snapshot.exists() ? snapshot.val() : "";
        setCookie("user", JSON.stringify({
            uid: user.uid,
            rol,
            loginTime: Date.now(),
            expireTime: timeSesion * 60 * 1000 
        }), timeSesion);
        showSuccessAlert("Login exitoso", "Bienvenido a la aplicación", 3000).then(() => {
            window.location.href = rol === "Administrador" ? "/BarberiaGOAT/html/pagAdmin.html" : "/BarberiaGOAT/html/pagSupl.html";
        });
    })
    .catch((error) => {
        showErrorAlert("Error de login", "Por favor, verifica tus credenciales e inténtalo de nuevo.", 3000);
        console.log(error);
    })
}

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
});