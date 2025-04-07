document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("community-table");
  
    try {
      const res = await fetch("/admin/communities");
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
  
      const communities = await res.json();
      console.log("📦 Loaded communities:", communities);
  
      if (!Array.isArray(communities)) throw new Error("Data format issue");
  
      communities.forEach((community) => {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${community.game_id}</td>
          <td>${community.game_name}</td>
          <td><img src="${community.cover_image_url}" alt="Cover" width="80" style="border-radius: 8px;" /></td>
          <td>${community.description || "—"}</td>
          <td>${new Date(community.created_at).toLocaleString()}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deleteCommunity(${community.game_id})">Delete</button>
          </td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("❌ Error loading communities:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load communities</td></tr>`;
    }
  });
  
  function deleteCommunity(gameId) {
    console.log("🗑️ Delete requested for community:", gameId);
    // TODO: Add API call to delete if needed
  }
  