document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch just the username from the server
        const response = await fetch('/gamer-profile/api/username', { credentials: 'include' });
        const userData = await response.json();
        console.log("User Data:", userData); // Debugging line

        // Check if the response contains the username
        if (response.ok && userData.username) {
            const greetingElement = document.getElementById("user-greeting");
            greetingElement.textContent = `Hello, ${userData.username}`;
        } else {
            console.error("Failed to fetch user data or username is missing.");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
});

document.addEventListener("DOMContentLoaded", async function () {

    // Used for showing toasts messages
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

    // Reusable Save Handler Setup
    addSaveHandler("username", "/gamer-profile/update-username", "username");
    addSaveHandler("email", "/gamer-profile/update-email", "email");
    addSaveHandler("psn-id", "/gamer-profile/update-psn", "psn");
    addSaveHandler("xbox-id", "/gamer-profile/update-xbox", "xbox");

    // Avatar upload handler
    document.getElementById("profile-upload").addEventListener("change", async function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profile_picture", file);

        try {
            const response = await fetch("http://localhost:3001/gamer-profile/upload-profile-picture", {
                method: "POST",
                body: formData,
                credentials: "include"
            });

            const data = await response.json();
            if (response.ok) {
                document.getElementById("gamer-avatar").src = data.profile_picture;
                showToast("Success", "Profile picture updated successfully!", "success");
            } else {
                showToast("Error", data.message || "Failed to update profile picture.", "danger");
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            showToast("Error", "An error occurred while uploading the profile picture.", "danger");
        }
    });

    // ========== USERNAME ==========
    document.querySelector("#edit-username").addEventListener("click", () => {
        const usernameField = document.querySelector("#username");
        usernameField.disabled = false;
        usernameField.focus();
        document.querySelector("#save-username").style.display = "inline-block";
    });

    document.querySelector("#save-username").addEventListener("click", async () => {
        const newUsername = document.querySelector("#username").value;

        try {
            const response = await fetch("http://localhost:3001/gamer-profile/update-username", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username: newUsername })
            });

            if (response.ok) {
                showToast("Success", "Username updated successfully!", "success");
                document.querySelector("#username").disabled = true;
                document.querySelector("#save-username").style.display = "none";
            } else {
                const errorData = await response.json();
                showToast("Error", errorData.message || "Failed to update username.", "danger");
            }
        } catch (error) {
            console.error("Error updating username:", error);
            showToast("Error", "An error occurred while updating the username.", "danger");
        }
    });


    // ========== EMAIL ==========
    document.querySelector("#edit-email").addEventListener("click", () => {
        const emailField = document.querySelector("#email");
        emailField.disabled = false;
        emailField.focus();
        document.querySelector("#save-email").style.display = "inline-block";
    });

    document.querySelector("#save-email").addEventListener("click", async () => {
        const newEmail = document.querySelector("#email").value;

        try {
            const response = await fetch("http://localhost:3001/gamer-profile/update-email", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email: newEmail })
            });

            if (response.ok) {
                showToast("Success", "Email updated successfully!", "success");
                document.querySelector("#email").disabled = true;
                document.querySelector("#save-email").style.display = "none";
            } else {
                const errorData = await response.json();
                showToast("Error", errorData.message || "Failed to update email.", "danger");
            }
        } catch (error) {
            console.error("Error updating email:", error);
            showToast("Error", "An error occurred while updating the email.", "danger");
        }
    });

    // ========== PSN ==========
    document.querySelector("#edit-psn").addEventListener("click", () => {
        const psnField = document.querySelector("#psn-id");
        psnField.disabled = false;
        psnField.focus();
        document.querySelector("#save-psn").style.display = "inline-block";
    });

    document.querySelector("#save-psn").addEventListener("click", async () => {
        const newPSN = document.querySelector("#psn-id").value;

        try {
            const response = await fetch("/gamer-profile/update-psn", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ psn: newPSN })
            });

            if (response.ok) {
                showToast("Success", "PSN ID updated successfully!", "success");
                document.querySelector("#psn-id").disabled = true;
                document.querySelector("#save-psn").style.display = "none";
            } else {
                const errorData = await response.json();
                showToast("Error", errorData.message || "Failed to update PSN ID.", "danger");
            }
        } catch (error) {
            console.error("Error updating PSN ID:", error);
            showToast("Error", "An error occurred while updating the PSN ID.", "danger");
        }
    });

    // ========== XBOX ==========
    document.querySelector("#edit-xbox").addEventListener("click", () => {
        const xboxField = document.querySelector("#xbox-id");
        xboxField.disabled = false;
        xboxField.focus();
        document.querySelector("#save-xbox").style.display = "inline-block";
    });

    document.querySelector("#save-xbox").addEventListener("click", async () => {
        const newXbox = document.querySelector("#xbox-id").value;

        try {
            const response = await fetch("http://localhost:3001/gamer-profile/update-xbox", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ xbox: newXbox })
            });

            if (response.ok) {
                showToast("Success", "Xbox ID updated successfully!", "success");
                document.querySelector("#xbox-id").disabled = true;
                document.querySelector("#save-xbox").style.display = "none";
            } else {
                const errorData = await response.json();
                showToast("Error", errorData.message || "Failed to update Xbox ID.", "danger");
            }
        } catch (error) {
            console.error("Error updating Xbox ID:", error);
            showToast("Error", "An error occurred while updating the Xbox ID.", "danger");
        }
    });

    // ========== STEAM ==========
    // Attach event listener for linking Steam account
    document.querySelector("#link-steam").addEventListener("click", async () => {
        const steamIdField = document.getElementById("steam-id");
        const steam64Id = steamIdField.value.trim();

        if (!steam64Id) {
            const steamIdToast = new bootstrap.Toast(document.getElementById("steamIdToast"));
            steamIdToast.show();
            return;
        }

        try {
            const response = await fetch("/gamer-profile/link-steam", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ steamId: steam64Id })
            });

            const data = await response.json();
            console.log("Steam Profile Data:", data);

            if (response.ok) {
                // Trigger the Bootstrap modal for linking Steam account
                const successModal = new bootstrap.Modal(document.getElementById("successModal"));
                successModal.show();

                // Update the Steam profile UI
                document.getElementById("steam-id").value = steam64Id;
                document.getElementById("steam-username").textContent = data.steamUsername || "Unknown";

                // Set avatar image or use default if none is set
                const avatarImg = document.querySelector("img[alt='User Avatar']");
                avatarImg.src = data.avatar_url || "images/default-picture.svg";
                console.log("Steam avatar updated:", data.avatar_url); // Debugging confirmation

                console.log("Steam Profile Data:", data); // Debugging line
                console.log("Full Steam Profile Data:", JSON.stringify(data, null, 2)); // Debugging line
                console.log("Steam64 ID:", steam64Id); // Debugging line
                console.log("Steam Username:", data.steamUsername); // Debugging line


                document.getElementById("steam-profile-link").href = `https://steamcommunity.com/profiles/${steam64Id}`;
                document.getElementById("steam-profile-link").style.display = "block"; // Make button visible

                // Fetch Steam profile info
                fetchSteamProfile(steam64Id);
            } else {
                // Display error in a Bootstrap modal if linking fails
                const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
                document.getElementById("errorModalBody").textContent = data.error || "An error occurred.";
                errorModal.show();
            }
        } catch (error) {
            console.error("Error linking Steam account:", error);
        }
    });

    // Function to fetch Steam profile and update the UI
    // This function is called when the page loads and when a Steam ID is linked
    // Note: This function is not working properly for some reason. Come back and fix if you have time.
    async function fetchSteamProfile(steamId) {
        try {
            const response = await fetch(`http://localhost:3001/steam/profile/${steamId}`);
            console.log("Steam API Response Status:", response.status); // Debugging line
            if (!response.ok) {
                throw new Error("Steam profile not found or API error.");
            }

            const steamProfile = await response.json();

            // Populate Steam profile section
            document.getElementById("steam-avatar").src = steamProfile.avatar_url;
            document.getElementById("steam-username").textContent = steamProfile.username;
            document.getElementById("steam-profile-link").href = steamProfile.profile_url;
            document.getElementById("steam-profile-link").style.display = "block"; // Make button visible

        } catch (error) {
            console.error("Error fetching Steam profile:", error);
        }
    }

    // ========== STEAM GAMES ==========
    // Fetch Steam games when the page loads
    const steamIDElement = document.getElementById("steam-id");
    const steamID = steamIDElement ? steamIDElement.value : null;

    if (steamID) {
        console.log("Before calling fetchSteamGames with ID:", steamID);
        await fetchSteamGames(steamID);
        console.log("After calling fetchSteamGames with ID:", steamID);
    }

    async function fetchSteamGames(steamID) {
        console.log("Fetching games for Steam ID:", steamID); // Debug log

        if (!steamID || steamID === "undefined") {
            console.error("Error: steamID is undefined or invalid.");
            return;
        }

        try {
            const response = await fetch(`/steam/games/${steamID}`);
            console.log("Response status:", response.status);

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Steam Games Data Received:", data);

            if (data.games) {
                displaySteamGames(data.games, steamID);
            } else {
                console.warn("No games found for this Steam ID.");
            }
        } catch (error) {
            console.error("Error fetching Steam games:", error);
        }
    }

    // Function to display Steam games in the UI
    function displaySteamGames(games, steamID) {
        const gamesContainer = document.getElementById("steam-games-container");
        if (!gamesContainer) {
            console.error("Error: Steam games container not found in HTML.");
            return;
        }

        gamesContainer.innerHTML = "";

        games.forEach(game => {
            const gameName = game.name || "Unknown Game";
            const playtimeHours = game.playtime_forever ? (game.playtime_forever / 60).toFixed(1) : "0.0";
            const gameImage = `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/capsule_184x69.jpg`;

            const gameCard = `
                <div class="col-md-3">
                    <div class="card bg-dark text-white p-3 rounded shadow">
                        <img src="${gameImage}" alt="${gameName}" class="img-fluid rounded">
                        <h5 class="mt-2">${gameName}</h5>
                        <p>Playtime: ${playtimeHours} hours</p>
                        <button class="btn btn-warning btn-sm" 
                            onclick="fetchGameAchievements('${steamID}', '${game.appid}', '${game.name}')">
                            View Achievements
                        </button>
                    </div>
                </div>
            `;

            gamesContainer.innerHTML += gameCard;
        });

        console.log("Successfully updated Steam Games UI.");
    }

