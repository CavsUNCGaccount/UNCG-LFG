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

    // Function to update button state
    async function updateButtonState() {
        try {
            const userResponse = await fetch("http://localhost:5000/auth/me", { credentials: "include" });
            const userData = await userResponse.json();

            if (userResponse.ok) {
                // Check if user is already a member
                const membershipResponse = await fetch(`http://localhost:5000/community/membership-status?game_id=${game_id}`, {
                    credentials: "include"
                });
                const membershipData = await membershipResponse.json();

                if (membershipData.isMember) {
                    joinButton.textContent = "Leave Community";
                    joinButton.addEventListener("click", leaveCommunity);
                } else {
                    joinButton.textContent = "Join Community";
                    joinButton.addEventListener("click", joinCommunity);
                }
            } else {
                joinButton.textContent = "Login to Join";
                joinButton.addEventListener("click", () => {
                    window.location.href = "login.html";
                });
            }
        } catch (error) {
            console.error("Error checking login status:", error);
        }
    }

    // Function to join community
    async function joinCommunity() {
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
                joinButton.textContent = "Leave Community";
                joinButton.removeEventListener("click", joinCommunity);
                joinButton.addEventListener("click", leaveCommunity);
            } else {
                alert(joinData.message);
            }
        } catch (error) {
            console.error("Error joining community:", error);
        }
    }

    // Function to leave community
    async function leaveCommunity() {
        try {
            const leaveResponse = await fetch("http://localhost:5000/community/leave", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_id })
            });

            const leaveData = await leaveResponse.json();
            if (leaveResponse.ok) {
                alert(leaveData.message);
                joinButton.textContent = "Join Community";
                joinButton.removeEventListener("click", leaveCommunity);
                joinButton.addEventListener("click", joinCommunity);
            } else {
                alert(leaveData.message);
            }
        } catch (error) {
            console.error("Error leaving community:", error);
        }
    }

    // Initial button state update
    updateButtonState();
});
