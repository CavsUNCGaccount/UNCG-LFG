document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("http://localhost:3001/auth/me", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            const avatar = data.profile_picture || "images/default-avatar.png";
            const role = data.role?.toLowerCase();

            document.getElementById("navbar-login").innerHTML = `
                <img src="${avatar}" alt="Profile" class="nav-avatar" id="profile-link">
            `;

            document.getElementById("profile-link").addEventListener("click", () => {
                if (role === "admin") {
                    window.location.href = "admin-profile-page.html";
                } else {
                    window.location.href = "gamer-profile-page.html";
                }
            });

        } else {
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
            credentials: 'include',
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

function displayGames(games) {
    const container = document.querySelector('#games .row');
    container.innerHTML = '';

    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'col';
        gameElement.innerHTML = `
            <div class="card game-card">
                <img src="${game.cover_image_url}" class="card-img-top" alt="${game.game_name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${game.game_name}</h5> 
                   <a href="community.html?game_name=${game.game_name}" class="btn btn-primary">Visit Community</a>
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

    setInterval(nextSlide, 5000);
    updateGameInfo();
});
