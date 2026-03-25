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


// ===== ADDRESS & SHIPPING =====
function getShippingCost(location, subtotal) {
    if (subtotal > 50) return 0; // Free shipping over $50
    
    switch(location) {
        case 'lagos': return 1000;
        case 'abuja': return 1500;
        case 'port-harcourt': return 2000;
        default: return 2500;
    }
}

function formatShippingCost(cost) {
    return `₦${cost.toLocaleString()} ($${(cost / 750).toFixed(2)})`;
}

// ===== EMAIL FUNCTIONS =====
function sendOrderEmail(order) {
    // This would connect to an email API like SendGrid or Brevo (free tier available)
    // For now, we store in localStorage for demo
    localStorage.setItem('last_order', JSON.stringify(order));
}

// ===== PRODUCT VARIATIONS =====
let selectedColor = null;
let selectedSize = null;
let currentVariantStock = 0;

function loadVariations(product) {
    if (!product.variations) return;
    
    const colorContainer = document.getElementById('color-options');
    const sizeContainer = document.getElementById('size-options');
    
    if (colorContainer && product.variations.colors) {
        colorContainer.innerHTML = product.variations.colors.map(color => `
            <button class="btn btn-outline-light variation-btn" data-type="color" data-value="${color}" onclick="selectVariation('color', '${color}')">
                ${color}
            </button>
        `).join('');
    }
    
    if (sizeContainer && product.variations.sizes) {
        sizeContainer.innerHTML = product.variations.sizes.map(size => `
            <button class="btn btn-outline-light variation-btn" data-type="size" data-value="${size}" onclick="selectVariation('size', '${size}')">
                ${size}
            </button>
        `).join('');
    }
}

function selectVariation(type, value) {
    // Update UI
    document.querySelectorAll(`.variation-btn[data-type="${type}"]`).forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline-light');
    });
    
    const selectedBtn = document.querySelector(`.variation-btn[data-type="${type}"][data-value="${value}"]`);
    selectedBtn.classList.remove('btn-outline-light');
    selectedBtn.classList.add('active', 'btn-primary');
    
    if (type === 'color') selectedColor = value;
    if (type === 'size') selectedSize = value;
    
    updateVariantStock();
}

function updateVariantStock() {
    if (!currentProduct?.variations || !selectedColor || !selectedSize) return;
    
    const variantKey = `${selectedColor}-${selectedSize}`;
    const stock = currentProduct.variations.stock?.[variantKey] || 0;
    currentVariantStock = stock;
    
    const stockEl = document.getElementById('selected-variant-stock');
    const addBtn = document.getElementById('add-to-cart-btn');
    
    if (stock > 0) {
        stockEl.innerHTML = `<span class="text-success">✓ In Stock (${stock} available)</span>`;
        stockEl.style.color = '#28a745';
        addBtn.disabled = false;
        addBtn.style.opacity = '1';
    } else {
        stockEl.innerHTML = `<span class="text-danger">✗ Out of Stock</span>`;
        stockEl.style.color = '#dc3545';
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
    }
}

// Update addToCart function to use variation
function addToCartFromDetails() {
    if (!currentProduct) return;
    
    // If product has variations, check selection
    if (currentProduct.variations) {
        if (!selectedColor || !selectedSize) {
            Utils.showToast('Please select color and size', 'warning');
            return;
        }
        
        if (currentVariantStock <= 0) {
            Utils.showToast('Selected variant out of stock', 'error');
            return;
        }
    }
    
    const quantity = currentQuantity;
    const variant = selectedColor && selectedSize ? `${selectedColor}-${selectedSize}` : null;
    
    CartService.addItem(currentProduct.id, quantity, variant);
    Utils.showToast(`${currentProduct.name} added to cart!`, 'success');
    openCart();
}