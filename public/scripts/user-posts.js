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
                        <p class="card-text" id="post-content-${post.post_id}">${post.post_content}</p>
                        <button class="btn btn-sm btn-secondary view-replies-btn" data-post-id="${post.post_id}">View Replies</button>
                        <div class="replies-container mt-3" id="replies-container-${post.post_id}"></div>
                        ${
                            post.is_owner
                                ? `<button class="btn btn-sm btn-warning edit-post-btn" data-post-id="${post.post_id}">Edit</button>`
                                : ""
                        }
                    </div>
                `;
                postsContainer.appendChild(postElement);
            });

            // Add event listeners to "View Replies" buttons
            document.querySelectorAll(".view-replies-btn").forEach(button => {
                button.addEventListener("click", handleViewReplies);
            });

            // Add event listeners to "Edit" buttons
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

async function handleViewReplies(event) {
    const postId = event.target.getAttribute("data-post-id");
    const repliesContainer = document.getElementById(`replies-container-${postId}`);

    // Toggle visibility of replies
    if (repliesContainer.style.display === "block") {
        repliesContainer.style.display = "none";
        event.target.textContent = "View Replies";
        return;
    }

    event.target.textContent = "Hide Replies";
    repliesContainer.style.display = "block";

    // Fetch replies for the post
    try {
        const response = await fetch(`/community/replies?post_id=${postId}`);
        const replies = await response.json();

        repliesContainer.innerHTML = "";

        // Render replies
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
                    <button class="btn btn-sm btn-light reply-to-reply-btn" data-reply-id="${reply.reply_id}" data-post-id="${postId}">Reply</button>
                    <div class="nested-replies-container mt-3" id="nested-replies-container-${reply.reply_id}"></div>
                </div>
            `;
            repliesContainer.appendChild(replyElement);
        });

        // Add reply form at the bottom of the replies
        repliesContainer.innerHTML += `
            <form class="reply-form mt-3">
                <textarea class="form-control mb-2" placeholder="Write your reply..."></textarea>
                <button type="submit" class="btn btn-primary btn-sm">Reply</button>
            </form>
        `;

        // Add event listeners for reply buttons
        document.querySelectorAll(".reply-to-reply-btn").forEach(button => {
            button.addEventListener("click", handleReplyToReply);
        });

        // Add event listener for the reply form
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

async function handleReplyToReply(event) {
    const replyId = event.target.getAttribute("data-reply-id");
    const postId = event.target.getAttribute("data-post-id");
    const nestedRepliesContainer = document.getElementById(`nested-replies-container-${replyId}`);

    // Add a reply form if it doesn't already exist
    if (!nestedRepliesContainer.querySelector(".nested-reply-form")) {
        nestedRepliesContainer.innerHTML = `
            <form class="nested-reply-form mt-3">
                <textarea class="form-control mb-2" placeholder="Write your reply..."></textarea>
                <button type="submit" class="btn btn-primary btn-sm">Reply</button>
            </form>
        `;

        // Add event listener for the nested reply form
        const nestedReplyForm = nestedRepliesContainer.querySelector(".nested-reply-form");
        nestedReplyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const replyContent = nestedReplyForm.querySelector("textarea").value;

            try {
                const response = await fetch("/community/create-reply", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ post_id: postId, reply_content: replyContent, parent_reply_id: replyId })
                });

                if (response.ok) {
                    nestedReplyForm.querySelector("textarea").value = "";
                    handleViewReplies({ target: document.querySelector(`.view-replies-btn[data-post-id="${postId}"]`) }); // Refresh replies
                } else {
                    const errorData = await response.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("Error creating nested reply:", error);
            }
        });
    }
}