// ===== SOCIAL COMMERCE =====
const SocialService = {
    // Social Login (Google, Facebook)
    socialLogin: async (provider) => {
        // Simulate OAuth (in production, use Firebase Auth or similar)
        Utils.showToast(`Logging in with ${provider}...`, 'info');
        
        // Generate random user
        const mockUser = {
            id: Date.now(),
            name: `${provider} User ${Math.floor(Math.random() * 1000)}`,
            email: `user_${Date.now()}@${provider}.com`,
            provider: provider,
            createdAt: new Date().toISOString(),
            isAdmin: false
        };
        
        let users = StorageService.getUsers();
        users.push(mockUser);
        StorageService.saveUsers(users);
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.SESSION, mockUser.email);
        localStorage.setItem('social_login', provider);
        
        Utils.showToast(`Welcome, ${mockUser.name}!`, 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
    },
    
    // Share Product
    shareProduct: (product, platform) => {
        const url = window.location.href;
        const text = `Check out ${product.name} on Aura Market!`;
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            instagram: `instagram://library?AssetPath=`, // Deep link
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        };
        
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    },
    
    // Follow Seller
    followSeller: (sellerId) => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Utils.showToast('Login to follow sellers', 'warning');
            window.location.href = 'login.html';
            return;
        }
        
        let follows = JSON.parse(localStorage.getItem('followed_sellers')) || {};
        if (!follows[user.id]) follows[user.id] = [];
        
        if (follows[user.id].includes(sellerId)) {
            follows[user.id] = follows[user.id].filter(id => id !== sellerId);
            Utils.showToast('Unfollowed seller', 'info');
        } else {
            follows[user.id].push(sellerId);
            Utils.showToast('Following seller! Get updates on new products', 'success');
        }
        
        localStorage.setItem('followed_sellers', JSON.stringify(follows));
    },
    
    // Get User Profile
    getUserProfile: (userId) => {
        const users = StorageService.getUsers();
        return users.find(u => u.id === userId);
    },
    
    // Public Profile Page
    showPublicProfile: (userId) => {
        window.location.href = `profile.html?user=${userId}`;
    }
};