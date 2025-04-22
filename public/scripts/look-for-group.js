function showToast(title, message, type = "dark") {
    // Get the toast elements
    const toastElement = document.getElementById("genericToast");
    const toastTitle = document.getElementById("toastTitle");
    const toastBody = document.getElementById("toastBody");

    // Update the title and body
    toastTitle.textContent = title;
    toastBody.textContent = message;

    // Update the toast's background color based on the type (e.g., success, error)
    toastElement.className = `toast bg-${type} text-white`;

    // Show the toast
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

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
        console.log("Game Name:", game_name); // Debugging line

        const sessionData = {
            game_name,
            session_title: document.getElementById("session-title").value,
            session_description: document.getElementById("session-description").value,
            platform: document.getElementById("platform").value,
            session_type: document.getElementById("session-type").value,
            //session_status: document.getElementById("session-status").value,
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
                showToast("Success", "Group session created successfully!", "success");
                setTimeout(() => location.reload(), 1500); // Reload the page to show the new session
            } else {
                const errorData = await response.json();
                showToast("Error", errorData.message || "Failed to create session.", "danger");
            }
        } catch (error) {
            console.error("Error creating group session:", error);
            showToast("Error", "An unexpected error occurred while creating the session.", "danger");
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
            showToast("Error", "Failed to fetch group sessions. Please try again later.", "danger");
        }

        const sessions = await response.json();
        console.log("Fetched group sessions:", sessions);

        if (sessions.length === 0) {
            groupSessionsContainer.innerHTML = 
            "<p class='text-white'>No group sessions available. Be the first and create a group!.</p>";
            return;
        }

        // Clear container before adding new content
        groupSessionsContainer.innerHTML = "";

        sessions.forEach(session => {
            // Calculate spaces left for the session
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

            // Show a button to that redirects to the view-group-info.html page
            const viewButton = document.createElement("button");
            viewButton.textContent = "View Group";
            viewButton.className = "btn btn-outline-light btn-me-2";
            viewButton.style.marginTop = "10px";
            viewButton.style.marginBottom = "10px";
            viewButton.style.width = "30%";
            viewButton.style.alignSelf = "center";           
            viewButton.onclick = function () {
                window.location.href = `/view-group-info.html?group_id=${session.group_id}`;
            };
            
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
            card.appendChild(viewButton);
            groupSessionsContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error fetching group sessions:", err);
        groupSessionsContainer.innerHTML = "<p class='text-danger'>Error loading group sessions.</p>";
    }
});

