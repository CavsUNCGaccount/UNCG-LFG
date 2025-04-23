document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("group-table");

  try {
    const res = await fetch("/admin/groups");
    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

    const groups = await res.json();
    groups.forEach((group) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${group.group_id}</td>
        <td>${group.session_title || "Untitled Group"}</td>
        <td>${group.host_username || "Unknown"}</td>
        <td>${new Date(group.created_at).toLocaleString()}</td>
        <td>${group.current_players}/${group.max_players}</td>
        <td>
          <button class="btn btn-sm btn-danger me-1" onclick="confirmDelete(${group.group_id})">Delete</button>
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

let groupToDelete = null;

function confirmDelete(groupId) {
  groupToDelete = groupId;
  document.getElementById("confirm-toast").style.display = "block";
}

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  if (!groupToDelete) return;

  try {
    const res = await fetch(`/admin/groups/${groupToDelete}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete group");

    showToast("🗑️ Group deleted successfully.");
    location.reload();
  } catch (err) {
    console.error("❌ Delete error:", err);
    showToast("Failed to delete group.");
  }

  document.getElementById("confirm-toast").style.display = "none";
  groupToDelete = null;
});

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  document.getElementById("confirm-toast").style.display = "none";
  groupToDelete = null;
});

function endSession(groupId) {
  console.log("End session for group:", groupId);
  // Placeholder for future implementation (PUT API call)
  showToast("Session ended for group " + groupId);
}

function showToast(message, duration = 3000) {
  const toastContainer = document.getElementById("toast-container");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;
  toastContainer.style.display = "block";

  setTimeout(() => {
    toastContainer.style.display = "none";
  }, duration);
}
