document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("chat-history-table");
  
    try {
      const res = await fetch("/admin/chat-history");
  
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
  
      const messages = await res.json();
      console.log("Fetched Chat History:", messages);
  
      if (!Array.isArray(messages)) {
        throw new Error("Chat history is not an array");
      }
  
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
            <button class="btn btn-sm btn-danger" onclick="deleteMessage(${msg.reply_id})">Delete</button>
          </td>
        `;
  
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error("❌ Error loading chat history:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load chat history.</td></tr>`;
    }
  });
  
  // Optional delete function placeholder
  function deleteMessage(replyId) {
    console.log("Delete Message ID:", replyId);
    // You can implement actual delete logic here later
  }
  