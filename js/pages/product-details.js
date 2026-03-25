// ===== REVIEWS SYSTEM =====
let currentProductId = null;
let currentRating = 0;
let allReviews = [];
let displayedReviews = 0;
const reviewsPerPage = 5;

function loadReviews(productId) {
    currentProductId = productId;
    allReviews = JSON.parse(localStorage.getItem(`REVIEWS_${productId}`)) || [];
    
    // Update review counts and averages
    updateReviewSummary();
    
    // Display first batch
    displayedReviews = reviewsPerPage;
    displayReviews(allReviews.slice(0, displayedReviews));
    
    // Show/hide load more button
    document.getElementById('load-more-reviews').style.display = 
        allReviews.length > displayedReviews ? 'block' : 'none';
}

function updateReviewSummary() {
    if (allReviews.length === 0) {
        document.getElementById('average-rating').textContent = '0.0';
        document.getElementById('star-display').innerHTML = '☆☆☆☆☆';
        document.getElementById('total-reviews').textContent = '0 reviews';
        return;
    }
    
    // Calculate average
    const sum = allReviews.reduce((total, r) => total + r.rating, 0);
    const avg = (sum / allReviews.length).toFixed(1);
    document.getElementById('average-rating').textContent = avg;
    
    // Show stars
    const fullStars = Math.floor(avg);
    const halfStar = avg % 1 >= 0.5;
    let stars = '';
    for(let i=0; i<fullStars; i++) stars += '★';
    if(halfStar) stars += '½';
    for(let i=0; i<5-fullStars-(halfStar?1:0); i++) stars += '☆';
    document.getElementById('star-display').innerHTML = stars;
    
    document.getElementById('total-reviews').textContent = `${allReviews.length} reviews`;
    
    // Update rating bars
    for(let i=1; i<=5; i++) {
        const count = allReviews.filter(r => r.rating === i).length;
        const percentage = (count / allReviews.length * 100) || 0;
        document.getElementById(`rating-${i}-bar`).style.width = `${percentage}%`;
        document.getElementById(`rating-${i}-count`).textContent = count;
    }
}

// In displayReviews function, add "Verified Purchase" badge
function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const isVerified = checkIfUserPurchased(review.userId, currentProductId);
        
        return `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">
                    ${review.userName || 'Anonymous'}
                    ${isVerified ? '<span class="badge bg-success ms-2"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
                </span>
                <span class="review-date">${review.date || new Date().toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
            <div class="review-content">${review.comment}</div>
            
            <!-- Helpful buttons -->
            <div class="review-helpful mt-3">
                <button class="btn btn-sm btn-outline-light me-2" onclick="markHelpful(${review.id})">
                    <i class="far fa-thumbs-up"></i> Helpful (${review.helpful || 0})
                </button>
                <button class="btn btn-sm btn-outline-light" onclick="markNotHelpful(${review.id})">
                    <i class="far fa-thumbs-down"></i> (${review.notHelpful || 0})
                </button>
            </div>
        </div>
    `}).join('');
}

function checkIfUserPurchased(userId, productId) {
    if (!userId || userId === 'guest') return false;
    
    const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    return orders.some(order => 
        order.userId === userId && 
        order.items?.some(item => item.id === productId)
    );
}

function setRating(rating) {
    currentRating = rating;
    document.querySelectorAll('.rating-input .star').forEach((star, i) => {
        star.innerHTML = i < rating ? '★' : '☆';
    });
}

function toggleReviewForm() {
    const form = document.getElementById('review-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function submitReview() {
    const comment = document.getElementById('review-text').value;
    const title = document.getElementById('review-title').value;
    const photos = document.getElementById('review-photos').files;
    
    if (currentRating === 0) {
        alert('Please select a rating');
        return;
    }
    
    if (!comment) {
        alert('Please write a review');
        return;
    }
    
    // Handle photo uploads (simplified - in production you'd upload to server)
    let photoUrls = [];
    if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
            photoUrls.push(URL.createObjectURL(photos[i]));
        }
    }
    
    const user = AuthService.getCurrentUser() || { name: 'Anonymous', id: 'guest' };
    
    const newReview = {
        id: Date.now(),
        userId: user.id || 'guest',
        userName: user.name,
        rating: currentRating,
        title: title,
        comment: comment,
        photos: photoUrls,
        date: new Date().toLocaleDateString(),
        helpful: 0,
        unhelpful: 0,
        helpfulBy: [],
        unhelpfulBy: []
    };
    
    allReviews.unshift(newReview);
    localStorage.setItem(`REVIEWS_${currentProductId}`, JSON.stringify(allReviews));
    
    // Reset form
    document.getElementById('review-text').value = '';
    document.getElementById('review-title').value = '';
    document.getElementById('review-photos').value = '';
    currentRating = 0;
    document.querySelectorAll('.rating-input .star').forEach(s => s.innerHTML = '☆');
    
    // Refresh display
    updateReviewSummary();
    displayedReviews = reviewsPerPage;
    displayReviews(allReviews.slice(0, displayedReviews));
    toggleReviewForm();
}

