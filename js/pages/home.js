// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    AuthService.updateNavbar();
    setupEventListeners();
    initializeTheme();
    setupCartControls();
    startSaleTimer();
    loadDealOfTheDay();
    setupMobileMenu(); // NEW
    addMobileElements(); // NEW
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
            
       <img src="${product.img}" 
     alt="${product.name}" 
     onerror="this.src='https://via.placeholder.com/300x300/09a5db/ffffff?text=${encodeURIComponent(product.name)}'"
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
            <img src="${product.img}" 
                alt="${product.name}" 
                onerror="this.src='https://via.placeholder.com/60x60/09a5db/ffffff?text=${encodeURIComponent(product.name)}'"
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
let saleEndTime = new Date().getTime() + (0.50 * 60 * 60 * 1000); // 24 hours from now

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
                
                <img src="${product.img}" 
                    style="width:100%; height:200px; object-fit:cover; border-radius: 10px;"
                    onerror="this.src='https://via.placeholder.com/300x200/ff4757/ffffff?text=${encodeURIComponent(product.name)}'">
                
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

// ===== ADVANCED FILTER FUNCTIONS (NEW) =====
let currentFilters = {
    minPrice: 0,
    maxPrice: 1000,
    rating: 0,
    sortBy: 'default',
    stock: 'all',
    category: 'all'
};

window.applyAdvancedFilters = function() {
    // Get filter values
    currentFilters.minPrice = parseFloat(document.getElementById('min-price').value) || 0;
    currentFilters.maxPrice = parseFloat(document.getElementById('max-price').value) || 1000;
    currentFilters.rating = parseInt(document.getElementById('rating-filter').value) || 0;
    currentFilters.sortBy = document.getElementById('sort-by').value;
    currentFilters.stock = document.getElementById('stock-filter').value;
    
    // Get all products
    let productsList = ProductService.getAll();
    
    // Apply category filter (if coming from category buttons)
    if (currentFilters.category !== 'all') {
        productsList = productsList.filter(p => p.category.toLowerCase() === currentFilters.category.toLowerCase());
    }
    
    // Apply price filter
    productsList = productsList.filter(p => 
        p.price >= currentFilters.minPrice && p.price <= currentFilters.maxPrice
    );
    
    // Apply rating filter
    if (currentFilters.rating > 0) {
        productsList = productsList.filter(p => (p.rating || 0) >= currentFilters.rating);
    }
    
    // Apply stock filter
    if (currentFilters.stock === 'in-stock') {
        productsList = productsList.filter(p => p.stock > 0);
    } else if (currentFilters.stock === 'out-of-stock') {
        productsList = productsList.filter(p => p.stock <= 0);
    }
    
    // Apply sorting
    switch(currentFilters.sortBy) {
        case 'price-low':
            productsList.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            productsList.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            productsList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'name':
            productsList.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    // Display filtered products
    displayProducts(productsList);
    
    // Update filter tags
    updateFilterTags();
    
    // Show toast
    if (typeof Utils !== 'undefined') {
        Utils.showToast(`Found ${productsList.length} products`, 'info');
    }
};

window.resetAdvancedFilters = function() {
    // Reset form values
    document.getElementById('min-price').value = 0;
    document.getElementById('max-price').value = 1000;
    document.getElementById('rating-filter').value = '0';
    document.getElementById('sort-by').value = 'default';
    document.getElementById('stock-filter').value = 'all';
    
    // Reset current filters
    currentFilters = {
        minPrice: 0,
        maxPrice: 1000,
        rating: 0,
        sortBy: 'default',
        stock: 'all',
        category: 'all'
    };
    
    // Reset category buttons
    document.querySelectorAll('.category-filters .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === 'All Products') {
            btn.classList.add('active');
        }
    });
    
    // Display all products
    displayProducts(ProductService.getAll());
    
    // Clear filter tags
    document.getElementById('filter-tags').innerHTML = '';
    
    if (typeof Utils !== 'undefined') {
        Utils.showToast('Filters reset', 'info');
    }
};

function updateFilterTags() {
    const tagsContainer = document.getElementById('filter-tags');
    if (!tagsContainer) return;
    
    let tags = [];
    
    if (currentFilters.minPrice > 0 || currentFilters.maxPrice < 1000) {
        tags.push(`<span class="badge bg-primary me-2 mb-2">Price: $${currentFilters.minPrice} - $${currentFilters.maxPrice} <i class="fas fa-times ms-1" onclick="removeFilter('price')" style="cursor:pointer;"></i></span>`);
    }
    
    if (currentFilters.rating > 0) {
        tags.push(`<span class="badge bg-warning text-dark me-2 mb-2">${currentFilters.rating}★ & above <i class="fas fa-times ms-1" onclick="removeFilter('rating')" style="cursor:pointer;"></i></span>`);
    }
    
    if (currentFilters.stock !== 'all') {
        tags.push(`<span class="badge bg-info me-2 mb-2">${currentFilters.stock} <i class="fas fa-times ms-1" onclick="removeFilter('stock')" style="cursor:pointer;"></i></span>`);
    }
    
    tagsContainer.innerHTML = tags.join('');
}

