// FrontENd handler 


document.addEventListener("DOMContentLoaded", async function () {
    await loadAdminProfile();
    await loadReports();
});

// ✅ Fetch Admin Profile
async function loadAdminProfile() {
    try {
        const response = await fetch("http://localhost:3001/admin/me", { credentials: "include" });
        const data = await response.json();

        if (response.ok) {
            document.getElementById("username").value = data.username;
            document.getElementById("email").value = data.email;
            document.getElementById("admin-avatar").src = data.profile_picture || "images/default-avatar.png";
        } else {
            alert("Error fetching admin details: " + data.message);
        }
    } catch (error) {
        console.error("Error loading admin profile:", error);
    }
}

// ✅ Allow Profile Editing
function editField(fieldId) {
    let field = document.getElementById(fieldId);
    field.removeAttribute("disabled");
    field.focus();
}

// ✅ Save Admin Profile Updates
async function updateProfile() {
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3001/admin/update-profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Error updating profile:", error);
    }
}

// ✅ Handle Profile Picture Upload
document.getElementById("profile-upload").addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
        const response = await fetch("http://localhost:3001/admin/upload-profile-picture", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById("admin-avatar").src = data.profile_picture;
            alert("Profile picture updated successfully!");
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error uploading profile picture:", error);
    }
});

// ✅ Load Moderation Reports
async function loadReports() {
    try {
        const reportsResponse = await fetch("http://localhost:3001/admin/reports", { credentials: "include" });
        const reportsData = await reportsResponse.json();

        if (reportsResponse.ok) {
            const reportsTable = document.getElementById("reports-table");
            reportsTable.innerHTML = reportsData.map(report => `
                <tr>
                    <td>${report.reported_by_user}</td>
                    <td>${report.reported_user}</td>
                    <td>${report.reason}</td>
                    <td><span class="badge bg-${report.status === 'Pending' ? 'warning' : report.status === 'Reviewed' ? 'success' : 'danger'}">${report.status}</span></td>
                    <td><button class="btn btn-sm btn-outline-info" onclick="viewReport(${report.report_id})">View Details</button></td>
                </tr>
            `).join("");
        } else {
            alert("Error fetching reports: " + reportsData.message);
        }
    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// ✅ Navigate to Report Details
function viewReport(reportId) {
    window.location.href = `admin-report-details.html?reportId=${reportId}`;
}
