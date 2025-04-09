document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("community-table");

  // Load all game communities
  (async function loadCommunities() {
    try {
      const res = await fetch("/admin/communities");

      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

      const communities = await res.json();
      console.log("📦 Loaded communities:", communities);

      if (!Array.isArray(communities)) throw new Error("Expected an array");

      communities.forEach((community) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${community.game_id}</td>
          <td>
            <input class="form-control bg-dark text-white border-0"
                   value="${community.game_name}"
                   data-id="${community.game_id}"
                   data-field="game_name" />
          </td>
          <td>
            <input class="form-control bg-dark text-white border-0"
                   value="${community.cover_image_url}"
                   data-id="${community.game_id}"
                   data-field="cover_image_url" />
          </td>
          <td>
            <textarea class="form-control bg-dark text-white border-0"
                      rows="2"
                      data-id="${community.game_id}"
                      data-field="description">${community.description || ""}</textarea>
          </td>
          <td>${new Date(community.created_at).toLocaleString()}</td>
          <td>
            <button class="btn btn-sm btn-success" onclick="saveCommunity(${community.game_id})">💾 Save</button>
          </td>
        `;

        tableBody.appendChild(row);
      });

    } catch (error) {
      console.error("❌ Error loading communities:", error);
      tableBody.innerHTML = `
        <tr><td colspan="6" class="text-center text-danger">
          Failed to load communities: ${error.message}
        </td></tr>`;
    }
  })();
});

// Save community changes
async function saveCommunity(gameId) {
  const fields = document.querySelectorAll(`[data-id="${gameId}"]`);
  const updateData = {};

  fields.forEach((field) => {
    updateData[field.dataset.field] = field.value.trim();
  });

  console.log(`📤 Saving game ${gameId}:`, updateData);

  try {
    const res = await fetch(`/admin/communities/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateData)
    });

    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

    const contentType = res.headers.get("content-type");

    let result = {};
    if (contentType && contentType.includes("application/json")) {
      result = await res.json();
    } else {
      result = { message: await res.text() };
    }

    alert("✅ Community updated successfully!");
    console.log("✅ Update response:", result);

  } catch (err) {
    console.error("❌ Failed to update community:", err);
    alert("Update failed. Please try again.");
  }
}

// Edit community (modal behavior can be added later)
function editCommunity(gameId) {
  console.log("✏️ Edit requested for community:", gameId);

  // TODO: Fetch community data and populate modal
  // Then show the modal for editing
}