window.removeFilter = function(filterType) {
    switch(filterType) {
        case 'price':
            document.getElementById('min-price').value = 0;
            document.getElementById('max-price').value = 1000;
            break;
        case 'rating':
            document.getElementById('rating-filter').value = '0';
            break;
        case 'stock':
            document.getElementById('stock-filter').value = 'all';
            break;
    }
    applyAdvancedFilters();
};

// ===== MOBILE MENU FUNCTIONS (NEW) =====
function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && !navMenu.contains(e.target) && !menuBtn?.contains(e.target)) {
            navMenu.classList.remove('show');
        }
    });
}

function addMobileElements() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;
    
    // Add mobile menu button if not exists
    if (!document.querySelector('.mobile-menu-btn')) {
        const mobileMenuBtn = document.createElement('div');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        document.querySelector('.navbar .container-fluid').appendChild(mobileMenuBtn);
    }
    
    // Add mobile search button
    if (!document.querySelector('.mobile-search-btn')) {
        const mobileSearchBtn = document.createElement('div');
        mobileSearchBtn.className = 'mobile-search-btn d-md-none';
        mobileSearchBtn.innerHTML = '<i class="fas fa-search"></i>';
        navRight.insertBefore(mobileSearchBtn, navRight.firstChild);
        
        // Add mobile search overlay
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'mobile-search-overlay';
        searchOverlay.innerHTML = '<input type="text" id="mobile-search" placeholder="Search products...">';
        document.body.appendChild(searchOverlay);
        
        // Add search functionality
        document.getElementById('mobile-search').addEventListener('input', function(e) {
            handleSearch(e.target.value);
        });
        
        // Toggle search overlay
        mobileSearchBtn.addEventListener('click', () => {
            searchOverlay.classList.toggle('show');
            setTimeout(() => {
                document.getElementById('mobile-search').focus();
            }, 100);
        });
        
        // Close overlay when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchOverlay.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
                searchOverlay.classList.remove('show');
            }
        });
    }
}


// ===== ENHANCED LIVE CHAT =====
let chatHistory = JSON.parse(localStorage.getItem('chat_history')) || [];

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'sent');
        chatHistory.push({ text: message, type: 'sent', time: new Date().toISOString() });
        localStorage.setItem('chat_history', JSON.stringify(chatHistory));
        input.value = '';
        
        // Smart auto-reply
        setTimeout(() => {
            const reply = generateSmartReply(message);
            addMessage(reply, 'received');
            chatHistory.push({ text: reply, type: 'received', time: new Date().toISOString() });
            localStorage.setItem('chat_history', JSON.stringify(chatHistory));
        }, 1000);
    }
}

function generateSmartReply(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('order') && msg.includes('where')) {
        return 'You can track your order here: <a href="order-tracking.html" style="color: #09a5db;">Track Order</a>';
    } else if (msg.includes('return') || msg.includes('refund')) {
        return 'To return an item, go to Order History and click "Return". Returns accepted within 30 days.';
    } else if (msg.includes('price') || msg.includes('cost')) {
        return 'All prices are shown on product pages. We also have daily flash sales!';
    } else if (msg.includes('shipping') || msg.includes('delivery')) {
        return 'Free shipping on orders over $50. Standard delivery: 3-5 business days.';
    } else if (msg.includes('payment') || msg.includes('pay')) {
        return 'We accept Paystack, credit/debit cards, and bank transfers. All payments are secure.';
    } else if (msg.includes('discount') || msg.includes('coupon') || msg.includes('promo')) {
        return 'Check our "Deals" section for current promotions! Use code: WELCOME10 for 10% off.';
    } else if (msg.includes('hello') || msg.includes('hi')) {
        return 'Hello! 👋 How can I help you today?';
    } else if (msg.includes('thank')) {
        return "You're welcome! 😊 Is there anything else I can help with?";
    } else {
        return 'Thanks for your message. Our team will get back to you soon. For immediate help, check our <a href="faq.html" style="color: #09a5db;">FAQ</a>.';
    }
}

function loadChatHistory() {
    const messages = document.getElementById('chatMessages');
    if (!messages) return;
    
    messages.innerHTML = '';
    chatHistory.forEach(msg => {
        addMessage(msg.text, msg.type, msg.time);
    });
}

// Call this when chat opens
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
        chatBox.classList.toggle('show');
        if (chatBox.classList.contains('show')) {
            loadChatHistory();
        }
    }
}

function loadRecentlyViewed() {
    const grid = document.getElementById('recently-viewed-grid');
    const section = document.getElementById('recently-viewed-section');
    
    if (!grid || !section) return;
    
    const recent = RecentlyViewedService.getProducts();
    
    if (recent.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    grid.innerHTML = recent.map(product => createMovieCard(product)).join('');
}

function clearRecentlyViewed() {
    RecentlyViewedService.clear();
    loadRecentlyViewed();
    Utils.showToast('Recently viewed cleared', 'info');
}

// Call in DOMContentLoaded
loadRecentlyViewed();