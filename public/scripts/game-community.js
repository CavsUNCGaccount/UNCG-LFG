document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const gameTitle = params.get("game");
    const gameImage = params.get("image");


    if (gameTitle) {
        document.getElementById("game-title").textContent = gameTitle;
    }


    if (gameImage) {
        document.getElementById("game-cover-img").src = gameImage;
    }


    // Fetch game_id from the database using gameTitle
    let game_id;
    try {
        const response = await fetch(`http://localhost:5000/community/game-id?title=${encodeURIComponent(gameTitle)}`);
        const data = await response.json();
        if (response.ok) {
            game_id = data.game_id;
        } else {
            console.error("Error fetching game ID:", data.message);
            return;
        }
    } catch (error) {
        console.error("Failed to fetch game ID:", error);
        return;
    }


    // Get the join button
    const joinButton = document.querySelector(".btn-warning");


    // Check if user is logged in
    try {
        const userResponse = await fetch("http://localhost:5000/auth/me", { credentials: "include" });
        const userData = await userResponse.json();


        if (userResponse.ok) {
            joinButton.textContent = "Join Community";
            joinButton.addEventListener("click", async () => {
                try {
                    const joinResponse = await fetch("http://localhost:5000/community/join", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ game_id })
                    });


                    const joinData = await joinResponse.json();
                    if (joinResponse.ok) {
                        alert(joinData.message);
                        joinButton.textContent = "Joined!";
                        joinButton.disabled = true;
                    } else {
                        alert(joinData.message);
                    }
                } catch (error) {
                    console.error("Error joining community:", error);
                }
            });
        } else {
            joinButton.textContent = "Login to Join";
            joinButton.addEventListener("click", () => {
                window.location.href = "login.html";
            });
        }
    } catch (error) {
        console.error("Error checking login status:", error);
    }
});
