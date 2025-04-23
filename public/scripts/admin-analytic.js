document.addEventListener("DOMContentLoaded", async () => {
    try {
      // Fetch live analytics data
      const res = await fetch("/admin/analytics-overview");
  
      if (!res.ok) throw new Error(`Status ${res.status}`);
  
      const data = await res.json();
      document.getElementById("total-users").textContent = data.total_users;
      document.getElementById("active-groups").textContent = data.active_groups;
      document.getElementById("flagged-posts").textContent = data.flagged_posts;
      document.getElementById("suspended-users").textContent = data.suspended_users;
  
      // Optionally store analytics snapshot in DB
      await fetch("/admin/analytics-overview/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          total_users: data.total_users,
          active_groups: data.active_groups,
          flagged_posts: data.flagged_posts,
          suspended_users: data.suspended_users
        })
      });
  
      console.log("✅ Analytics snapshot optionally saved to DB.");
    } catch (err) {
      console.error("Error loading analytics:", err);
    }
  });