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
      const isSuspended = user.status === "Suspended";
      const isBanned = user.status === "Banned";

      row.innerHTML = `
        <td>${user.user_id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td id="status-${user.user_id}">${user.status || "Active"}</td>
        <td id="actions-${user.user_id}">
          ${isBanned
            ? '<span class="badge bg-danger">Banned!</span>'
            : `<button class="btn btn-danger btn-sm me-1" onclick="updateUserStatus(${user.user_id}, 'Banned')">Ban</button>
               <button class="btn btn-${isSuspended ? 'success' : 'warning'} btn-sm" onclick="updateUserStatus(${user.user_id}, '${isSuspended ? 'Active' : 'Suspended'}')">
                 ${isSuspended ? 'Unsuspend' : 'Suspend'}
               </button>`
          }
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading users:", err);
    tableBody.innerHTML = `
      <tr><td colspan="6" class="text-danger text-center">Failed to load users</td></tr>
    `;
  }
});

async function updateUserStatus(userId, status) {
  console.log(`🔄 Updating user ${userId} to ${status}`);

  try {
    const response = await fetch(`/admin/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error(`Failed to update user ${userId}`);
    }

    const result = await response.json();
    console.log("✅ Status updated:", result);

    // Update status in table UI
    const statusCell = document.getElementById(`status-${userId}`);
    if (statusCell) {
      statusCell.textContent = status;
    }

    const actionsCell = document.getElementById(`actions-${userId}`);
    if (actionsCell) {
      if (status === "Banned") {
        actionsCell.innerHTML = '<span class="badge bg-danger">Banned!</span>';
      } else if (status === "Suspended") {
        actionsCell.innerHTML = `
          <button class="btn btn-danger btn-sm me-1" onclick="updateUserStatus(${userId}, 'Banned')">Ban</button>
          <button class="btn btn-success btn-sm" onclick="updateUserStatus(${userId}, 'Active')">Unsuspend</button>
        `;
      } else {
        actionsCell.innerHTML = `
          <button class="btn btn-danger btn-sm me-1" onclick="updateUserStatus(${userId}, 'Banned')">Ban</button>
          <button class="btn btn-warning btn-sm" onclick="updateUserStatus(${userId}, 'Suspended')">Suspend</button>
        `;
      }
    }

    alert(`✅ User ${userId} has been ${status.toLowerCase()}`);
  } catch (error) {
    console.error("❌ Failed to update status:", error);
    alert("Failed to update user status. Please try again.");
  }
}
