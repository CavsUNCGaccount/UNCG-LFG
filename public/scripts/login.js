document.addEventListener("DOMContentLoaded", function () { 
    const loginForm = document.querySelector("form");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission refresh

        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[type="password"]').value;

        try {
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
                

                // Store user details locally
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect user based on role
                if (data.user && data.user.role === "Admin") {
                    window.location.href = "admin-profile-page.html"; // Admin page
                } else {
                    window.location.href = "gamer-profile-page.html"; // Gamer page
                }
            } else {
                alert(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            alert("Server error. Please try again later.");
        }
    });
});
