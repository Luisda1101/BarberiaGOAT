import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { deleteCookie } from "./sessionsUtils.js";

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        const auth = getAuth();
        signOut(auth).then(() => {
            deleteCookie("user");
            window.location.href = "/BarberiaGOAT/index.html";
        });
    });
}