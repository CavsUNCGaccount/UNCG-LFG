document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.getElementById("chat-history-table");

  try {
    const res = await fetch("/admin/chat-history");
    if (!res.ok) throw new Error(`Server responded with status ${res.status}`);

    const messages = await res.json();
    if (!Array.isArray(messages)) throw new Error("Chat history is not an array");

    if (messages.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No chat messages found.</td></tr>`;
      return;
    }

    messages.forEach((msg) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${msg.reply_id}</td>
        <td>${msg.game_id ?? "N/A"}</td>
        <td>${msg.username}</td>
        <td>${msg.reply_content}</td>
        <td>${new Date(msg.created_at).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="confirmDelete(${msg.reply_id})">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("❌ Error loading chat history:", error);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load chat history.</td></tr>`;
  }
});

let messageToDelete = null;

function confirmDelete(replyId) {
  messageToDelete = replyId;
  document.getElementById("confirm-toast").style.display = "block";
}

document.getElementById("confirm-delete-btn").addEventListener("click", async () => {
  if (!messageToDelete) return;

  try {
    const res = await fetch(`/admin/chat-history/${messageToDelete}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete message");

    showToast("🗑️ Message deleted successfully.");
    location.reload();
  } catch (err) {
    console.error("❌ Delete error:", err);
    showToast("Failed to delete message.");
  }

  document.getElementById("confirm-toast").style.display = "none";
  messageToDelete = null;
});

document.getElementById("cancel-delete-btn").addEventListener("click", () => {
  document.getElementById("confirm-toast").style.display = "none";
  messageToDelete = null;
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
