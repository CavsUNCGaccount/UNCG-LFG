document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("posts-table");

  try {
    const res = await fetch("/admin/posts");

    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}`);
    }

    const posts = await res.json();
    console.log("Fetched posts:", posts);

    if (!Array.isArray(posts)) {
      throw new Error("Posts is not an array");
    }

    posts.forEach((post) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${post.post_id}</td>
        <td>${post.username}</td>
        <td>${post.post_content}</td>
        <td>${new Date(post.created_at).toLocaleString()}</td>
        <td>${post.status || "Pending"}</td>
        <td>
          <button class="btn btn-sm btn-danger me-1" onclick="deletePost(${post.post_id})">Delete</button>
          <button class="btn btn-sm btn-warning" onclick="flagPost(${post.post_id})" data-post-id="${post.post_id}">Flag</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to load posts:", error);
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
  try {
    const res = await fetch(`/admin/posts/${postId}/flag`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "flagged" }),
    });

    if (!res.ok) throw new Error("Failed to flag post");

    // 🎯 Update the flag button visually
    const button = document.querySelector(`button[data-post-id="${postId}"]`);
    if (button) {
      button.innerText = "Flagged ✅";
      button.classList.remove("btn-warning");
      button.classList.add("btn-secondary");
      button.disabled = true;
    }

    console.log(`✅ Post ${postId} flagged.`);
  } catch (err) {
    console.error("❌ Flag error:", err);
    alert("Failed to flag post.");
  }
}
