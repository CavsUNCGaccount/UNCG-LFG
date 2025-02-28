// Wait for DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    // ========== USERNAME ==========
    document.querySelector("#edit-username").addEventListener("click", () => {
        const usernameField = document.querySelector("#username");
        usernameField.disabled = false;
        usernameField.focus();
        document.querySelector("#save-username").style.display = "inline-block";
    });

    document.querySelector("#save-username").addEventListener("click", async () => {
        const newUsername = document.querySelector("#username").value;

        try {
            const response = await fetch("http://localhost:5000/gamer-profile/update-username", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ username: newUsername })
            });

            if (response.ok) {
                alert("Username updated successfully!");
                document.querySelector("#username").disabled = true;
                document.querySelector("#save-username").style.display = "none";
            } else {
                alert("Failed to update username.");
            }
        } catch (error) {
            console.error("Error updating username:", error);
        }
    });

    // ========== EMAIL ==========
    document.querySelector("#edit-email").addEventListener("click", () => {
        const emailField = document.querySelector("#email");
        emailField.disabled = false;
        emailField.focus();
        document.querySelector("#save-email").style.display = "inline-block";
    });

    document.querySelector("#save-email").addEventListener("click", async () => {
        const newEmail = document.querySelector("#email").value;

        try {
            const response = await fetch("http://localhost:5000/gamer-profile/update-email", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email: newEmail })
            });

            if (response.ok) {
                alert("Email updated successfully!");
                document.querySelector("#email").disabled = true;
                document.querySelector("#save-email").style.display = "none";
            } else {
                alert("Failed to update email.");
            }
        } catch (error) {
            console.error("Error updating email:", error);
        }
    });

    // ========== PSN ==========
    document.querySelector("#edit-psn").addEventListener("click", () => {
        const psnField = document.querySelector("#psn-id"); // Change 'psn' to 'psn-id'
        psnField.disabled = false;
        psnField.focus();
        document.querySelector("#save-psn").style.display = "inline-block";
    });
    
    document.querySelector("#save-psn").addEventListener("click", async () => {
        const newPSN = document.querySelector("#psn-id").value; // Change 'psn' to 'psn-id'
    
        try {
            const response = await fetch("/gamer-profile/update-psn", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ psn: newPSN })
            });
    
            if (response.ok) {
                alert("PSN ID updated successfully!");
                document.querySelector("#psn-id").disabled = true; // Change 'psn' to 'psn-id'
                document.querySelector("#save-psn").style.display = "none";
            } else {
                alert("Failed to update PSN ID.");
            }
        } catch (error) {
            console.error("Error updating PSN ID:", error);
        }
    });

    // ========== XBOX ==========
    document.querySelector("#edit-xbox").addEventListener("click", () => {
        const xboxField = document.querySelector("#xbox-id");
        xboxField.disabled = false;
        xboxField.focus();
        document.querySelector("#save-xbox").style.display = "inline-block";
    });

    document.querySelector("#save-xbox").addEventListener("click", async () => {
        const newXbox = document.querySelector("#xbox-id").value;

        try {
            const response = await fetch("http://localhost:5000/gamer-profile/update-xbox", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ xbox: newXbox })
            });

            if (response.ok) {
                alert("Xbox ID updated successfully!");
                document.querySelector("#xbox-id").disabled = true;
                document.querySelector("#save-xbox").style.display = "none";
            } else {
                alert("Failed to update Xbox ID.");
            }
        } catch (error) {
            console.error("Error updating Xbox ID:", error);
        }
    });
});
