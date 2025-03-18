document.addEventListener("DOMContentLoaded", async function () {
    const params = new URLSearchParams(window.location.search);
    const game_name = params.get("game_name");
    console.log("Game name:", game_name); 

    if (!game_name) {
        console.error("Game name is required.");
        return;
    }

    // Set the game name in the page title
    const gameNameElement = document.getElementById("game-name");
    gameNameElement.textContent = `${game_name} - User Posts`;

    const postForm = document.getElementById("post-form");
    const postContent = document.getElementById("post-content");
    const postsContainer = document.getElementById("posts-container");

    // Fetch and display posts
    async function fetchPosts() {
        try {
            const response = await fetch(`/community/posts?game_name=${encodeURIComponent(game_name)}`, {
                credentials: "include"
            });
            const posts = await response.json();

            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.className = "card mb-3 bg-dark text-white";
                postElement.innerHTML = `
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="card-title">${post.username}</h5>
                            <small>${new Date(post.created_at).toLocaleString()} <img src="${post.cover_image_url}" alt="${post.game_name}" width="25"></small>
                        </div>
                        <p class="card-text" id="post-content-${post.post_id}">${post.post_content}</p>
                        ${
                            post.is_owner
                                ? `<button class="btn btn-sm btn-warning edit-post-btn" data-post-id="${post.post_id}">Edit</button>`
                                : ""
                        }
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });

            // Add event listeners to edit buttons
            document.querySelectorAll(".edit-post-btn").forEach(button => {
                button.addEventListener("click", handleEditPost);
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    // Handle form submission
    postForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        try {
            const response = await fetch("/community/create-post", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ game_name, post_content: postContent.value })
            });

            const newPost = await response.json();
            if (response.ok) {
                postContent.value = "";
                fetchPosts(); // Refresh posts
            } else {
                alert(newPost.message);
            }
        } catch (error) {
            console.error("Error creating post:", error);
        }
    });

    // Initial fetch of posts
    fetchPosts();
});

async function handleEditPost(event) {
    const postId = event.target.getAttribute("data-post-id");
    const postContentElement = document.getElementById(`post-content-${postId}`);
    const originalContent = postContentElement.textContent;

    // Replace the post content with an editable textarea
    postContentElement.innerHTML = `
        <textarea class="form-control mb-2" id="edit-content-${postId}">${originalContent}</textarea>
        <button class="btn btn-sm btn-success save-edit-btn" data-post-id="${postId}">Save</button>
        <button class="btn btn-sm btn-secondary cancel-edit-btn" data-post-id="${postId}">Cancel</button>
    `;

    // Add event listeners for save and cancel buttons
    document.querySelector(`.save-edit-btn[data-post-id="${postId}"]`).addEventListener("click", async () => {
        const newContent = document.getElementById(`edit-content-${postId}`).value;

        try {
            const response = await fetch("/community/edit-post", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id: postId, post_content: newContent })
            });

            if (response.ok) {
                const updatedPost = await response.json();
                postContentElement.innerHTML = updatedPost.post_content;
            } else {
                const errorData = await response.json();
                alert(errorData.message);
            }
        } catch (error) {
            console.error("Error updating post:", error);
        }
    });

    document.querySelector(`.cancel-edit-btn[data-post-id="${postId}"]`).addEventListener("click", () => {
        postContentElement.innerHTML = originalContent;
    });
}