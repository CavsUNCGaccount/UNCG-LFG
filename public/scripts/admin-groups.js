document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("group-table");
  
    try {
      const res = await fetch("/admin/groups");
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
  
      const groups = await res.json();
      console.log("Fetched groups:", groups);
  
      groups.forEach((group) => {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${group.group_id}</td>
          <td>${group.session_title || "Untitled Group"}</td>
          <td>${group.host_username || "Unknown"}</td>
          <td>${new Date(group.created_at).toLocaleString()}</td>
          <td>${group.current_players}/${group.max_players}</td>
          <td>
            <button class="btn btn-sm btn-danger me-1" onclick="deleteGroup(${group.group_id})">Delete</button>
            <button class="btn btn-sm btn-warning" onclick="endSession(${group.group_id})">End</button>
          </td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading group data:", err);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load group data</td></tr>`;
    }
  });
  
  function deleteGroup(groupId) {
    console.log("Delete group:", groupId);
    // TODO: Add DELETE API call to remove the group
  }
  
  function endSession(groupId) {
    console.log("End session for group:", groupId);
    // TODO: Add PUT API call to end session
  }
  