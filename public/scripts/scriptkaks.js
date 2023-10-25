document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get("error");

    if (errorType === "passwordMismatch") {
        const alertMessage = document.createElement("h4");
        alertMessage.className = "alert alert-danger mt-4";
        alertMessage.textContent = "Passwords didn't match!";
        document.body.appendChild(alertMessage);
    } else if (errorType === "emailInUse") {
        const alertMessage = document.createElement("h4");
        alertMessage.className = "alert alert-danger mt-4";
        alertMessage.textContent = "This email is already in use";
        document.body.appendChild(alertMessage);
    } else if (errorType === "serverError") {
        const alertMessage = document.createElement("h4");
        alertMessage.className = "alert alert-danger mt-4";
        alertMessage.textContent = "Server error, please try again!";
        document.body.appendChild(alertMessage);
    }
});
