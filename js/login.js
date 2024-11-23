import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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
                   MSJOKadmi();
                 //   window.location.href = "/html/pagAdmin.html";
                } else if (rolUsuario == "Suplente") {
                    MSJOKsuple();
                  //  window.location.href = "/html/pagSupl.html"
                }else {
                    Swal.fire({
                        title: "Error",
                        text: "Rol no reconocido. Por favor, contacta al administrador.",
                        icon: "error",
                        confirmButtonText: "Entendido",
                    });
                
                    
                }
            } else {
                Swal.fire({
                    title: "Error",
                    text: "Contraseña o usuario incorrectos. Inténtalo de nuevo.",
                    icon: "error",
                    confirmButtonText: "Reintentar",
                });
            }
        } else {
            Swal.fire({
                title: "Error",
                text: "No se encontraron usuarios registrados.",
                icon: "error",
                confirmButtonText: "Reintentar",
            });
           
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Hubo un error al verificar los datos. Inténtalo de nuevo.");
    }
});

const MSJOKsuple = () => {
    Swal.fire({
        title: "Buen trabajo",
        text: "Inicio de sesión exitoso como suplente!",
        icon: "success",
        timer: 3500,
        timerProgressBar: true,
    }).then(() => {
        // Redirigir después de que la alerta cierre
        window.location.href = "/html/pagSupl.html";
    });
};

const MSJOKadmi = () => {
    Swal.fire({
        title: "Buen trabajo",
        text: "Inicio de sesión exitoso como Administrador!",
        icon: "success",
        timer: 3500,
        timerProgressBar: true,
    }).then(() => {
        // Redirigir después de que la alerta cierre
        window.location.href = "/html/pagAdmin.html";
    });
};