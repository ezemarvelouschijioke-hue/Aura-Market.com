// Authentication Module
const AuthService = {
    // Configuration
    config: {
        adminEmails: [
            'ezemarvelouschijioke@gmail.com',
            'marvin@dm.com',    // <-- ADD YOUR EMAIL HERE
            ''    // <-- ADD ANY OTHER ADMIN EMAILS
        ],
        sessionTimeout: 60 * 60 * 1000, // 60 minutes
        minPasswordLength: 6
    },

    // Initialize
    init: () => {
        AuthService.checkSessionTimeout();
        AuthService.updateNavbar();
        
        window.addEventListener('click', () => AuthService.resetSessionTimer());
        window.addEventListener('keypress', () => AuthService.resetSessionTimer());
        window.addEventListener('mousemove', () => AuthService.resetSessionTimer());
    },

    sessionTimer: null,

    resetSessionTimer: () => {
        if (!AuthService.isAuthenticated()) return;
        
        if (AuthService.sessionTimer) {
            clearTimeout(AuthService.sessionTimer);
        }
        
        AuthService.sessionTimer = setTimeout(() => {
            AuthService.logout(true);
        }, AuthService.config.sessionTimeout);
    },

    checkSessionTimeout: () => {
        const lastActivity = localStorage.getItem('LAST_ACTIVITY');
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > AuthService.config.sessionTimeout) {
                AuthService.logout(true);
            }
        }
        AuthService.updateLastActivity();
    },

    updateLastActivity: () => {
        localStorage.setItem('LAST_ACTIVITY', Date.now().toString());
    },

    // Sign up
    signup: (name, email, password) => {
        if (!name || !email || !password) {
            Utils.showToast('All fields are required!', 'error');
            return false;
        }
        
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email!', 'error');
            return false;
        }
        
        if (password.length < AuthService.config.minPasswordLength) {
            Utils.showToast(`Password must be at least ${AuthService.config.minPasswordLength} characters!`, 'error');
            return false;
        }
        
        let users = StorageService.getUsers();
        
        if (users.some(u => u.email === email)) {
            Utils.showToast('Email already registered!', 'error');
            return false;
        }
        
        const newUser = {
            id: Utils.generateId(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            orders: [],
            addresses: [],
            wishlist: [],
            isAdmin: AuthService.config.adminEmails.includes(email)
        };
        
        users.push(newUser);
        StorageService.saveUsers(users);
        
        Utils.showToast('Account created successfully!', 'success');
        return true;
    },
    
    // Login
    login: (email, password) => {
        if (!email || !password) {
            Utils.showToast('Email and password required!', 'error');
            return false;
        }
        
        const users = StorageService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            user.lastLogin = new Date().toISOString();
            StorageService.saveUsers(users);
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, user.email);
            
            if (user.isAdmin || AuthService.config.adminEmails.includes(user.email)) {
                sessionStorage.setItem('admin_authenticated', 'true');
            }
            
            AuthService.resetSessionTimer();
            AuthService.updateLastActivity();
            
            Utils.showToast(`Welcome back, ${user.name}!`, 'success');
            return true;
        } else {
            Utils.showToast('Invalid email or password!', 'error');
            return false;
        }
    },
    
    // Admin login
    adminLogin: (email, password) => {
        const users = StorageService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            Utils.showToast('Invalid credentials', 'error');
            return false;
        }
        
        if (!user.isAdmin && !AuthService.config.adminEmails.includes(user.email)) {
            Utils.showToast('This account does not have admin privileges', 'error');
            return false;
        }
        
        user.lastLogin = new Date().toISOString();
        StorageService.saveUsers(users);
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, user.email);
        sessionStorage.setItem('admin_authenticated', 'true');
        
        AuthService.resetSessionTimer();
        AuthService.updateLastActivity();
        
        Utils.showToast('Admin access granted', 'success');
        return true;
    },
    
    // Logout
    logout: (isTimeout = false) => {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.SESSION);
        sessionStorage.removeItem('admin_authenticated');
        localStorage.removeItem('LAST_ACTIVITY');
        
        if (AuthService.sessionTimer) {
            clearTimeout(AuthService.sessionTimer);
        }
        
        if (isTimeout) {
            Utils.showToast('Session expired. Please login again.', 'warning');
        } else {
            Utils.showToast('Logged out successfully', 'info');
        }
        
        const protectedPages = ['account.html', 'admin.html', 'checkout.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        }
        
        AuthService.updateNavbar();
    },
    
    // Get current user
    getCurrentUser: () => {
        const email = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
        if (!email) return null;
        
        const users = StorageService.getUsers();
        return users.find(u => u.email === email) || null;
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
    },
    
    isAdmin: () => {
        const user = AuthService.getCurrentUser();
        if (!user) return false;
        
        return user.isAdmin === true || AuthService.config.adminEmails.includes(user.email);
    },
    
    hasAdminAccess: () => {
        return AuthService.isAuthenticated() && 
               (AuthService.isAdmin() || sessionStorage.getItem('admin_authenticated') === 'true');
    },
    
    updateProfile: (updates) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            Utils.showToast('Please login first', 'error');
            return false;
        }
        
        let users = StorageService.getUsers();
        const index = users.findIndex(u => u.email === currentUser.email);
        
        if (index !== -1) {
            delete updates.id;
            delete updates.createdAt;
            delete updates.isAdmin;
            
            users[index] = { ...users[index], ...updates };
            StorageService.saveUsers(users);
            
            if (updates.email) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, updates.email);
            }
            
            Utils.showToast('Profile updated successfully!', 'success');
            return true;
        }
        
        Utils.showToast('Error updating profile', 'error');
        return false;
    },
    
    changePassword: (oldPassword, newPassword) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            Utils.showToast('Please login first', 'error');
            return false;
        }
        
        if (currentUser.password !== oldPassword) {
            Utils.showToast('Current password is incorrect!', 'error');
            return false;
        }
        
        if (newPassword.length < AuthService.config.minPasswordLength) {
            Utils.showToast(`New password must be at least ${AuthService.config.minPasswordLength} characters!`, 'error');
            return false;
        }
        
        if (newPassword === oldPassword) {
            Utils.showToast('New password must be different from old password', 'warning');
            return false;
        }
        
        return AuthService.updateProfile({ password: newPassword });
    },
    
    updateNavbar: () => {
    const loginBtn = document.querySelector('a[href="login.html"]');
    if (!loginBtn) return;
    
    const user = AuthService.getCurrentUser();
    const isAdmin = AuthService.isAdmin();
    const isLightTheme = document.body.classList.contains('light-theme');
    
    const existingLogout = document.querySelector('.logout-btn');
    if (existingLogout) existingLogout.remove();
    
    const existingAdminBadge = document.querySelector('.admin-badge');
    if (existingAdminBadge) existingAdminBadge.remove();
    
    if (user) {
        // Update login button to profile link with correct theme class
        loginBtn.innerHTML = `<i class="fa fa-user"></i> ${user.name.split(' ')[0]}`;
        loginBtn.href = 'account.html';
        loginBtn.classList.remove('btn-outline-light', 'btn-outline-dark');
        loginBtn.classList.add(isLightTheme ? 'btn-outline-dark' : 'btn-outline-light');
        
        // Create logout button with correct theme class
        const logoutBtn = document.createElement('button');
        logoutBtn.className = `btn ${isLightTheme ? 'btn-outline-dark' : 'btn-outline-light'} ms-2 logout-btn`;
        logoutBtn.innerHTML = '<i class="fa fa-sign-out-alt"></i>';
        logoutBtn.title = 'Logout';
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            AuthService.logout();
            window.location.reload();
        };
        
        if (isAdmin) {
            const adminBadge = document.createElement('span');
            adminBadge.className = 'badge bg-warning text-dark ms-2 admin-badge';
            adminBadge.innerHTML = '<i class="fa fa-crown"></i> Admin';
            adminBadge.style.cursor = 'pointer';
            adminBadge.onclick = () => window.location.href = 'admin.html';
            loginBtn.parentNode.insertBefore(adminBadge, loginBtn.nextSibling);
        }
        
        loginBtn.parentNode.appendChild(logoutBtn);
    } else {
        loginBtn.innerHTML = '<i class="fa fa-user"></i> Login';
        loginBtn.href = 'login.html';
        loginBtn.classList.remove('btn-outline-light', 'btn-outline-dark');
        loginBtn.classList.add(isLightTheme ? 'btn-outline-dark' : 'btn-outline-light');
    }
},
    
    requireAuth: (redirectTo = null) => {
        if (!AuthService.isAuthenticated()) {
            Utils.showToast('Please login to continue', 'warning');
            const redirect = redirectTo || window.location.pathname;
            window.location.href = `login.html?redirect=${encodeURIComponent(redirect)}`;
            return false;
        }
        return true;
    },
    
    requireAdmin: () => {
        if (!AuthService.hasAdminAccess()) {
            if (!AuthService.isAuthenticated()) {
                Utils.showToast('Please login first', 'warning');
                window.location.href = 'login.html?redirect=admin.html';
            } else {
                Utils.showToast('Admin access required', 'error');
                window.location.href = 'index.html';
            }
            return false;
        }
        return true;
    },
    
    getAllUsers: () => {
        if (!AuthService.isAdmin()) {
            Utils.showToast('Admin access required', 'error');
            return [];
        }
        return StorageService.getUsers();
    },
    
    deleteUser: (email) => {
        if (!AuthService.isAdmin()) {
            Utils.showToast('Admin access required', 'error');
            return false;
        }
        
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.email === email) {
            Utils.showToast('Cannot delete your own account', 'error');
            return false;
        }
        
        let users = StorageService.getUsers();
        users = users.filter(u => u.email !== email);
        StorageService.saveUsers(users);
        
        Utils.showToast('User deleted successfully', 'success');
        return true;
    },
    
    toggleAdminStatus: (email) => {
        if (!AuthService.isAdmin()) {
            Utils.showToast('Admin access required', 'error');
            return false;
        }
        
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.email === email) {
            Utils.showToast('Cannot modify your own admin status', 'error');
            return false;
        }
        
        let users = StorageService.getUsers();
        const user = users.find(u => u.email === email);
        
        if (user) {
            user.isAdmin = !user.isAdmin;
            StorageService.saveUsers(users);
            
            Utils.showToast(`Admin status ${user.isAdmin ? 'granted' : 'removed'} for ${email}`, 'success');
            return true;
        }
        
        return false;
    },
    
    getLoginHistory: () => {
        if (!AuthService.isAdmin()) {
            return [];
        }
        
        const users = StorageService.getUsers();
        return users
            .filter(u => u.lastLogin)
            .map(u => ({
                name: u.name,
                email: u.email,
                lastLogin: u.lastLogin
            }))
            .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AuthService.init();
});