// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    AuthService.updateNavbar();
    setupEventListeners();
    initializeTheme();
    setupCartControls();
    startSaleTimer();
    loadDealOfTheDay();
});

function initializeHomePage() {
    // Refresh products from localStorage first
    if (typeof ProductService !== 'undefined' && ProductService.refresh) {
        ProductService.refresh();
    }
    displayProducts();
    if (typeof CartService !== 'undefined') {
        CartService.updateCartUI();
        renderCart();
    }
    initializeWishlistIcons();
}

function setupEventListeners() {
    // Search with debounce
    const searchInput = document.getElementById('search-bar');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            handleSearch(e.target.value);
        });
    }
}

function setupCartControls() {
    const sidebar = document.getElementById("sidebar-cart");
    const overlay = document.getElementById("overlay");
    const openBtn = document.getElementById("open-cart-btn");
    const closeBtn = document.getElementById("close-cart-btn");

    if (!sidebar || !overlay || !openBtn || !closeBtn) {
        console.warn("Cart elements not found.");
        return;
    }

    openBtn.addEventListener("click", () => {
        sidebar.classList.add("open");
        overlay.classList.add("active");
        renderCart();
    });
    
    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
    
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
}

function displayProducts(productList = null) {
    const grid = document.querySelector('.product-grid');
    if (!grid) {
        console.error('Product grid not found!');
        return;
    }
    
    // If no product list provided, get from ProductService
    if (!productList) {
        if (typeof ProductService !== 'undefined') {
            productList = ProductService.getAll();
        } else {
            productList = window.products || [];
        }
    }
    
    console.log('Displaying products:', productList.length);
    
    if (!productList || productList.length === 0) {
        grid.innerHTML = '<p class="text-center text-white">No products found</p>';
        return;
    }
    
    grid.innerHTML = productList.map(product => {
        const stockClass = product.stock <= 0 ? 'out-of-stock' : (product.stock <= 5 ? 'low-stock' : 'in-stock');
        const stockText = product.stock <= 0 ? 'Out of Stock' : (product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock');
        
        const rating = product.rating || 0;
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        const starsHtml = `
            ${'<i class="fa-solid fa-star text-warning"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fa-solid fa-star-half-alt text-warning"></i>' : ''}
            ${'<i class="fa-regular fa-star text-warning"></i>'.repeat(emptyStars)}
        `;
        
        const isInWishlist = WishlistService && WishlistService.isInWishlist ? 
                            WishlistService.isInWishlist(product.id) : false;
        
        // Create a clean product name for the fallback image
        const cleanName = encodeURIComponent(product.name);
        
        return `
        <div class="product-card" onclick="goToProductDetails(${product.id})" style="cursor: pointer;">
            <div class="wishlist-icon ${isInWishlist ? 'active' : ''}" 
                 onclick="event.stopPropagation(); toggleWishlist(${product.id})">
                <i class="fa-${isInWishlist ? 'solid' : 'regular'} fa-heart"></i>
            </div>
            
            <div class="stock-badge ${stockClass}">
                ${stockText}
            </div>
            
            <!-- FIXED IMAGE TAG WITH PROPER FALLBACK -->
            <img src="${product.img}" 
                 alt="${product.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/300x300/09a5db/ffffff?text=' + encodeURIComponent('${product.name}')"
                 style="width: 100%; height: 250px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
            
            <h3>${product.name}</h3>
            
            <div class="rating">
                ${starsHtml}
                <span>(${product.reviews || 0} reviews)</span>
            </div>
            
            <p class="price">$${product.price.toFixed(2)}</p>
            
            <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
                ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </div>
    `}).join('');
}

// SEARCH FUNCTION
function handleSearch(searchTerm) {
    console.log('Searching for:', searchTerm);
    
    let productsList = [];
    if (typeof ProductService !== 'undefined') {
        productsList = ProductService.getAll();
    } else {
        productsList = window.products || [];
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
        displayProducts(productsList);
        return;
    }
    
    const filtered = productsList.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    console.log('Found:', filtered.length, 'products');
    displayProducts(filtered);
    
    // Update category buttons
    document.querySelectorAll('.category-filters .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === 'All Products') btn.classList.add('active');
    });
}

