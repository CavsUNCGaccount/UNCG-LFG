document.addEventListener("DOMContentLoaded", async function () {
    document.getElementById("navbar-container").innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo" width="50"
                        height="50">
                    UNCG LFG
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html#about">About</a></li>
                        <li class="nav-item"><a class="nav-link" href="index.html#features">Features</a></li>
                        <li class="nav-item"><a class="nav-link" href="index.html#games">Games</a></li>
                        <li class="nav-item"><a class="nav-link" href="app-policy.html">Policy</a></li>
                        <li id="navbar-login"></li> <!-- Login/Profile will be updated dynamically -->
                    </ul>
                </div>
            </div>
        </nav>
    `;

       // Check if user is logged in
       try {
        const response = await fetch("http://localhost:5000/auth/me", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            // If logged in, show avatar
            document.getElementById("navbar-login").innerHTML = `
                <img src="images/default-avatar.png" alt="Profile" class="nav-avatar" id="profile-link">
            `;

            document.getElementById("profile-link").addEventListener("click", () => {
                window.location.href = "gamer-profile-page.html";
            });
        } else {
            // If not logged in, show login/signup buttons
            document.getElementById("navbar-login").innerHTML = `
                <a href="login.html" class="btn btn-outline-light">Login</a>
                <a href="signup.html" class="btn btn-warning">Sign Up</a>
            `;
        }
    } catch (error) {
        console.error("Error checking session:", error);
    }

});
