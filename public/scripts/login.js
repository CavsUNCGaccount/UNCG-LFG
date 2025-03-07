document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector("form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission refresh

        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;

        try {
            // Change the port number if you need to use a different port (5000 is the default)
            const response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include", // Ensures session cookies are sent
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Login successful!");
                localStorage.setItem("user", JSON.stringify(data.user)); // Store user data locally
                window.location.href = "gamer-profile-page.html"; // Redirect to account page
            } else {
                alert(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Server error. Please try again later.");
        }
    });
});
