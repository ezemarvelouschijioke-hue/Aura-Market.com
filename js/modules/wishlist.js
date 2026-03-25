// Wishlist Module
const WishlistService = {
    // Get wishlist with product details
    getWishlist: () => {
        const wishlist = StorageService.getWishlist();
        return wishlist.map(item => {
            const product = ProductService.getById(item.id);
            return product || item;
        }).filter(item => item); // Remove any null items
    },
    
    // Toggle item in wishlist
    toggleItem: (productId) => {
        let wishlist = StorageService.getWishlist();
        const index = wishlist.findIndex(item => item.id === productId);
        
        if (index === -1) {
            // Add to wishlist
            const product = ProductService.getById(productId);
            if (product) {
                wishlist.push({ id: productId, addedAt: new Date().toISOString() });
                StorageService.saveWishlist(wishlist);
                Utils.showToast('Added to wishlist!', 'success');
            }
        } else {
            // Remove from wishlist
            wishlist.splice(index, 1);
            StorageService.saveWishlist(wishlist);
            Utils.showToast('Removed from wishlist', 'info');
        }
        
        // Update UI if on wishlist page
        if (window.location.pathname.includes('wishlist.html')) {
            this.displayWishlist();
        }
        
        return index === -1; // Returns true if added, false if removed
    },
    
    // Check if item is in wishlist
    isInWishlist: (productId) => {
        const wishlist = StorageService.getWishlist();
        return wishlist.some(item => item.id === productId);
    },
    
    // Move item to cart
    moveToCart: (productId) => {
        const added = CartService.addItem(productId);
        if (added) {
            this.toggleItem(productId); // Remove from wishlist
        }
    },
    
    // Clear wishlist
    clearWishlist: () => {
        StorageService.saveWishlist([]);
        if (window.location.pathname.includes('wishlist.html')) {
            this.displayWishlist();
        }
    },
    
    // Display wishlist on wishlist page
    displayWishlist: () => {
        const grid = document.getElementById('wishlist-grid');
        const emptyMsg = document.getElementById('empty-msg');
        
        if (!grid) return;
        
        const wishlist = this.getWishlist();
        
        if (wishlist.length === 0) {
            grid.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }
        
        if (emptyMsg) emptyMsg.style.display = 'none';
        
        grid.innerHTML = wishlist.map(product => `
            <div class="product-card">
                <div class="wishlist-icon active" onclick="WishlistService.toggleItem(${product.id})">
                    <i class="fa-solid fa-heart"></i>
                </div>
                <img src="${product.img}" alt="${product.name}" 
                     onerror="this.src='assets/images/placeholder.jpg'">
                <h3>${product.name}</h3>
                <div class="rating">
                    ${this.getStarRating(product.rating)}
                    <span>(${product.reviews || 0})</span>
                </div>
                <p class="price">${Utils.formatPrice(product.price)}</p>
                <button onclick="WishlistService.moveToCart(${product.id})" 
                        class="btn btn-primary">
                    <i class="fa fa-shopping-cart"></i> Move to Cart
                </button>
            </div>
        `).join('');
    },
    
    // Generate star rating HTML
    getStarRating: (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return `
            ${'<i class="fa-solid fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fa-solid fa-star-half-alt"></i>' : ''}
            ${'<i class="fa-regular fa-star"></i>'.repeat(emptyStars)}
        `;
    }
};