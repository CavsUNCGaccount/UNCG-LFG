document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("profiles-table");
  
    try {
      const res = await fetch("/admin/gamer-profiles");
  
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
  
      const profiles = await res.json();
      console.log("Fetched gamer profiles:", profiles);
  
      if (!Array.isArray(profiles)) {
        throw new Error("Profiles data is not an array");
      }
  
      profiles.forEach((profile) => {
        const row = document.createElement("tr");
  
        // Determine the game tag and platform
        let gameTag = profile.steam_username || profile.psn_id || profile.xbox_id || "N/A";
        let platform = "Unknown";
        if (profile.steam_username) platform = "Steam";
        else if (profile.psn_id) platform = "PlayStation";
        else if (profile.xbox_id) platform = "Xbox";
  
        row.innerHTML = `
          <td>${profile.gamer_id}</td>
          <td>${profile.username}</td>
          <td>${gameTag}</td>
          <td>N/A</td> <!-- Placeholder for Favorite Game -->
          <td>${platform}</td>
          <td>${new Date(profile.created_at).toLocaleString()}</td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("Error loading gamer profiles:", error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">Failed to load gamer profiles</td>
        </tr>
      `;
    }
  });
  