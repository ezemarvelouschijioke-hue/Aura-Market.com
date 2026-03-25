const sidebar = document.getElementById("sidebar-cart");
const overlay = document.getElementById("overlay");

document.getElementById("open-cart-btn").onclick = () => {
    sidebar.classList.add("open");
    overlay.classList.add("active");
};

document.getElementById("close-cart-btn").onclick = closeCart;

overlay.onclick = closeCart;

function closeCart() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
}

const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
});

// Check for saved theme on load
if (localStorage.getItem('theme') === 'light') {
    themeToggle.checked = true;
    document.body.classList.add('light-theme');
}




