// Storage Service - Centralized localStorage management
const StorageService = {
    // Generic methods
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key)) || null;
        } catch (e) {
            console.error(`Error reading ${key}:`, e);
            return null;
        }
    },
    
    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving ${key}:`, e);
            return false;
        }
    },
    
    remove: (key) => {
        localStorage.removeItem(key);
    },
    
    clear: () => {
        localStorage.clear();
    },
    
    // User methods
    getUsers: () => StorageService.get(CONFIG.STORAGE_KEYS.USERS) || [],
    saveUsers: (users) => StorageService.set(CONFIG.STORAGE_KEYS.USERS, users),
    
    getCurrentUser: () => {
        const email = localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
        if (!email) return null;
        
        const users = StorageService.getUsers();
        return users.find(u => u.email === email) || null;
    },
    
    isLoggedIn: () => {
        return !!localStorage.getItem(CONFIG.STORAGE_KEYS.SESSION);
    },
    
    // Cart methods
    getCart: () => StorageService.get(CONFIG.STORAGE_KEYS.CART) || [],
    saveCart: (cart) => StorageService.set(CONFIG.STORAGE_KEYS.CART, cart),
    
    // Wishlist methods
    getWishlist: () => StorageService.get(CONFIG.STORAGE_KEYS.WISHLIST) || [],
    saveWishlist: (wishlist) => StorageService.set(CONFIG.STORAGE_KEYS.WISHLIST, wishlist),
    
    // Theme
    getTheme: () => localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'dark',
    setTheme: (theme) => localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme)
};