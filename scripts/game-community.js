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
        document.getElementById("game-banner").src = gameImage;
    }

    // Placeholder for dynamically loading community data (players, sessions, discussions)
    loadCommunityData(gameTitle);
});

function loadCommunityData(gameTitle) {
    // Simulate fetching data based on gameTitle
    console.log(`Loading community data for ${gameTitle}`);
    
    // Example: Fetch active players, scheduled gaming sessions, and discussions (mock data)
    document.getElementById("active-players").innerHTML = "<p>Loading players...</p>";
    document.getElementById("game-sessions").innerHTML = "<p>Loading sessions...</p>";
    document.getElementById("discussions").innerHTML = "<p>Loading discussions...</p>";

    setTimeout(() => {
        document.getElementById("active-players").innerHTML = "<p>Player1, Player2, Player3</p>";
        document.getElementById("game-sessions").innerHTML = "<p>Session1: 8 PM EST | Session2: 10 PM EST</p>";
        document.getElementById("discussions").innerHTML = "<p>Discussion1: Strategies | Discussion2: Game Updates</p>";
    }, 1000);
}