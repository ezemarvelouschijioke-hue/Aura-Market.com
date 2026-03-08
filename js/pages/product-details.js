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

function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${review.userName || 'Anonymous'}</span>
                <span class="review-date">${review.date || new Date().toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
            <div class="review-content">${review.comment}</div>
            ${review.photos ? `
                <div class="review-photos">
                    ${review.photos.map(photo => `
                        <img src="${photo}" class="review-photo" onclick="openImage('${photo}')">
                    `).join('')}
                </div>
            ` : ''}
            <div class="review-helpful">
                <span>Was this helpful?</span>
                <button class="helpful-btn ${review.helpfulBy?.includes(getUserId()) ? 'active' : ''}" 
                        onclick="markHelpful(${review.id})">
                    <i class="fas fa-thumbs-up"></i> ${review.helpful || 0}
                </button>
                <button class="helpful-btn ${review.unhelpfulBy?.includes(getUserId()) ? 'active' : ''}" 
                        onclick="markUnhelpful(${review.id})">
                    <i class="fas fa-thumbs-down"></i> ${review.unhelpful || 0}
                </button>
            </div>
        </div>
    `).join('');
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