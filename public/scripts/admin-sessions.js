document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("session-logs-table");
  
    async function loadSessionLogs() {
      try {
        const res = await fetch("/admin/sessions"); // Your backend route
        if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
  
        const sessions = await res.json();
        console.log("🕒 Sessions:", sessions);
  
        tableBody.innerHTML = "";
  
        sessions.forEach(session => {
          const { sid, sess, expire } = session;
  
          // Parse session JSON
          let user = "Unknown";
          let role = "Unknown";
          let loginTime = "Unknown";
          let ipAddress = "N/A";
  
          try {
            const parsed = typeof sess === "string" ? JSON.parse(sess) : sess;
  
            // Example structure: {"cookie": {...}, "user": "admin", "role": "admin", "loginTime": "..."}
            user = parsed.user || "Unknown";
            role = parsed.role || "Unknown";
            loginTime = parsed.loginTime || "Unknown";
            ipAddress = parsed.ip || "N/A";
  
          } catch (err) {
            console.warn("⚠️ Failed to parse session JSON for sid:", sid, err);
          }
  
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${sid}</td>
            <td>${user}</td>
            <td>${role}</td>
            <td>${loginTime}</td>
            <td>${new Date(expire).toLocaleString()}</td>
            <td>${ipAddress}</td>
          `;
          tableBody.appendChild(row);
        });
  
      } catch (error) {
        console.error("❌ Failed to load session logs:", error);
        tableBody.innerHTML = `
          <tr><td colspan="6" class="text-danger text-center">
            Failed to load session logs.
          </td></tr>
        `;
      }
    }
  
    loadSessionLogs();
  });
  