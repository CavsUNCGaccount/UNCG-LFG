document.addEventListener("DOMContentLoaded", async function () {
    // Display default navbar structure
    document.getElementById("navbar-container").innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo" width="50" height="50">
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
        const response = await fetch("http://localhost:3001/auth/me", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Session not found");
        }

        const data = await response.json();

        // Determine user role and profile redirection
        if (data.user_id) {
            console.log("Data from session:", data); // Debugging log
            let profilePage = data.role === "Admin" ? "admin-profile-page.html" : "gamer-profile-page.html";
            let profilePicture = data.profile_picture ? `http://localhost:3001${data.profile_picture}` : "/uploads/default-avatar.png";
            console.log("Profile Picture URL:", profilePicture); // Debugging log

            // Show avatar, username, and logout button
            document.getElementById("navbar-login").innerHTML = `
                <img src="${profilePicture}" 
                     alt="Profile" class="nav-avatar rounded-circle" id="profile-link" title="${data.username}">
                <button class="btn btn-danger ms-2" onclick="logout()">Logout</button>
            `;

            // Redirect to the correct profile page
            document.getElementById("profile-link").addEventListener("click", () => {
                window.location.href = profilePage;
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

        // Default to logged-out state in case of an error
        document.getElementById("navbar-login").innerHTML = `
            <a href="login.html" class="btn btn-outline-light">Login</a>
            <a href="signup.html" class="btn btn-warning">Sign Up</a>
        `;
    }
});

// Logout function
function logout() {
    fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message || "Logged out");
        window.location.href = "index.html"; // Redirect to homepage after logout
    })
    .catch(error => console.error("Error logging out:", error));
}
