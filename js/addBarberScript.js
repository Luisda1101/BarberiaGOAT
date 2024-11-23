import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

        
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

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const pin = document.getElementById("pin").value;

    if(!nombre || !telefono || !pin) {
        
        alert("Por favor, complete todos los campos");
        return;
    }

    try {
        const snapshot = await get(barberosRef);

        if (snapshot.exists()) {
            const barbers = snapshot.val();
            const pinExists = Object.values(barbers).some(barber => barber.id == pin);
            if (pinExists) {
                MSJerrorrol();
               // alert("El pin ya está ocupado. Por favor, elija otro");
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
        MSJOKresgistro ();
       // alert("Barbero registrado exitosamente");
        form.reset();

    } catch (error) {
        console.error("Error al guardar datos:", error);
        MSJerrorguardar();
       // alert("Hubo un error al registrar al barbero");
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
            alert("No hay barberos registrados.");
        }
    } catch (error) {
        console.error("Error al mostrar datos:", error);
        MSJerrorobtencion();
        //alert("Hubo un error al obtener los barberos.");
    }
});

btnDelete.addEventListener("click", async () => {
        const pinToDelete = document.getElementById("id").value.trim();
        console.log("PIN ingresado:", pinToDelete);
    
        if (!pinToDelete) {
            alert("Por favor ingrese el PIN del barbero a eliminar.");
            console.log("No se ha ingresado un PIN.");
        }
    
        try {
            const snapshot = await get(barberosRef);
    
            if (snapshot.exists()) {
                const barberos = snapshot.val();
                let barberokeyToDelete = null;
    
                for (const [key, barbero] of Object.entries(barberos)) {
                    console.log(`Comparando PIN: ${barbero.id} con PIN ingresado: ${pinToDelete}`);
                    if (barbero.id == pinToDelete) {
                        barberokeyToDelete = key;
                        break;
                    }
                }

                if (barberokeyToDelete) {
                    await remove(ref(database, `barberos/${barberokeyToDelete}`));
                    alert("Barbero eliminado con éxito.");
                    console.log(`Barbero con clave ${barberokeyToDelete} eliminado.`);

                    const versionSnapshot = await get(versionRef);
                    let currentVersion = versionSnapshot.exists() ? versionSnapshot.val(): 0;
                    currentVersion += 1;

                    await set(versionRef, currentVersion);
                } else {
                    MSJerrrpin();
                   // alert("No se encontró un barbero con el PIN ingresado.");
                    console.log("No se encontró un barbero con el PIN ingresado.");
                }

            } else {
                MSJerrorbarberoregistrado();
              //  alert("No hay barberos registrados.");
                console.log("No hay barberos registrados.");
            }
        } catch (error) {
            console.error("Error al eliminar el barbero:", error); 
            MSJerroreliminarbarbero();
          //  alert("Hubo un error al intentar eliminar al barbero.");
        }
    
        document.getElementById("id").value = "";
});

const MSJerrorrol = () => {
    Swal.fire({
        title: "Error",
        text: "El pin ya está ocupado. Por favor, elija otro",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
const MSJOKresgistro = () => {
    Swal.fire({
        title: "Buen trabajo",
        text: "Inicio de sesión exitoso como Administrador!",
        icon: "success",
        timer: 3500,
        timerProgressBar: true,
    
    });
};
const MSJerrorguardar = () => {
    Swal.fire({
        title: "Error",
        text: "Hubo un error al registrar al barbero",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
const MSJerrorobtencion = () => {
    Swal.fire({
        title: "Error",
        text: "Hubo un error al obtener los barberos.",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
const MSJerrrpin = () => {
    Swal.fire({
        title: "Error",
        text: "No se encontró un barbero con el PIN ingresado.",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
 
const MSJerrorbarberoregistrado = () => {
    Swal.fire({
        title: "Error",
        text: "No hay barberos registrados.",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
const MSJerroreliminarbarbero = () => {
    Swal.fire({
        title: "Error",
        text: "Hubo un error al intentar eliminar al barbero.",
        icon: "info",
        confirmButtonText: "Reintentar",
    });
} ;
