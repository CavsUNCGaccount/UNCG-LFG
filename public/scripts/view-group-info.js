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
            console.log("Members:", members); // For debugging
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
                item.className = "list-group-item d-flex justify-content-between align-items-start bg-dark text-white border-0 fs-5 flex-column flex-md-row";

                const memberInfo = document.createElement("div");
                memberInfo.className = "mb-2";

                let usernameHTML = `<i class="bi bi-person-circle me-2"></i><strong>${member.username}</strong>`;
                if (member.is_session_host) {
                    usernameHTML += ` <span class="badge bg-info text-dark ms-2">Host</span>`;
                }

                memberInfo.innerHTML = usernameHTML;

                const profileList = document.createElement("ul");
                profileList.className = "mb-0 ps-4 small";

                const PSNLogo = "images/platform-logos/playstation-logo.jpg";
                const XboxLogo = "images/platform-logos/xbox-logo.png";
                const SteamLogo = "images/platform-logos/Steam-logo.jpg";

                if (member.steam_username) {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>Steam:
                    <img src="${SteamLogo}" alt="Steam" class="platform-logo" style="width: 30px; height: 30px;"> 
                    </strong> ${member.steam_username}`;
                    profileList.appendChild(li);
                }
                if (member.psn_id) {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>PSN:
                    <img src="${PSNLogo}" alt="PlayStation" class="platform-logo" style="width: 30px; height: 30px;">
                    </strong> ${member.psn_id}`;
                    profileList.appendChild(li);
                }
                if (member.xbox_id) {
                    const li = document.createElement("li");
                    li.innerHTML = `<strong>Xbox:
                    <img src="${XboxLogo}" alt="Xbox" class="platform-logo" style="width: 30px; height: 30px;">
                    </strong> ${member.xbox_id}`;
                    profileList.appendChild(li);
                }

                memberInfo.appendChild(profileList);
                item.appendChild(memberInfo);

                if (isHost && member.user_id !== currentUserId) {
                    const kickBtn = document.createElement("button");
                    kickBtn.className = "btn btn-danger btn-sm fs-5 ms-md-5 mt-2 mt-md-0 align-self-start align-self-md-center";
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
    await fetchGroupMembers(groupId);
    

    // Submit message form
    document.getElementById("message-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const messageInput = document.getElementById("message-input");
        const message = messageInput.value.trim();
    
        if (!message) return;
    
        try {
            const res = await fetch(`/community/group/${groupId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message_content: message }),
            });
    
            if (res.ok) {
                messageInput.value = "";
                await fetchGroupMessages(); // Refresh messages
            } else {
                alert("Failed to send message.");
            }
        } catch (err) {
            console.error("Error sending message:", err);
        }
    });

    // Fetch group messages
    async function fetchGroupMessages() {
        const messageList = document.getElementById("message-list");
        messageList.innerHTML = "";
    
        try {
            const res = await fetch(`/community/group/${groupId}/messages`);
            const messages = await res.json();
    
            if (messages.length === 0) {
                messageList.innerHTML = "<li>No messages yet.</li>";
                return;
            }
    
            messages.forEach(msg => {
                const li = document.createElement("li");
                li.className = "mb-3";
            
                const isHost = currentUserId === groupHostId;

                li.innerHTML = `
                    <div class="border rounded p-3 bg-secondary bg-opacity-10 message-box d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${msg.username}</strong>
                            <small class="text ms-2">${new Date(msg.created_at).toLocaleString()}</small>
                            <p class="ms-4 mt-1 mb-0">${msg.message_content}</p>
                        </div>
                        ${isHost ? `
                            <button class="btn btn-sm btn-danger ms-3" onclick="deleteMessage(${msg.message_id})">Delete</button>
                        ` : ""}
                    </div>
                `;
            
                messageList.appendChild(li);
            });
            
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    }

    fetchGroupMessages();
    
    async function deleteMessage(messageId) {
        const confirmed = confirm("Are you sure you want to delete this message?");
        if (!confirmed) return;
    
        try {
            const res = await fetch(`/community/group/${groupId}/messages/${messageId}`, {
                method: "DELETE",
                credentials: "include"
            });
    
            if (res.ok) {
                alert("Message deleted.");
                fetchGroupMessages(); // Refresh the list
            } else {
                const data = await res.json();
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error("Failed to delete message:", err);
            alert("Server error.");
        }
    }
    
    window.deleteMessage = deleteMessage;
    
    // Show the Edit Session Button only if the user is the host
    if (currentUserId === groupHostId) {
        const editBtn = document.getElementById("edit-session-btn");
        if (editBtn) {
            editBtn.classList.remove("d-none");
        }
    }

    // Edit Session Modal
    document.getElementById("edit-session-btn").addEventListener("click", async () => {
        const res = await fetch(`/community/group/${groupId}`);
        const data = await res.json();
    
        document.getElementById("edit-start-time").value = data.start_time.slice(0, 16); // ISO 8601 format
        document.getElementById("edit-duration").value = data.duration;
        document.getElementById("edit-session-type").value = data.session_type;
        document.getElementById("edit-max-players").value = data.max_players;
        document.getElementById("edit-platform").value = data.platform;
        document.getElementById("edit-session-description").value = data.session_description || ""; 
    
        const modal = new bootstrap.Modal(document.getElementById("editSessionModal"));
        modal.show();
    });
    
    document.getElementById("edit-session-form").addEventListener("submit", async function (e) {
        e.preventDefault();
    
        const payload = {
            start_time: document.getElementById("edit-start-time").value,
            duration: document.getElementById("edit-duration").value,
            session_type: document.getElementById("edit-session-type").value,
            max_players: document.getElementById("edit-max-players").value,
            platform: document.getElementById("edit-platform").value,
            session_description: document.getElementById("edit-session-description").value
        };
    
        const res = await fetch(`/community/group/${groupId}/edit`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });
    
        if (res.ok) {
            alert("Session updated!");
            location.reload();
        } else {
            const data = await res.json();
            alert("Error: " + data.message);
        }
    });    

});