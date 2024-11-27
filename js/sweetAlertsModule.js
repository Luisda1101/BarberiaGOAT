import "https://cdn.jsdelivr.net/npm/sweetalert2@11";

// Alerta de éxito
export function showSuccessAlert(title = "¡Éxito!", text = "Operación completada correctamente") {
    Swal.fire({
        title,
        text,
        icon: "success",
        confirmButtonText: "Aceptar",
    });
}

// Alerta de error
export function showErrorAlert(title = "Error", text = "Ocurrió un problema") {
    Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: "Entendido",
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
