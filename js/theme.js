// Theme Manager
const ThemeManager = {
    init: () => {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        // Load saved theme
        const savedTheme = StorageService.getTheme();
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.checked = true;
            ThemeManager.updateIcons('light');
            ThemeManager.updateButtons('light');
        } else {
            ThemeManager.updateIcons('dark');
            ThemeManager.updateButtons('dark');
        }
        
        // Add event listener
        themeToggle.addEventListener('change', ThemeManager.toggleTheme);
    },
    
    toggleTheme: (e) => {
        const isLight = e.target.checked;
        const theme = isLight ? 'light' : 'dark';
        
        if (isLight) {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        
        StorageService.setTheme(theme);
        ThemeManager.updateIcons(theme);
        ThemeManager.updateButtons(theme);
        
        // Update auth navbar if exists
        if (typeof AuthService !== 'undefined') {
            AuthService.updateNavbar();
        }
    },
    
    updateIcons: (theme) => {
        const themeIcon = document.querySelector('.theme-icon i');
        if (themeIcon) {
            themeIcon.className = theme === 'light' ? 'fa fa-moon' : 'fa fa-sun';
        }
    },
    
    updateButtons: (theme) => {
        const loginBtn = document.querySelector('a[href="login.html"]');
        const logoutBtn = document.querySelector('.logout-btn');
        const cartBtn = document.getElementById('open-cart-btn');
        
        const btnClass = theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light';
        
        if (loginBtn) {
            loginBtn.classList.remove('btn-outline-light', 'btn-outline-dark');
            loginBtn.classList.add(btnClass);
        }
        
        if (logoutBtn) {
            logoutBtn.classList.remove('btn-outline-light', 'btn-outline-dark');
            logoutBtn.classList.add(btnClass);
        }
        
        // Cart button stays warning, no change needed
    },
    
    // Call this after dynamically adding buttons
    refresh: () => {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        ThemeManager.updateIcons(currentTheme);
        ThemeManager.updateButtons(currentTheme);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});