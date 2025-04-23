document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("flagged-posts-table");

  try {
    const res = await fetch("/admin/posts");
    if (!res.ok) throw new Error("Failed to fetch posts");

    const posts = await res.json();
    const flaggedPosts = posts.filter(p => p.status && p.status.toLowerCase() === "flagged");

    if (flaggedPosts.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-warning">No flagged posts found.</td></tr>';
      return;
    }

    flaggedPosts.forEach(post => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${post.post_id}</td>
        <td>${post.username}</td>
        <td>${post.post_content}</td>
        <td>${new Date(post.created_at).toLocaleString()}</td>
        <td>${post.status}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete(${post.post_id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("❌ Error loading flagged reports:", error);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to load flagged posts</td></tr>';
  }
});

let postIdToDelete = null;

function confirmDelete(postId) {
  postIdToDelete = postId;
  document.getElementById("confirm-toast").style.display = "block";
}

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  if (!postIdToDelete) return;

  try {
    const res = await fetch(`/admin/posts/${postIdToDelete}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete post");

    showToast("🗑️ Flagged post deleted successfully.");
    location.reload();
  } catch (err) {
    console.error("❌ Delete error:", err);
    showToast("Failed to delete flagged post.");
  }

  document.getElementById("confirm-toast").style.display = "none";
  postIdToDelete = null;
});

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  document.getElementById("confirm-toast").style.display = "none";
  postIdToDelete = null;
});

function showToast(message, duration = 3000) {
  const toastContainer = document.getElementById("toast-container");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;
  toastContainer.style.display = "block";

  setTimeout(() => {
    toastContainer.style.display = "none";
  }, duration);
}
