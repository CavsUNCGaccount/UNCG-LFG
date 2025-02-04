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

    document.getElementById("group-section").innerHTML = "<p>Loading available groups...</p>";
    document.getElementById("user-posts").innerHTML = "<p>Loading user posts...</p>";

    setTimeout(() => {
        document.getElementById("group-section").innerHTML = `
            <h2>Look for Group</h2>
            <ul>
                <li><strong>Squad Up:</strong> Looking for 2 more players!</li>
                <li><strong>Ranked Matches:</strong> Competitive players only.</li>
                <li><strong>Casual Hangout:</strong> No stress, just fun!</li>
            </ul>
        `;

        document.getElementById("user-posts").innerHTML = `
            <h2>User Posts</h2>
            <ul>
                <li><strong>JohnDoe:</strong> Anyone down for a match at 9 PM EST?</li>
                <li><strong>GameFanatic:</strong> New event dropping soon, thoughts?</li>
                <li><strong>ProGamerX:</strong> Need help with a mission, join me!</li>
            </ul>
        `;
    }, 1000);
}
