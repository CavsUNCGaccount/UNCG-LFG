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
                            <small>${new Date(post.created_at).toLocaleString()}</small>
                        </div>
                        <p class="card-text">${post.post_content}</p>
                        <button class="btn btn-sm btn-secondary view-replies-btn" data-post-id="${post.post_id}">View Replies</button>
                        <div class="replies-container mt-3" id="replies-container-${post.post_id}"></div>
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });

            // Add event listeners to "View Replies" buttons
            document.querySelectorAll(".view-replies-btn").forEach(button => {
                button.addEventListener("click", handleViewReplies);
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

async function handleViewReplies(event) {
    const postId = event.target.getAttribute("data-post-id");
    const repliesContainer = document.getElementById(`replies-container-${postId}`);

    // Fetch replies for the post
    try {
        const response = await fetch(`/community/replies?post_id=${postId}`);
        const replies = await response.json();

        repliesContainer.innerHTML = "";
        replies.forEach(reply => {
            const replyElement = document.createElement("div");
            replyElement.className = "card bg-secondary text-white mb-2";
            replyElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <h6 class="card-title">${reply.username}</h6>
                        <small>${new Date(reply.created_at).toLocaleString()}</small>
                    </div>
                    <p class="card-text">${reply.reply_content}</p>
                </div>
            `;
            repliesContainer.appendChild(replyElement);
        });

        // Add a reply form
        repliesContainer.innerHTML += `
            <form class="reply-form mt-3">
                <textarea class="form-control mb-2" placeholder="Write your reply..."></textarea>
                <button type="submit" class="btn btn-primary btn-sm">Reply</button>
            </form>
        `;

        // Add event listener to the reply form
        const replyForm = repliesContainer.querySelector(".reply-form");
        replyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const replyContent = replyForm.querySelector("textarea").value;

            try {
                const response = await fetch("/community/create-reply", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ post_id: postId, reply_content: replyContent })
                });

                if (response.ok) {
                    replyForm.querySelector("textarea").value = "";
                    handleViewReplies(event); // Refresh replies
                } else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("Error creating reply:", error);
            }
        });
    } catch (error) {
        console.error("Error fetching replies:", error);
    }
}