function filterByCategory(category) {
    let productsList = [];
    if (typeof ProductService !== 'undefined') {
        productsList = ProductService.getAll();
    } else {
        productsList = window.products || [];
    }
    
    let filtered = [];
    if (category === 'all') {
        filtered = productsList;
    } else {
        filtered = productsList.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    displayProducts(filtered);
    
    document.querySelectorAll('.category-filters .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category.toLowerCase() || 
            (category === 'all' && btn.textContent === 'All Products')) {
            btn.classList.add('active');
        }
    });
}

// Cart functions
function openCart() {
    document.getElementById('sidebar-cart')?.classList.add('open');
    document.getElementById('overlay')?.classList.add('active');
    renderCart();
}

function closeCart() {
    document.getElementById('sidebar-cart')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('active');
}

function renderCart() {
    const list = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.total-price');
    if (!list || !totalEl) return;
    
    const cart = CartService ? CartService.getCart() : [];
    
    if (cart.length === 0) {
        list.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        totalEl.textContent = '0.00';
        return;
    }
    
    list.innerHTML = cart.map(item => {
        // Get fresh product data to ensure stock is current
        let product = item;
        if (typeof ProductService !== 'undefined') {
            const freshProduct = ProductService.getById(item.id);
            if (freshProduct) {
                product = { ...item, ...freshProduct };
            }
        }
        
        return `
        <div class="cart-item-row">
            <!-- FIXED CART IMAGE WITH FALLBACK -->
            <img src="${product.img}" 
                 alt="${product.name}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/60x60/09a5db/ffffff?text=' + encodeURIComponent('${product.name}')"
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="cart-item-details">
                <h6 class="mb-1">${product.name}</h6>
                <small class="text-muted">$${product.price?.toFixed(2)}</small>
                <div class="quantity-control">
                    <button onclick="updateQuantity(${product.id}, ${(item.quantity || 1) - 1})" 
                            ${(item.quantity || 1) <= 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity || 1}</span>
                    <button onclick="updateQuantity(${product.id}, ${(item.quantity || 1) + 1})"
                            ${product.stock <= (item.quantity || 1) ? 'disabled' : ''}>+</button>
                </div>
            </div>
            <button onclick="removeFromCart(${product.id})" class="btn text-danger btn-sm">
                <i class="fa fa-trash"></i>
            </button>
        </div>
    `}).join('');
    
    const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    totalEl.textContent = total.toFixed(2);
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    if (countEl && CartService) {
        countEl.textContent = CartService.getItemCount();
    }
}

// Theme functions
function initializeTheme() {
    const savedTheme = StorageService?.getTheme() || 'dark';
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon i');
    const loginBtn = document.querySelector('a[href="login.html"]');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.checked = true;
        if (themeIcon) themeIcon.className = 'fa fa-moon';
        if (loginBtn) {
            loginBtn.classList.remove('btn-outline-light');
            loginBtn.classList.add('btn-outline-dark');
        }
    } else {
        if (themeIcon) themeIcon.className = 'fa fa-sun';
        if (loginBtn) {
            loginBtn.classList.remove('btn-outline-dark');
            loginBtn.classList.add('btn-outline-light');
        }
    }
}

function toggleTheme(e) {
    const themeIcon = document.querySelector('.theme-icon i');
    const loginBtn = document.querySelector('a[href="login.html"]');
    
    if (e.target.checked) {
        document.body.classList.add('light-theme');
        StorageService?.setTheme('light');
        if (themeIcon) themeIcon.className = 'fa fa-moon';
        if (loginBtn) {
            loginBtn.classList.remove('btn-outline-light');
            loginBtn.classList.add('btn-outline-dark');
        }
    } else {
        document.body.classList.remove('light-theme');
        StorageService?.setTheme('dark');
        if (themeIcon) themeIcon.className = 'fa fa-sun';
        if (loginBtn) {
            loginBtn.classList.remove('btn-outline-dark');
            loginBtn.classList.add('btn-outline-light');
        }
    }
}

