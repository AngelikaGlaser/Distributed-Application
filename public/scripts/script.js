// JavaScript to handle live alerts
document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("name-reg");
    const emailInput = document.getElementById("email-reg");
    const usernameError = document.getElementById("username-error");
    const emailError = document.getElementById("email-error");

    // Event listener for username input
    usernameInput.addEventListener("blur", async () => {
        const username = usernameInput.value;
        const response = await checkUsernameAvailability(username);
        if (response.usernameInUse) {
            usernameError.style.display = "block";
        } else {
            usernameError.style.display = "none";
        }
    });

    // Event listener for email input
    emailInput.addEventListener("blur", async () => {
        const email = emailInput.value;
        const response = await checkEmailAvailability(email);
        if (response.emailInUse) {
            emailError.style.display = "block";
        } else {
            emailError.style.display = "none";
        }
    });

    // Function to check username availability
    async function checkUsernameAvailability(username) {
        const response = await fetch(`/check-username?username=${username}`);
        return response.json();
    }

    // Function to check email availability
    async function checkEmailAvailability(email) {
        const response = await fetch(`/check-email?email=${email}`);
        return response.json();
    }
});