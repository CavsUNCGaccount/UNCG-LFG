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
          <button class="btn btn-sm btn-warning" onclick="flagPost(${post.post_id})">Flag</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to load posts:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load posts</td></tr>`;
  }
});

// Placeholder for future Delete logic
function deletePost(postId) {
  console.log("Delete Post ID:", postId);
  // TODO: Implement DELETE request here
}

// Placeholder for future Flag logic
function flagPost(postId) {
  console.log("Flag Post ID:", postId);
  // TODO: Implement PUT request here
}
