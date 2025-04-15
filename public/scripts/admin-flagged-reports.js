document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("flagged-posts-table");
  
    try {
      const res = await fetch("/admin/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
  
      const posts = await res.json();
      console.log("📌 Flagged posts received:", posts);
  
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
            <button class="btn btn-sm btn-danger" onclick="deletePost(${post.post_id})">Delete</button>
          </td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("❌ Error loading flagged reports:", error);
      tableBody.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to load flagged posts</td></tr>';
    }
  });
  
  async function deletePost(postId) {
    if (!confirm("Are you sure you want to delete this flagged post?")) return;
  
    try {
      const res = await fetch(`/admin/posts/${postId}`, {
        method: "DELETE"
      });
  
      if (!res.ok) throw new Error("Failed to delete post");
  
      alert("🗑️ Flagged post deleted successfully.");
      location.reload();
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("Failed to delete flagged post.");
    }
  }