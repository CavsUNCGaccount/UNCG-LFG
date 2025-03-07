document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Change the port number if you need to use a different port (3001 is the default)
        const response = await fetch("http://localhost:3001/auth/me", { 
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            // User is logged in, update UI
            document.getElementById("navbar-login").innerHTML = `
                <img src="images/default-avatar.png" alt="Profile" class="nav-avatar" id="profile-link">
            `;

            // Redirect user to account page when clicking avatar
            document.getElementById("profile-link").addEventListener("click", () => {
                window.location.href = "gamer-profile-page.html";
            });

        } else {
            // User is NOT logged in, show login/signup
            document.getElementById("navbar-login").innerHTML = `
                <a href="login.html" class="btn btn-outline-light">Login</a>
                <a href="signup.html" class="btn btn-warning">Sign Up</a>
            `;
        }
    } catch (error) {
        console.error("Error checking session:", error);
    }

    // Fetch and display games
    const games = await fetchGames();
    displayGames(games);
});

async function fetchGames() {
    try {
        const response = await fetch('/community/games', {
            method: 'GET',
            credentials: 'include', // Include cookies if needed
        });
        if (!response.ok) {
            throw new Error(`Error fetching games: ${response.statusText}`);
        }
        const data = await response.json();
        return data.games;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Function to display games on the homepage (index.html)
function displayGames(games) {
    const container = document.querySelector('#games .row');
    container.innerHTML = ''; // Clear any existing content

    // Loop through games and add to the container
    // Note: I still need to update line 70 so that it redirects to the correct game community page with a route parameter
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'col';
        gameElement.innerHTML = `
            <div class="card game-card">
                <img src="${game.cover_image_url}" class="card-img-top" alt="${game.game_name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${game.game_name}</h5> 
                    <a href="community.html?game=${encodeURIComponent(game.game_name)}&image=${encodeURIComponent(game.cover_image_url)}" class="btn btn-primary">Visit Community</a>
                </div>
            </div>
        `;
        container.appendChild(gameElement);
    });
}

// Slideshow Script
document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".slideshow img");
    const titleElement = document.getElementById("game-title");
    const linkElement = document.getElementById("game-link");
    let currentIndex = 0;

    function updateGameInfo() {
        titleElement.textContent = images[currentIndex].alt;
        linkElement.href = images[currentIndex].getAttribute("data-link");
    }

    function nextSlide() {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
        updateGameInfo();
    }

    // Auto transition 1 second for every 1000 (so 5 seconds is 5000)
    setInterval(nextSlide, 5000);

    // Initialize first title
    updateGameInfo();
});