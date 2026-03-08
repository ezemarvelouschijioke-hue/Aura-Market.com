let reviewModal;
document.addEventListener('DOMContentLoaded', () => {
    reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
});

function openReviewModal(id) {
    document.getElementById('review-product-id').value = id;
    reviewModal.show();
}

function saveReview() {
    const id = document.getElementById('review-product-id').value;
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value;
    const user = localStorage.getItem("USER_SESSION") || "Anonymous";

    if(!comment) return alert("Please leave a comment!");

    // 1. Get existing reviews for this specific product
    const storageKey = `REVIEWS_${id}`;
    let reviews = JSON.parse(localStorage.getItem(storageKey)) || [];

    // 2. Add the new review
    reviews.push({ user, rating, comment, date: new Date().toLocaleDateString() });

    // 3. Save and Close
    localStorage.setItem(storageKey, JSON.stringify(reviews));
    reviewModal.hide();
    displayProducts(); // Refresh the UI to show the new average
    alert("Thanks for your review!");
}