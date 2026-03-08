/*document.addEventListener("DOMContentLoaded", () => {
    displayWishlistItems();
});

function displayWishlistItems() {
    const wishlistGrid = document.getElementById("wishlist-grid");
    const emptyMsg = document.getElementById("empty-msg");
    
    // 1. Get the list of items from localStorage
    const wishlist = JSON.parse(localStorage.getItem("AURA_WISHLIST")) || [];

    // 2. Handle empty state
    if (wishlist.length === 0) {
        wishlistGrid.innerHTML = "";
        emptyMsg.style.display = "block";
        return;
    }

    emptyMsg.style.display = "none";
    wishlistGrid.innerHTML = "";

    // 3. Render each saved product
    wishlist.forEach(product => {
        const imageSrc = product.img ? product.img : "https://via.placeholder.com/150";
        
        wishlistGrid.innerHTML += `
            <div class="product-card">
                <div class="wishlist-icon" onclick="removeFromWishlist(${product.id})">
                    <i class="fa-solid fa-trash"></i>
                </div>
                <img src="${imageSrc}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toLocaleString()}</p>
                <button onclick="addToCartAndNotify(${product.id})">Move to Cart</button>
            </div>
        `;
    });
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem("AURA_WISHLIST")) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem("AURA_WISHLIST", JSON.stringify(wishlist));
    displayWishlistItems(); // Refresh the page UI
}

// Optional: Add to cart directly from wishlist
function addToCartAndNotify(id) {
    // This uses the logic you already have in cart.js if it's loaded, 
    // but here is a simple version:
    let cart = JSON.parse(localStorage.getItem("CART")) || [];
    const item = products.find(p => p.id === id);
    cart.push(item);
    localStorage.setItem("CART", JSON.stringify(cart));
    alert(`${item.name} added to cart!`);
}*/
document.addEventListener("DOMContentLoaded", () => {
    const wishlistGrid = document.getElementById("wishlist-grid");
    const wishlist = JSON.parse(localStorage.getItem("AURA_WISHLIST")) || [];

    console.log("Wishlist data found:", wishlist); // Check your console!

    if (wishlist.length === 0) {
        document.getElementById("empty-msg").style.display = "block";
        return;
    }

    wishlistGrid.innerHTML = ""; // Clear the grid

    wishlist.forEach(product => {
        // Use the same structure as your index.html
        wishlistGrid.innerHTML += `
            <div class="product-card">
                <img src="${product.img}" alt="${product.name}" style="width:100%">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button onclick="removeFromWishlist(${product.id})" class="btn btn-danger">Remove</button>
            </div>
        `;
    });
});

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem("AURA_WISHLIST")) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem("AURA_WISHLIST", JSON.stringify(wishlist));
    location.reload(); // Quickest way to refresh the view
}