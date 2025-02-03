document.addEventListener("DOMContentLoaded", function () {
    // Get game data from URL parameters
    const params = new URLSearchParams(window.location.search);
    const gameTitle = params.get("game");
    const gameImage = params.get("image");

    // Update the page with the game details
    if (gameTitle) {
        document.getElementById("game-title").textContent = gameTitle;
    }
    
    if (gameImage) {
        document.getElementById("game-banner-img").src = gameImage;
        document.getElementById("game-banner-img").alt = gameTitle;
    }

    // Load community data dynamically (players, sessions, discussions)
    loadCommunityData(gameTitle);
});

function loadCommunityData(gameTitle) {
    console.log(`Loading community data for ${gameTitle}`);

    document.getElementById("player-list").innerHTML = "<li>Loading players...</li>";
    document.getElementById("session-list").innerHTML = "<li>Loading sessions...</li>";
    document.getElementById("chat-messages").innerHTML = "<li>Loading discussions...</li>";

    setTimeout(() => {
        document.getElementById("player-list").innerHTML = "<li>Player1</li><li>Player2</li><li>Player3</li>";
        document.getElementById("session-list").innerHTML = "<li>Session1: 8 PM EST</li><li>Session2: 10 PM EST</li>";
        document.getElementById("chat-messages").innerHTML = "<li>Discussion1: Strategies</li><li>Discussion2: Game Updates</li>";
    }, 1000);
}
