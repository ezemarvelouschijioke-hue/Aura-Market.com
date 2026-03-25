document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    
    // 1. Get our "database" of users
    const users = JSON.parse(localStorage.getItem("AURA_USERS")) || [];
    
    // 2. Look for the user
    const userMatch = users.find(u => u.email === email && u.password === password);
    
    if (userMatch) {
        // Log them in using their actual email (used for your cart/session logic)
        localStorage.setItem("USER_SESSION", userMatch.email);
        alert("Welcome back, " + (userMatch.name || "User") + "!");
        window.location.href = "index.html";
    } else {
        alert("Invalid email or password. Please try again.");
    }
});