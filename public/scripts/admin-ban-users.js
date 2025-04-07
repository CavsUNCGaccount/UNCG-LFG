document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("ban-users-table");

  if (!tableBody) {
    console.error("❌ Could not find #ban-users-table in the DOM.");
    return;
  }

  try {
    const response = await fetch("/admin/users");

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const users = await response.json();
    console.log("✅ Fetched users:", users);

    users.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.user_id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.status || "Active"}</td>
        <td>
          <button class="btn btn-danger btn-sm me-1" onclick="banUser(${user.user_id})">Ban</button>
          <button class="btn btn-warning btn-sm" onclick="suspendUser(${user.user_id})">Suspend</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading users:", err);
    if (tableBody) {
      tableBody.innerHTML = `
        <tr><td colspan="6" class="text-danger text-center">Failed to load users</td></tr>
      `;
    }
  }
});

function banUser(userId) {
  console.log("🚫 Ban user with ID:", userId);
  // TODO: Call /admin/ban or /admin/update-user-status API with status = "Banned"
}

function suspendUser(userId) {
  console.log("⏸️ Suspend user with ID:", userId);
  // TODO: Call /admin/suspend or /admin/update-user-status API with status = "Suspended"
}
