document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector("form");

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.querySelector('input[type="text"]').value;
        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            // Change the port number if you need to use a different port (5000 is the default)
            const response = await fetch("http://localhost:5000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            console.log("Signup Response:", data); // Debugging

            if (response.ok) {
                alert("Signup successful! Redirecting to login...");
                window.location.href = "login.html"; // Redirect to login page
            } else {
                alert(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Error signing up:", error);
            alert("Server error. Please try again later.");
        }
    });
});