function initializeWishlistIcons() {
    // Handled by displayProducts
}

// ========== ALL GLOBAL FUNCTIONS ==========
window.filterByCategory = filterByCategory;

window.addToCart = function(id) {
    if (CartService) {
        CartService.addItem(id);
        openCart();
    }
};

window.toggleWishlist = function(id) {
    if (WishlistService) {
        WishlistService.toggleItem(id);
        // Refresh products to show updated wishlist icons
        if (typeof ProductService !== 'undefined') {
            displayProducts(ProductService.getAll());
        } else {
            displayProducts();
        }
    }
};

window.removeFromCart = function(id) {
    if (CartService) {
        CartService.removeItem(id);
        renderCart();
        updateCartUI();
    }
};

// updateQuantity FUNCTION
window.updateQuantity = function(id, qty) {
    if (CartService) {
        CartService.updateQuantity(id, qty);
        renderCart();
        updateCartUI();
    }
};

// Function to go to product details page
window.goToProductDetails = function(id) {
    window.location.href = `product-details.html?id=${id}`;
};

// Theme toggle
document.getElementById('themeToggle')?.addEventListener('change', toggleTheme);

// ===== FLASH SALE FUNCTIONS =====
let saleEndTime = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours from now

function startSaleTimer() {
    const timer = setInterval(function() {
        const now = new Date().getTime();
        const distance = saleEndTime - now;
        
        const hours = Math.floor((distance % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((distance % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((distance % (60 * 1000)) / 1000);
        
        const timerElement = document.getElementById('sale-timer');
        if (timerElement) {
            timerElement.innerHTML = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (distance < 0) {
            clearInterval(timer);
            if (timerElement) {
                timerElement.innerHTML = "SALE ENDED";
            }
        }
    }, 1000);
}

function loadDealOfTheDay() {
    const grid = document.getElementById('deal-of-day-grid');
    if (!grid) return;
    
    // Get products on sale - safely check for salePrice
    const allProducts = ProductService.getAll();
    const saleProducts = allProducts.filter(p => p.isOnSale === true).slice(0, 4);
    
    if (saleProducts.length === 0) {
        grid.innerHTML = '<p class="text-center">No deals available</p>';
        return;
    }
    
    grid.innerHTML = saleProducts.map(product => {
        // Safely calculate discount percentage
        const discount = product.salePrice ? Math.round((1 - product.salePrice/product.price) * 100) : 0;
        const salePrice = product.salePrice || product.price;
        const soldCount = product.soldCount || 0;
        const stock = product.stock || 0;
        const progressWidth = (soldCount + stock) > 0 ? (soldCount / (soldCount + stock) * 100) : 0;
        
        const cleanName = encodeURIComponent(product.name);
        
        return `
        <div class="col-md-3 col-sm-6 mb-4">
            <div class="product-card" onclick="goToProductDetails(${product.id})" style="position: relative; cursor: pointer;">
                ${discount > 0 ? `
                <div style="position: absolute; top: 10px; left: 10px; background: #ff4757; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; z-index: 10;">
                    -${discount}%
                </div>` : ''}
                
                <!-- FIXED DEAL IMAGE WITH FALLBACK -->
                <img src="${product.img}" 
                     style="width:100%; height:200px; object-fit:cover; border-radius: 10px;"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200/ff4757/ffffff?text=' + encodeURIComponent('${product.name}')">
                
                <h6 class="mt-2">${product.name}</h6>
                <div>
                    <span style="color: #ff4757; font-weight: bold; font-size: 18px;">$${salePrice.toFixed(2)}</span>
                    ${discount > 0 ? `
                    <span style="color: #B0B0B0; text-decoration: line-through; margin-left: 10px;">$${product.price.toFixed(2)}</span>
                    ` : ''}
                </div>
                <div class="progress mt-2" style="height: 5px;">
                    <div class="progress-bar bg-warning" style="width: ${progressWidth}%"></div>
                </div>
                <small>${soldCount} sold • ${stock} left</small>
            </div>
        </div>
    `}).join('');
}