function filterByRating(rating) {
    const filtered = allReviews.filter(r => r.rating === rating);
    displayReviews(filtered);
}

function filterReviews() {
    const filter = document.getElementById('review-filter').value;
    if (filter === 'all') {
        displayReviews(allReviews.slice(0, displayedReviews));
    } else {
        const filtered = allReviews.filter(r => r.rating === parseInt(filter));
        displayReviews(filtered);
    }
}

function sortReviews() {
    const sort = document.getElementById('review-sort').value;
    let sorted = [...allReviews];
    
    switch(sort) {
        case 'newest':
            sorted.sort((a,b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            sorted.sort((a,b) => new Date(a.date) - new Date(b.date));
            break;
        case 'highest':
            sorted.sort((a,b) => b.rating - a.rating);
            break;
        case 'lowest':
            sorted.sort((a,b) => a.rating - b.rating);
            break;
    }
    
    displayReviews(sorted.slice(0, displayedReviews));
}

function loadMoreReviews() {
    displayedReviews += reviewsPerPage;
    displayReviews(allReviews.slice(0, displayedReviews));
    if (displayedReviews >= allReviews.length) {
        document.getElementById('load-more-reviews').style.display = 'none';
    }
}

function markHelpful(reviewId) {
    const userId = getUserId();
    const review = allReviews.find(r => r.id === reviewId);
    
    if (!review.helpfulBy) review.helpfulBy = [];
    if (!review.unhelpfulBy) review.unhelpfulBy = [];
    
    if (review.helpfulBy.includes(userId)) {
        // Remove helpful
        review.helpfulBy = review.helpfulBy.filter(id => id !== userId);
        review.helpful--;
    } else {
        // Add helpful
        review.helpfulBy.push(userId);
        review.helpful++;
        
        // Remove from unhelpful if present
        if (review.unhelpfulBy.includes(userId)) {
            review.unhelpfulBy = review.unhelpfulBy.filter(id => id !== userId);
            review.unhelpful--;
        }
    }
    
    localStorage.setItem(`REVIEWS_${currentProductId}`, JSON.stringify(allReviews));
    filterReviews(); // Refresh display
}

function getUserId() {
    const user = AuthService.getCurrentUser();
    return user ? user.id : 'guest-' + Date.now();
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

function loadProductDetails(productId) {
    const product = ProductService.getById(productId);
    if (!product) { 
        window.location.href = 'index.html'; 
        return; 
    }
    currentProduct = product;
    currentProductId = productId;
    
    // Update breadcrumb
    document.getElementById('breadcrumb-category').textContent = product.category;
    document.getElementById('breadcrumb-product').textContent = product.name;
    
    // Product basic info
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-description').textContent = product.description || 'No description available.';
    document.getElementById('product-price').textContent = `$${(product.price || 0).toFixed(2)}`;
    
    // Points info
    const pointsEl = document.getElementById('meta-points');
    if (pointsEl) {
        const points = Math.round(product.price * 10);
        pointsEl.innerHTML = `<span class="text-warning">${points} points</span>`;
    }
    
    // Main image with proper fallback
    const mainImage = document.getElementById('main-product-image');
    const imageUrl = product.img || 'https://via.placeholder.com/500x500/09a5db/ffffff?text=' + encodeURIComponent(product.name);
    mainImage.src = imageUrl;
    mainImage.onerror = function() {
        this.src = 'https://via.placeholder.com/500x500/09a5db/ffffff?text=' + encodeURIComponent(product.name);
    };
    
    // Meta info
    document.getElementById('meta-category').textContent = product.category;
    
    const stockStatus = product.stock > 0 ? 
        `<span style="color: #28A745;">In Stock (${product.stock} available)</span>` : 
        '<span style="color: #DC3545;">Out of Stock</span>';
    document.getElementById('meta-stock').innerHTML = stockStatus;
    document.getElementById('meta-reviews').textContent = `${product.reviews || 0} reviews`;
    
    // Load all product data
    loadThumbnails(product);
    loadRatingStars(product.rating || 0);
    loadRelatedProducts(product.category, product.id);
    loadAllReviews(product.id);
    updateWishlistButton(product.id);
    
    // Disable add to cart if out of stock
    if (product.stock <= 0) {
        document.getElementById('add-to-cart-btn').disabled = true;
        document.getElementById('add-to-cart-btn').style.opacity = '0.5';
    }
    
    //  - Track recently viewed (AFTER product is loaded)
    if (typeof RecentlyViewedService !== 'undefined') {
        RecentlyViewedService.addProduct(productId);
    }
    
    // ✅ Update meta tags for SEO
    updateMetaTags(product);
}

function updateMetaTags(product) {
    // Update title
    document.title = `${product.name} - Aura Market`;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = `Buy ${product.name} for $${product.price}. ${product.description?.substring(0, 150)} Available now at Aura Market.`;
    
    // Update Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
    }
    ogTitle.content = `${product.name} - Aura Market`;
    
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
    }
    ogDesc.content = product.description?.substring(0, 100);
    
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
    }
    ogImage.content = product.img;
}
