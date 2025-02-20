document.addEventListener("DOMContentLoaded", function () {
    // Get game data from URL parameters
    const params = new URLSearchParams(window.location.search);
    const gameTitle = params.get("game");
    const gameImage = params.get("image");
    const gameDescription = params.get("description");

    // Update the page with the game details
    if (gameTitle) {
        document.getElementById("game-title").textContent = gameTitle;
    }
    
    if (gameImage) {
        document.getElementById("game-cover-img").src = gameImage;
        document.getElementById("game-cover-img").alt = gameTitle;
    }

    if (gameDescription) {
        document.getElementById("game-description").textContent = gameDescription;
    }

    // Load community data dynamically
    loadCommunityData(gameTitle);
});

function loadCommunityData(gameTitle) {
    console.log(`Loading community data for ${gameTitle}`);

}
