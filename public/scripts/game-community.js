document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const gameName = params.get("game_name");
    let game_id = params.get("game_id");

    console.log("Game Name:", gameName); // Debugging log
    console.log("Game ID:", game_id); // Debugging log

    if (!gameName) {
        alert("Game name is missing.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/community/games/${gameName}`);
        const data = await response.json();
        console.log("Game data:", data); // Debugging log

        if (response.ok) {
            document.getElementById("game-title").textContent = data.game.game_name;
            document.getElementById("game-cover-img").src = data.game.cover_image_url;
            document.getElementById("game-description").innerHTML = `<p>${data.game.description}</p>`;

            // Update game_id now that we have the game data
            game_id = data.game.game_id;
            console.log("Updated Game ID from API:", game_id); // Debugging log

            // Ensure buttons exist before adding event listeners
            const joinButton = document.querySelector(".btn-warning");
            if (joinButton) {
                joinButton.addEventListener("click", joinCommunity);
            } else {
                console.error("Join button not found");
            }

            const leaveButton = document.getElementById("leave-button");
            if (leaveButton) {
                leaveButton.addEventListener("click", leaveCommunity);
            } else {
                console.error("Leave button not found");
            }
        } else {
            alert("Error fetching game community information.");
        }
    } catch (error) {
        console.error("Error fetching game community information:", error);
    }

    // Function to update button state
    async function updateButtonState() {
        try {
            const userResponse = await fetch("http://localhost:3001/auth/me", { credentials: "include" });
            const userData = await userResponse.json();

            if (userResponse.ok) {
                // Check if user is already a member
                const membershipResponse = await fetch(`http://localhost:3001/community/membership-status?game_id=${game_id}`, {
                    credentials: "include"
                });
                const membershipData = await membershipResponse.json();

                const joinButton = document.querySelector(".btn-warning");
                if (membershipData.isMember) {
                    joinButton.textContent = "Leave Community";
                    joinButton.addEventListener("click", leaveCommunity);
                } else {
                    joinButton.textContent = "Join Community";
                    joinButton.addEventListener("click", joinCommunity);
                }
            } else {
                const joinButton = document.querySelector(".btn-warning");
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
            const joinResponse = await fetch(`http://localhost:3001/community/games/${game_id}/join`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            const joinData = await joinResponse.json();
            if (joinResponse.ok) {
                
                const joinButton = document.querySelector(".btn-warning");
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
        console.log("Game ID before sending leave request:", game_id); // Debugging log

        try {
            const leaveResponse = await fetch(`http://localhost:3001/community/games/${game_id}/leave`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            const leaveData = await leaveResponse.json();
            if (leaveResponse.ok) {
                
                const joinButton = document.querySelector(".btn-warning");
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
