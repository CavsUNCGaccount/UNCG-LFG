document.addEventListener("DOMContentLoaded", function () {
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
            session_title: document.getElementById("session-title").value,
            session_description: document.getElementById("session-description").value,
            platform: document.getElementById("platform").value,
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

document.addEventListener("DOMContentLoaded", async function () {
    const groupSessionsContainer = document.getElementById("group-sessions-container");
    const params = new URLSearchParams(window.location.search);
    const game_name = params.get("game_name");

    if (!game_name) {
        groupSessionsContainer.innerHTML = "<p class='text-white'>Game not specified.</p>";
        return;
    }

    try {
        const response = await fetch(`/community/group-sessions?game_name=${encodeURIComponent(game_name)}`, {
            credentials: "include"
        });
        if (!response.ok) {
            throw new Error("Failed to fetch group sessions.");
        }

        const sessions = await response.json();
        console.log("Fetched group sessions:", sessions);

        if (sessions.length === 0) {
            groupSessionsContainer.innerHTML = "<p class='text-white'>No group sessions available.</p>";
            return;
        }

        // Clear container before adding new content
        groupSessionsContainer.innerHTML = "";

        sessions.forEach(session => {
            // Calculate spaces left if needed
            const spacesLeft = session.max_players - (session.current_players || 0);

            // Set the platform logo based on the platform value
            let platformLogoURL = "";
            switch (session.platform) {
                case "PlayStation":
                    platformLogoURL = "images/platform-logos/playstation-logo.jpg"; 
                    break;
                case "Xbox":
                    platformLogoURL = "images/platform-logos/xbox-logo.png"; 
                    break;
                case "Steam":
                    platformLogoURL = "images/platform-logos/Steam-logo.jpg"; 
                    break;
            }

            // Create a card for each group session
            const card = document.createElement("div");
            card.className = "card bg-dark text-white mb-3";
            card.innerHTML = `
                <div class="card-header">
                    <strong>${session.session_title}</strong> (${session.session_type}) - ${session.platform}
                    <img src="${platformLogoURL}" alt="${session.platform}" 
                    style="width:30px; height:30px; margin-left:5px;">
                </div>
                <div class="card-body">
                    <p><strong>Host:</strong> ${session.host_username}</p>
                    <p><strong>Description:</strong> ${session.session_description}</p>
                    <p><strong>Status:</strong> ${session.session_status}</p>
                    <p><strong>Start Time:</strong> ${new Date(session.start_time).toLocaleString()}</p>
                    <p><strong>Duration:</strong> ${session.duration} hours</p>
                    <p><strong>Players:</strong> ${session.current_players || 0} / ${session.max_players} (${spacesLeft} spaces left)</p>
                </div>
            `;
            groupSessionsContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error fetching group sessions:", err);
        groupSessionsContainer.innerHTML = "<p class='text-danger'>Error loading group sessions.</p>";
    }
});