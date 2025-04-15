document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("posts-table");

  try {
    const res = await fetch("/admin/posts");
    console.log("🔍 Fetching posts from /admin/posts...");

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const posts = await res.json();
    console.log("📦 Received posts:", posts);

    if (!Array.isArray(posts)) {
      throw new Error("Posts is not an array");
    }

    posts.forEach((post) => {
      const row = document.createElement("tr");

      const isFlagged = post.status && post.status.toLowerCase() === "flagged";
      console.log(`🔎 Post ${post.post_id} flagged status:`, post.status, "=> isFlagged:", isFlagged);

      row.innerHTML = `
        <td>${post.post_id}</td>
        <td>${post.username}</td>
        <td>${post.post_content}</td>
        <td>${new Date(post.created_at).toLocaleString()}</td>
        <td id="status-${post.post_id}">${post.status || "Pending"}</td>
        <td id="actions-${post.post_id}">
          <button class="btn btn-sm btn-danger me-1" onclick="deletePost(${post.post_id})">Delete</button>
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

async function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    const res = await fetch(`/admin/posts/${postId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    alert("🗑️ Post deleted successfully.");
    location.reload();
  } catch (err) {
    console.error("❌ Delete error:", err);
    alert("Failed to delete post.");
  }
}

async function flagPost(postId) {
  console.log(`🚩 Attempting to flag post ${postId}...`);
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
        <button class="btn btn-sm btn-danger me-1" onclick="deletePost(${postId})">Delete</button>
        <button class="btn btn-sm btn-secondary" disabled id="flag-btn-${postId}">Flagged ✅</button>
      `;
    }

    console.log(`✅ Post ${postId} successfully flagged.`);
  } catch (err) {
    console.error("❌ Flag error:", err);
    alert("Failed to flag post.");
  }
}