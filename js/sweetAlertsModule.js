import "https://cdn.jsdelivr.net/npm/sweetalert2@11";

// Alerta de éxito
export function showSuccessAlert(title, text, timer) {
    return Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: "Aceptar",
        timer,
        timerProgressBar: true,
    });
}

// Alerta de error
export function showErrorAlert(title, text, timer) {
    return Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: "Entendido",
        timer,
        timerProgressBar: true,
    });
}

// Alerta de advertencia
export function showWarningAlert(title = "Advertencia", text = "Revisa esta información") {
    Swal.fire({
        title,
        text,
        icon: "warning",
        confirmButtonText: "Ok",
    });
}
