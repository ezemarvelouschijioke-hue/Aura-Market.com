// ===== RECENTLY VIEWED PRODUCTS =====
const RecentlyViewedService = {
    maxItems: 8,
    
    addProduct: (productId) => {
        let recent = JSON.parse(localStorage.getItem('recently_viewed')) || [];
        
        // Remove if already exists
        recent = recent.filter(id => id !== productId);
        
        // Add to front
        recent.unshift(productId);
        
        // Keep only max items
        recent = recent.slice(0, RecentlyViewedService.maxItems);
        
        localStorage.setItem('recently_viewed', JSON.stringify(recent));
    },
    
    getProducts: () => {
        let recentIds = JSON.parse(localStorage.getItem('recently_viewed')) || [];
        return recentIds.map(id => ProductService.getById(id)).filter(p => p);
    },
    
    clear: () => {
        localStorage.removeItem('recently_viewed');
    }
};

window.RecentlyViewedService = RecentlyViewedService;