// Fetch the profile data using the API route when page loads 
fetch("/gamer-profile/api/profile", {
    method: "GET",
    credentials: "include" // Include session cookies
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Unauthorized");
        }
        return response.json();
    })
    .then(profile => {
        if (profile.error) {
            alert("No profile information available.");
            return;
        }

        // ⚠️ Show Suspension Warning if needed
        console.log("✅ Checking suspension status for:", profile.username, "Status:", profile.status);
        if (profile.status && profile.status.toLowerCase() === "suspended") {
            const warningDiv = document.getElementById("suspension-warning");
            console.log("🚨 Suspension warning triggered. DOM element found?", !!warningDiv);
            if (warningDiv) {
                warningDiv.style.display = "block";
            }
        }
        if (profile.status && profile.status.toLowerCase() === "suspended") {
            const warningDiv = document.getElementById("suspension-warning");
            if (warningDiv) {
                warningDiv.style.display = "block";
                console.log("Suspension warning displayed for:", profile.username);
            }
        }

        // ✅ Update username field and optional display
        document.getElementById("username").value = profile.username || "";
        const usernameDisplay = document.getElementById("username-display");
        if (usernameDisplay) {
            usernameDisplay.textContent = profile.username;
        }

        // ✅ Update email, PSN, Xbox, Steam ID
        document.getElementById("email").value = profile.email || "";
        document.getElementById("psn-id").value = profile.psn_id || "N/A";
        document.getElementById("xbox-id").value = profile.xbox_id || "N/A";
        document.getElementById("steam-id").value = profile.steam64_id || "";

        // ✅ Set profile picture (main + navbar)
        if (profile.profile_picture) {
            const profileImg = document.getElementById("gamer-avatar");
            if (profileImg) profileImg.src = profile.profile_picture;

            const navbarImg = document.getElementById("navbar-avatar");
            if (navbarImg) navbarImg.src = profile.profile_picture;
        }

        // ✅ Load Steam profile + games if linked
        if (profile.steam64_id && profile.steam64_id !== "N/A") {
            fetchSteamProfile(profile.steam64_id);
            fetchSteamGames(profile.steam64_id);
        } else {
            console.log("No Steam ID linked.");
            document.getElementById("steam-avatar").src = "images/default-picture.svg";
        }

        // ✅ Load joined communities
        fetchCommunities();
    })
    .catch(err => {
        console.error("Error fetching profile:", err);
        alert("You must be logged in to view this page.");
        window.location.href = "/login.html";
    });


    // Function to fetch communities
    async function fetchCommunities() {
        try {
            const response = await fetch('/community/my-communities', {
                method: 'GET',
                credentials: 'include' // Ensures cookies are sent with the request
            });
            const data = await response.json();
            if (data.communities) {
                displayCommunities(data.communities);
            } else {
                console.error('Error fetching communities:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Function to display communities
    function displayCommunities(communities) {
        const container = document.getElementById('communities-container');
        container.innerHTML = ''; // Clear any existing content

        communities.forEach(community => {
            const communityElement = document.createElement('a');
            communityElement.className = 'community-item list-group-item list-group-item-action';
            communityElement.href = `/community.html?game_name=${community.game_name}`; // Adjust the URL as needed
            communityElement.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${community.cover_image_url}" alt="${community.game_name}" class="img-fluid rounded" width="50">
                        <span class="ms-3">${community.game_name}</span>
                    </div>
                `;
            container.appendChild(communityElement);
        });
    }

    // function to fetch Steam achievements for a specific game
    window.fetchGameAchievements = function (steamID, appID, gameName) {
        console.log(`Fetching achievements for Steam ID: ${steamID}, Game ID: ${appID}`);

        fetch(`/steam/achievements/${steamID}/${appID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No achievements found for ${gameName}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Achievements Data Received:", data);

                if (!data.achievements || data.achievements.length === 0) {
                    // Trigger the modal
                    const noAchievementsModal = new bootstrap.Modal(document.getElementById("noAchievementsModal"));
                    noAchievementsModal.show();
                    return;
                }

                // Store in localStorage and log it
                localStorage.setItem("gameAchievements", JSON.stringify(data.achievements));
                localStorage.setItem("gameName", gameName);

                console.log("Stored Achievements Data:", localStorage.getItem("gameAchievements"));
                console.log("Stored Game Name:", localStorage.getItem("gameName"));

                // Redirect to achievements page
                window.location.href = "/view-game-achievements.html";
            })
            .catch(error => {
                console.error("Error fetching achievements:", error);

                // Trigger the modal in case of an error
                const noAchievementsModal = new bootstrap.Modal(document.getElementById("noAchievementsModal"));
                noAchievementsModal.show();
            });
    };

    // Fetch the profile data using the API route when page loads
    // fetch("/gamer-profile/api/profile", {
    //     method: "GET",
    //     credentials: "include" // Include session cookies
    // })
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error("Unauthorized");
    //         }
    //         return response.json();
    //     })
    //     .then(profile => {
    //         if (profile.error) {
    //             alert("No profile information available.");
    //         } else {
    //             document.getElementById("username").value = profile.username;
    //             document.getElementById("email").value = profile.email;
    //             document.getElementById("psn-id").value = profile.psn_id || "N/A";
    //             document.getElementById("xbox-id").value = profile.xbox_id || "N/A";
    //             document.getElementById("steam-id").value = profile.steam64_id || "";

    //             // Fetch Steam Profile if Steam64 ID exists
    //             if (profile.steam64_id && profile.steam64_id !== "N/A") {
    //                 fetchSteamProfile(profile.steam64_id);
    //                 console.log("Calling fetchSteamProfile with ID:", profile.steam64_id);

    //                 // Fetch Steam Games here after the profile is successfully retrieved
    //                 fetchSteamGames(profile.steam64_id);
    //                 console.log("Calling fetchSteamGames with ID:", profile.steam64_id);
    //             } else {
    //                 console.log("No Steam ID linked.");
    //                 document.getElementById("steam-avatar").src = "images/default-picture.svg";
    //             }
    //         }
    //     })
    //     .catch(err => {
    //         console.error("Error fetching profile:", err);
    //         alert("You must be logged in to view this page.");
    //         window.location.href = "/login.html"; // Redirect to login if not authorized
    //     });

});  //End of the script DOM 

function addSaveHandler(fieldId, endpoint, key) {
    const editBtn = document.getElementById(`edit-${fieldId}`);
    const saveBtn = document.getElementById(`save-${fieldId}`);

    if (!editBtn || !saveBtn) return;

    editBtn.addEventListener("click", () => {
        const field = document.getElementById(fieldId);
        field.disabled = false;
        field.focus();
        saveBtn.style.display = "inline-block";
    });

    saveBtn.addEventListener("click", async () => {
        const newValue = document.getElementById(fieldId).value;

        try {
            const response = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ [key]: newValue })
            });

            if (response.ok) {
                document.getElementById(fieldId).disabled = true;
                saveBtn.style.display = "none";
            } else {
                alert(`Failed to update ${fieldId.replace('-', ' ')}.`);
            }
        } catch (error) {
            console.error(`Error updating ${fieldId}:`, error);
        }
    });
}
