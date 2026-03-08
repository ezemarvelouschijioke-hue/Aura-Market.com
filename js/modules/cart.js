// Cart Module
const CartService = {

    getCart() {
        const cart = StorageService.getCart();
        return cart.map(item => {
            const product = ProductService.getById(item.id);
            return {
                ...item,
                ...product,
                subtotal: product.price * (item.quantity || 1)
            };
        });
    },

    addItem(productId, quantity = 1) {
        if (!ProductService.checkAvailability(productId, quantity)) {
            Utils.showToast('Sorry, this item is out of stock!', 'error');
            return false;
        }

        let cart = StorageService.getCart();
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + quantity;
        } else {
            cart.push({ id: productId, quantity });
        }

        StorageService.saveCart(cart);
        ProductService.updateStock(productId, quantity);

        Utils.showToast('Item added to cart!', 'success');
        this.updateCartUI();   
        return true;
    },

    removeItem(productId) {
        let cart = StorageService.getCart();
        cart = cart.filter(item => item.id !== productId);
        StorageService.saveCart(cart);
        this.updateCartUI();
    },

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }

        let cart = StorageService.getCart();
        const item = cart.find(i => i.id === productId);

        if (item) {
            item.quantity = newQuantity;
            StorageService.saveCart(cart);
            this.updateCartUI();
        }
    },

    getTotal() {
        const cart = StorageService.getCart();
        return cart.reduce((sum, item) => {
            const product = ProductService.getById(item.id);
            return sum + (product ? product.price * (item.quantity || 1) : 0);
        }, 0);
    },

    getItemCount() {
        const cart = StorageService.getCart();
        return cart.reduce((count, item) => count + (item.quantity || 1), 0);
    },

    clearCart() {
        StorageService.saveCart([]);
        this.updateCartUI();
    },

    updateCartUI() {
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = this.getItemCount();
        }

        if (typeof renderCart === 'function') {
            renderCart();
        }
    }
};
