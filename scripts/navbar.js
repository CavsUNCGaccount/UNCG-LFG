document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("navbar-container").innerHTML = `
        <header id="header">
            <nav id="navbar">
                <div class="logo">
                    <a href="index.html">
                        <img id="circular-logo" src="images/gaming-controller-circular.png" alt="UNCG LFG Logo">
                    </a>
                </div>
                <ul>
                    <li><a href="index.html#about">About</a></li>
                    <li><a href="index.html#features">Features</a></li>
                    <li><a href="index.html#games">Games</a></li>
                    <li><a href="login.html" class="login-signup">Login</a></li>
                    <li><a href="signup.html" class="login-signup">Sign Up</a></li>
                </ul>
                <div class="account-menu">
                    <a href="gamer-account-page.html">
                        <img id="account-pic" src="images/default-avatar.png" alt="Account">
                    </a>
                </div>
            </nav>
        </header>
    `;

    let lastScrollTop = 0;
    const header = document.getElementById('header');

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.classList.add('hidden');
        } else {
            // Scrolling up
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;
    });
});