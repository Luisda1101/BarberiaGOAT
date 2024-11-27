import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11";


const msgE = () => {
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
