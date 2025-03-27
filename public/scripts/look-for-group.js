document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const game_name = params.get("game_name");

    if (!game_name) {
        alert("Game name is missing.");
        return;
    }

    // Fetch game details and update the page
    try {
        const response = await fetch(`/community/game-details?game_name=${encodeURIComponent(game_name)}`);
        const gameData = await response.json();

        if (response.ok) {
            document.getElementById("game-title").textContent = gameData.game_name;
            document.getElementById("game-cover-img").src = gameData.cover_image_url;
            document.getElementById("game-description").textContent = gameData.description;
        } else {
            alert(gameData.message);
        }
    } catch (error) {
        console.error("Error fetching game details:", error);
    }

    // Fetch and display group sessions
    fetchGroupSessions(game_name);

    async function fetchGroupSessions(game_name) {
        try {
            const response = await fetch(`/community/group-sessions?game_name=${encodeURIComponent(game_name)}`);
            const sessions = await response.json();

            const container = document.getElementById("group-sessions-container");
            container.innerHTML = "";

            if (sessions.length === 0) {
                container.innerHTML = `<p class="text-white">No group sessions available. Be the first to create one!</p>`;
                return;
            }

            sessions.forEach(session => {
                const sessionElement = document.createElement("div");
                sessionElement.className = "card mb-3 bg-dark text-white shadow-lg";
                sessionElement.innerHTML = `
                    <div class="row g-0">
                        <div class="col-md-2">
                            <img src="${session.cover_image_url || 'images/default-cover.jpg'}" class="img-fluid rounded-start" alt="${session.game_name}">
                        </div>
                        <div class="col-md-10">
                            <div class="card-body">
                                <h5 class="card-title">${session.session_title} with ${session.username} 
                                    <img src="images/platform-logos/${session.platform.toLowerCase()}-logo.png" alt="${session.platform}" width="30">
                                </h5>
                                <p class="card-text">${session.session_description}</p>
                                <div class="mb-2">
                                    <span class="badge bg-primary">${session.spaces_left} Spaces Left</span>
                                    <span class="badge bg-info">${session.session_date} - ${session.start_time}</span>
                                </div>
                                <p class="card-text"><small class="text-muted">Duration: ${session.duration} hours</small></p>
                                <div>
                                    <button class="btn btn-outline-warning me-2">Join Session</button>
                                    <button class="btn btn-outline-light" onclick="location.href='view-group-info.html?session_id=${session.session_id}';">View Session</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(sessionElement);
            });
        } catch (error) {
            console.error("Error fetching group sessions:", error);
        }
    }
});