// App configuration
const CONFIG = {
    APP_NAME: 'Aura Market',
    VERSION: '1.0.0',
    
    // Paystack (move to environment variable in production)
    PAYSTACK: {
        PUBLIC_KEY: 'pk_test_78045bf87cd16419ebc3d9e23a9f348127189871', // Replace with actual key
        CURRENCY: 'USD'
    },
    
    // Storage keys
    STORAGE_KEYS: {
        USERS: 'AURA_USERS',
        SESSION: 'USER_SESSION',
        CART: 'CART',
        WISHLIST: 'AURA_WISHLIST',
        LAST_ORDER: 'LAST_ORDER',
        THEME: 'theme'
    },
    
    // Product categories
    CATEGORIES: [ 'All Categories', 'All', 'Electronics', 'Fashion', 'Accessories', 'Beauty'],
    
    // Pagination
    PRODUCTS_PER_PAGE: 12
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);