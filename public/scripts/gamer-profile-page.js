document.addEventListener("DOMContentLoaded", async function () {

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
            const response = await fetch("http://localhost:5000/gamer-profile/update-username", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username: newUsername })
            });

            if (response.ok) {
                alert("Username updated successfully!");
                document.querySelector("#username").disabled = true;
                document.querySelector("#save-username").style.display = "none";
            } else {
                alert("Failed to update username.");
            }
        } catch (error) {
            console.error("Error updating username:", error);
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
            const response = await fetch("http://localhost:5000/gamer-profile/update-email", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email: newEmail })
            });

            if (response.ok) {
                alert("Email updated successfully!");
                document.querySelector("#email").disabled = true;
                document.querySelector("#save-email").style.display = "none";
            } else {
                alert("Failed to update email.");
            }
        } catch (error) {
            console.error("Error updating email:", error);
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
                alert("PSN ID updated successfully!");
                document.querySelector("#psn-id").disabled = true;
                document.querySelector("#save-psn").style.display = "none";
            } else {
                alert("Failed to update PSN ID.");
            }
        } catch (error) {
            console.error("Error updating PSN ID:", error);
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
            const response = await fetch("http://localhost:5000/gamer-profile/update-xbox", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ xbox: newXbox })
            });

            if (response.ok) {
                alert("Xbox ID updated successfully!");
                document.querySelector("#xbox-id").disabled = true;
                document.querySelector("#save-xbox").style.display = "none";
            } else {
                alert("Failed to update Xbox ID.");
            }
        } catch (error) {
            console.error("Error updating Xbox ID:", error);
        }
    });

    // ========== STEAM ==========
    // Attach event listener for linking Steam account
    document.querySelector("#link-steam").addEventListener("click", async () => {
        const steamIdField = document.getElementById("steam-id");
        const steam64Id = steamIdField.value.trim();

        if (!steam64Id) {
            alert("Please enter a valid Steam ID number.");
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
                alert("Steam account linked successfully!");

                // Update the Steam profile UI
                document.getElementById("steam-id").value = steam64Id;
                document.getElementById("steam-username").textContent = data.steamUsername || "Unknown";

                console.log("Steam Profile Data:", data); // Debugging line
                console.log("Full Steam Profile Data:", JSON.stringify(data, null, 2)); // Debugging line
                console.log("Steam64 ID:", steam64Id); // Debugging line
                console.log("Steam Username:", data.steamUsername); // Debugging line
                console.log("Steam Avatar:", data.avatar); // Debugging line

                // Ensure avatar is retrieved correctly
                const steamAvatarElement = document.getElementById("steam-avatar");
                console.log("Steam Avatar Element:", steamAvatarElement); // Debugging line

                if (data.avatar || steamAvatarElement) {
                    steamAvatarElement.src = data.avatar;
                    console.log("Steam avatar updated:", data.avatar); // Debugging confirmation
                } else {
                    steamAvatarElement.src = "images/default-avatar.png";
                    console.log("Using default avatar.");
                }

                document.getElementById("steam-profile-link").href = `https://steamcommunity.com/profiles/${steam64Id}`;
                document.getElementById("steam-profile-link").style.display = "block"; // Make button visible

                // Fetch Steam profile info
                fetchSteamProfile(steam64Id);
            } else {
                alert(data.error || "Failed to link Steam account.");
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
            const response = await fetch(`http://localhost:5000/steam/profile/${steamId}`);
            console.log("Steam API Response Status:", response.status); // Debugging line
            if (!response.ok) {
                throw new Error("Steam profile not found or API error.");
            }

            const steamProfile = await response.json();

            // Populate Steam profile section
            document.getElementById("steam-avatar").src = steamProfile.avatar;
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
                    alert(`No achievements found for ${gameName}.`);
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
            .catch(error => console.error("Error fetching achievements:", error));  
    };

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
            } else {
                document.getElementById("username").value = profile.username;
                document.getElementById("email").value = profile.email;
                document.getElementById("psn-id").value = profile.psn_id || "N/A";
                document.getElementById("xbox-id").value = profile.xbox_id || "N/A";
                document.getElementById("steam-id").value = profile.steam64_id || "";

                // Fetch Steam Profile if Steam64 ID exists
                if (profile.steam64_id && profile.steam64_id !== "N/A") {
                    fetchSteamProfile(profile.steam64_id);
                    console.log("Calling fetchSteamProfile with ID:", profile.steam64_id);

                    // Fetch Steam Games here after the profile is successfully retrieved
                    fetchSteamGames(profile.steam64_id);
                    console.log("Calling fetchSteamGames with ID:", profile.steam64_id);
                } else {
                    console.log("No Steam ID linked.");
                    document.getElementById("steam-avatar").src = "images/default-avatar.png";
                }
            }
        })
        .catch(err => {
            console.error("Error fetching profile:", err);
            alert("You must be logged in to view this page.");
            window.location.href = "/login.html"; // Redirect to login if not authorized
        });

});
