document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get("group_id");
    let game_name = urlParams.get("game_name");

    console.log("Group ID:", groupId);

    if (!groupId) {
        alert("Group ID not found in URL.");
        return;
    }

    try {
        const response = await fetch(`/community/group/${groupId}`);
        if (!response.ok) throw new Error("Failed to fetch group data.");

        const group = await response.json();
        console.log("Group Details:", group);

        // Session Overview
        document.querySelector("h2").textContent = group.session_title;
        document.querySelector(".text-light strong").textContent = group.host_username;

        // Map platform to logo
        const platformLogo = {
            "PlayStation": "images/platform-logos/playstation-logo.jpg",
            "Xbox": "images/platform-logos/xbox-logo.png",
            "Steam": "images/platform-logos/Steam-logo.jpg"
        }[group.platform];

        // Session Overview
        document.getElementById("session-title").textContent = group.session_title;
        document.getElementById("host-username").textContent = group.host_username;
        document.getElementById("platform-logo").src = platformLogo;
        document.getElementById("platform-logo").alt = group.platform;
        document.getElementById("session-description").textContent = group.session_description;

        document.getElementById("badge-session-type").textContent = `${group.session_type} Session`;
        const spacesLeft = group.max_players - group.current_players;
        document.getElementById("badge-spaces-left").textContent = `${spacesLeft} Spaces Left`;
        document.getElementById("badge-session-status").textContent = `${group.session_status} Session`;

        const startTime = new Date(group.start_time)
        const formattedStartTime = startTime.toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        document.getElementById("group-start-time").textContent = `${formattedStartTime} - For ${group.duration} Hours`;

        // Session Host
        document.getElementById("host-username-display").textContent = group.host_username;
        document.getElementById("host-platform-for-session").textContent = `Platform: ${group.platform}`;

        // Update game_name now that we have it from the fetched group data
        game_name = group.game_name || game_name;
        console.log("Game Name from API:", game_name); // Debugging log
        document.getElementById("back-to-groups").href = `/look-for-group.html?game_name=${encodeURIComponent(game_name)}`;

    } catch (err) {
        console.error(err);
        alert("Could not load group session.");
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const groupId = new URLSearchParams(window.location.search).get("group_id");
    const actionBtn = document.getElementById("group-action-btn");

    let currentUserId = null;
    let groupHostId = null;

    try {
        // Get current logged-in user
        const userRes = await fetch("/auth/me", { credentials: "include" });
        const userData = await userRes.json();
        currentUserId = userData.user_id;

        // Get group info
        const groupRes = await fetch(`/community/group/${groupId}`);
        const groupData = await groupRes.json();
        groupHostId = groupData.host_user_id;

        const { max_players, current_players } = groupData;
        const isFull = current_players >= max_players;

        // Get group members
        const membersRes = await fetch(`/community/group/${groupId}/members`);
        const members = await membersRes.json();
        const isMember = members.some(m => m.user_id === currentUserId);

        // Set button state
        if (currentUserId === groupHostId) {
            actionBtn.textContent = "You are the Host";
            actionBtn.disabled = true;
            actionBtn.classList.remove("btn-success", "btn-danger");
            actionBtn.classList.add("btn-secondary");
        } else if (isMember) {
            actionBtn.textContent = "Leave Session";
            actionBtn.disabled = false;
            actionBtn.classList.remove("btn-success");
            actionBtn.classList.add("btn-danger");

            actionBtn.onclick = async () => {
                const res = await fetch(`/community/group/${groupId}/leave`, {
                    method: "POST",
                    credentials: "include"
                });
                if (res.ok) location.reload();
                else alert("Failed to leave session.");
            };
        } else if (isFull) {
            actionBtn.textContent = "Session Full";
            actionBtn.disabled = true;
            actionBtn.classList.remove("btn-success", "btn-danger");
            actionBtn.classList.add("btn-secondary");
        } else {
            actionBtn.textContent = "Join Session";
            actionBtn.disabled = false;
            actionBtn.classList.remove("btn-danger");
            actionBtn.classList.add("btn-success");

            actionBtn.onclick = async () => {
                const res = await fetch(`/community/group/${groupId}/join`, {
                    method: "POST",
                    credentials: "include"
                });
                if (res.ok) location.reload();
                else alert("Failed to join session.");
            };
        }
    } catch (err) {
        console.error("Error setting up join/leave functionality:", err);
    }


    /// Fetch group members and display them
    async function fetchGroupMembers(groupId) {
        try {
            const members = await (await fetch(`/community/group/${groupId}/members`)).json();
            const membersList = document.getElementById("group-members-list");
            membersList.innerHTML = "";

            if (members.length === 0) {
                const emptyMsg = document.createElement("div");
                emptyMsg.className = "list-group-item bg-dark text-white border-0";
                emptyMsg.textContent = "No gamers have joined this group yet.";
                membersList.appendChild(emptyMsg);
                return;
            }

            const isHost = currentUserId === groupHostId;

            members.forEach(member => {
                const item = document.createElement("div");
                item.className = "list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-0 fs-5";

                const memberInfo = document.createElement("span");
                memberInfo.innerHTML = `<i class="bi bi-person-circle me-2"></i><strong>${member.username}</strong>`;

                item.appendChild(memberInfo);

                if (isHost && member.user_id !== currentUserId) {
                    const kickBtn = document.createElement("button");
                    kickBtn.className = "btn btn-danger btn-sm fs-5 ms-5";
                    kickBtn.textContent = "Kick";

                    kickBtn.addEventListener("click", async () => {
                        const confirmKick = confirm(`Kick ${member.username}?`);
                        if (!confirmKick) return;

                        const res = await fetch(`/community/group/${groupId}/kick/${member.user_id}`, {
                            method: "POST",
                            credentials: "include"
                        });

                        if (res.ok) {
                            alert(`${member.username} has been kicked.`);
                            location.reload();
                        } else {
                            alert("Failed to kick user.");
                        }
                    });

                    item.appendChild(kickBtn);
                }

                membersList.appendChild(item);
            });
        } catch (err) {
            console.error("Failed to load group members:", err);
        }
    }

    fetchGroupMembers(groupId);
});