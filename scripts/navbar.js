document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("navbar-container").innerHTML = `
        <header>
            <nav>
                <div class="logo">
                    <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo">
                </div>
                <ul>
                    <li><a href="index.html#about">About</a></li>
                    <li><a href="index.html#features">Features</a></li>
                    <li><a href="index.html#games">Games</a></li>
                    <li><a href="login.html" class="login-signup">Login</a></li>
                    <li><a href="signup.html" class="login-signup">Sign Up</a></li>
                </ul>
            </nav>
        </header>
    `;
});
