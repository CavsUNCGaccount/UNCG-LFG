document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("navbar-container").innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand" href="index.html">
                    <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo" width="50"
                        height="50">
                    UNCG LFG
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                    aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item"><a class="nav-link" href="index.html#about">About</a></li>
                        <li class="nav-item"><a class="nav-link" href="index.html#features">Features</a></li>
                        <li class="nav-item"><a class="nav-link" href="index.html#games">Games</a></li>
                        <li class="nav-item"><a class="nav-link" href="app-policy.html">Policy</a></li>
                        <a href="login.html" class="btn btn-login-signup me-2">Login</a>
                        <a href="signup.html" class="btn btn-login-signup">Sign Up</a>
                    </ul>
                </div>
            </div>
        </nav>
    `;
});
