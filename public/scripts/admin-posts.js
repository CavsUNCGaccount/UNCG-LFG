document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("posts-table");

  try {
    const res = await fetch("/admin/posts");
    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
    const posts = await res.json();
    if (!Array.isArray(posts)) throw new Error("Posts is not an array");

    posts.forEach((post) => {
      const row = document.createElement("tr");
      const isFlagged = post.status && post.status.toLowerCase() === "flagged";

      row.innerHTML = `
        <td>${post.post_id}</td>
        <td>${post.username}</td>
        <td>${post.post_content}</td>
        <td>${new Date(post.created_at).toLocaleString()}</td>
        <td id="status-${post.post_id}">${post.status || "Pending"}</td>
        <td id="actions-${post.post_id}">
          <button class="btn btn-sm btn-danger me-1" onclick="askDeleteConfirmation(${post.post_id})">Delete</button>
          ${isFlagged ?
            `<button class="btn btn-sm btn-secondary" disabled id="flag-btn-${post.post_id}">Flagged ✅</button>` :
            `<button class="btn btn-sm btn-warning" onclick="flagPost(${post.post_id})" id="flag-btn-${post.post_id}" data-post-id="${post.post_id}">Flag</button>`
          }
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("❌ Failed to load posts:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load posts</td></tr>`;
  }
});

let postIdToDelete = null;

function askDeleteConfirmation(postId) {
  postIdToDelete = postId;
  document.getElementById("confirm-toast").style.display = "block";
}

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  if (!postIdToDelete) return;

  try {
    const res = await fetch(`/admin/posts/${postIdToDelete}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    showToast("🗑️ Post deleted successfully.");
    location.reload();
  } catch (err) {
    console.error("❌ Delete error:", err);
    showToast("Failed to delete post.");
  }

  document.getElementById("confirm-toast").style.display = "none";
  postIdToDelete = null;
});

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  document.getElementById("confirm-toast").style.display = "none";
  postIdToDelete = null;
});

async function flagPost(postId) {
  try {
    const res = await fetch(`/admin/posts/${postId}/flag`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "flagged" }),
    });

    if (!res.ok) throw new Error("Failed to flag post");

    const statusCell = document.getElementById(`status-${postId}`);
    if (statusCell) statusCell.textContent = "flagged";

    const actionsCell = document.getElementById(`actions-${postId}`);
    if (actionsCell) {
      actionsCell.innerHTML = `
        <button class="btn btn-sm btn-danger me-1" onclick="askDeleteConfirmation(${postId})">Delete</button>
        <button class="btn btn-sm btn-secondary" disabled id="flag-btn-${postId}">Flagged ✅</button>
      `;
    }
  } catch (err) {
    console.error("❌ Flag error:", err);
    showToast("Failed to flag post.");
  }
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
