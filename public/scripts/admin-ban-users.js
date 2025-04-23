document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("ban-users-table");

  if (!tableBody) {
    console.error("❌ Could not find #ban-users-table in the DOM.");
    return;
  }

  try {
    const response = await fetch("/admin/users");
    if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

    const users = await response.json();
    users.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = generateUserRow(user);
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading users:", err);
    tableBody.innerHTML = `
      <tr><td colspan="6" class="text-danger text-center">Failed to load users</td></tr>
    `;
  }
});

function generateUserRow(user) {
  const isSuspended = user.status === "Suspended";
  const isBanned = user.status === "Banned";

  let actions = "";

  if (isBanned) {
    actions = `<button class='btn btn-success btn-sm' onclick="updateUserStatus(${user.user_id}, 'Active', '${user.username}', '${user.email}', '${user.role}')">Unban</button>`;
  } else {
    actions = `
      <button class='btn btn-danger btn-sm me-1' onclick="updateUserStatus(${user.user_id}, 'Banned', '${user.username}', '${user.email}', '${user.role}')">Ban</button>
      <button class='btn btn-${isSuspended ? "success" : "warning"} btn-sm' onclick="updateUserStatus(${user.user_id}, '${isSuspended ? "Active" : "Suspended"}', '${user.username}', '${user.email}', '${user.role}')">
        ${isSuspended ? "Unsuspend" : "Suspend"}
      </button>
    `;
  }

  return `
    <td>${user.user_id}</td>
    <td>${user.username}</td>
    <td>${user.email}</td>
    <td>${user.role}</td>
    <td id="status-${user.user_id}">${user.status || "Active"}</td>
    <td id="actions-${user.user_id}">${actions}</td>
  `;
}

async function updateUserStatus(userId, status, username, email, role) {
  console.log(`🔄 Updating user ${userId} to ${status}`);

  try {
    const response = await fetch(`/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error(`Failed to update user ${userId}`);

    const result = await response.json();
    console.log("✅ Status updated:", result);

    const statusCell = document.getElementById(`status-${userId}`);
    if (statusCell) statusCell.textContent = status;

    const actionsCell = document.getElementById(`actions-${userId}`);
    if (actionsCell) actionsCell.innerHTML = generateUserRow({ user_id: userId, username, email, role, status }).split('</td>').slice(5,6)[0].replace('<td', '').replace('>', '');

    showToast(`✅ User ${userId} is now ${status}.`);
  } catch (error) {
    console.error("❌ Failed to update status:", error);
    showToast("Failed to update user status. Please try again.");
  }
}

function showToast(message, duration = 3000) {
  let toast = document.getElementById("toast-container");
  let toastMessage = document.getElementById("toast-message");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-container";
    toast.style.position = "fixed";
    toast.style.top = "80px";
    toast.style.right = "20px";
    toast.style.zIndex = 9999;
    toast.style.backgroundColor = "#222";
    toast.style.color = "#ffc107";
    toast.style.padding = "12px 20px";
    toast.style.borderLeft = "5px solid #ffc107";
    toast.style.borderRadius = "6px";
    toast.style.fontFamily = "'Rajdhani', sans-serif";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    toast.innerHTML = `<span id="toast-message"></span>`;
    document.body.appendChild(toast);
    toastMessage = document.getElementById("toast-message");
  }

  toastMessage.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, duration);
}