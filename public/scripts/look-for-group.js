document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const game_name = params.get("game_name");

    if (game_name) {
        fetchGroupSessions(game_name);
    } else {
        console.error("Game name is missing in the URL.");
    }
});

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

            console.log("Fetched sessions:", sessions); // Debugging

            const container = document.getElementById("group-sessions-container");
            container.innerHTML = ""; // Clear the container before rendering

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
                            <img src="images/default-cover.jpg" class="img-fluid rounded-start" alt="Group Image">
                        </div>
                        <div class="col-md-10">
                            <div class="card-body">
                                <h5 class="card-title">${session.session_type} Session hosted by ${session.host_username}</h5>
                                <p class="card-text">Status: ${session.session_status}</p>
                                <p class="card-text">Players: ${session.current_players}/${session.max_players}</p>
                                <p class="card-text">Start Time: ${new Date(session.start_time).toLocaleString()}</p>
                                <p class="card-text">Duration: ${session.duration} minutes</p>
                                <button class="btn btn-outline-warning join-group-btn" data-group-id="${session.group_id}">Join Group</button>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(sessionElement);
            });

            // Add event listeners to "Join Group" buttons
            document.querySelectorAll(".join-group-btn").forEach(button => {
                button.addEventListener("click", handleJoinGroup);
            });
        } catch (error) {
            console.error("Error fetching group sessions:", error);
        }
    }

    async function handleJoinGroup(event) {
        const groupId = event.target.getAttribute("data-group-id");

        try {
            const response = await fetch("/community/join-group", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: groupId }),
            });

            if (response.ok) {
                alert("Successfully joined the group!");
                const params = new URLSearchParams(window.location.search);
                fetchGroupSessions(params.get("game_name")); // Refresh the group list
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error("Error joining group:", error);
        }
    }

    const createSessionBtn = document.getElementById("create-session-btn");
    const createSessionForm = document.getElementById("create-session-form");

    // Show the modal when the "Create New Session" button is clicked
    createSessionBtn.addEventListener("click", function () {
        const createSessionModal = new bootstrap.Modal(document.getElementById("createSessionModal"));
        createSessionModal.show();
    });

    // Handle form submission
    createSessionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const game_name = params.get("game_name");

        const sessionData = {
            game_name,
            session_type: document.getElementById("session-type").value,
            session_status: document.getElementById("session-status").value,
            max_players: document.getElementById("max-players").value,
            start_time: document.getElementById("start-time").value,
            duration: document.getElementById("duration").value,
        };

        try {
            const response = await fetch("/community/create-group-session", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sessionData),
            });

            if (response.ok) {
                alert("Group session created successfully!");
                location.reload(); // Reload the page to show the new session
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error("Error creating group session:", error);
        }
    });
});