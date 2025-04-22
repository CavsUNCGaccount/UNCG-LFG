document.addEventListener("DOMContentLoaded", async function () {
    // Display default navbar structure
    document.getElementById("navbar-container").innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <a class="navbar-brand d-flex align-items-center" href="index.html">
                        <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo" width="50" height="50">
                        <span class="ms-2 text-light fs-4">UNCG LFG</span>
                    </a>
                    <span id="navbar-timer" class="text-warning ms-4 fs-5 fw-semibold"></span>
                </div>
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
            console.log("Data from session:", data);
            const role = data.role?.toLowerCase();
            const profilePage = role === "admin" ? "admin-profile-page.html" : "gamer-profile-page.html";
            const profilePicture = data.profile_picture ? `http://localhost:3001${data.profile_picture}` : "/uploads/default-avatar.png";

            // Show avatar, username, timer, and logout button
            document.getElementById("navbar-login").innerHTML = `
                <span id="navbar-timer" class="text-light me-3 small fw-bold"></span>
                <img src="${profilePicture}" 
                     alt="Profile" class="nav-avatar rounded-circle" id="profile-link" title="${data.username}" style="width: 40px; height: 40px; cursor: pointer;">
                <button class="btn btn-danger ms-2" onclick="logout()">Logout</button>
            `;

            document.getElementById("profile-link").addEventListener("click", () => {
                window.location.href = profilePage;
            });

            // Start the session timer
            fetchNextSessionTimer();
        } else {
            // Not logged in
            document.getElementById("navbar-login").innerHTML = `
                <a href="login.html" class="btn btn-outline-light">Login</a>
                <a href="signup.html" class="btn btn-warning">Sign Up</a>
            `;
        }
    } catch (error) {
        console.error("Error checking session:", error);

        document.getElementById("navbar-login").innerHTML = `
            <a href="login.html" class="btn btn-outline-light">Login</a>
            <a href="signup.html" class="btn btn-warning">Sign Up</a>
        `;
    }
});

// Function to fetch and display the next session timer
async function fetchNextSessionTimer() {
    const navbarTimer = document.getElementById("navbar-timer");

    try {
        const response = await fetch("http://localhost:3001/community/next-session", {
            credentials: "include"
        });

        console.log("Response from next session:", response);

        if (!response.ok) {
            if (response.status === 404) {
                navbarTimer.textContent = "No upcoming sessions.";
            } else {
                navbarTimer.textContent = "Error fetching session.";
            }
            return;
        }

        const nextSession = await response.json();
        const sessionStartTime = new Date(nextSession.start_time);

        function updateTimer() {
            const now = new Date();
            const timeDiff = sessionStartTime - now;

            if (timeDiff <= 0) {
                navbarTimer.textContent = "Your session has started!";
                clearInterval(timerInterval);
                return;
            }

            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            navbarTimer.textContent = `Next session: ${hours}h ${minutes}m ${seconds}s`;
        }

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
    } catch (error) {
        console.error("Error fetching next session:", error);
        if (navbarTimer) {
            navbarTimer.textContent = "Error fetching session.";
        }
    }
}

// Logout function
function logout() {
    fetch("http://localhost:3001/auth/logout", {
        method: "POST",
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            
            window.location.href = "index.html";
        })
        .catch(error => console.error("Error logging out:", error));
}
