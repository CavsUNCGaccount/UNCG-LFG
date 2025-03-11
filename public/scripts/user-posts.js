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
                        <p class="card-text">${post.post_content}</p>
                    </div>
                `;
                postsContainer.appendChild(postElement);
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