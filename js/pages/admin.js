let productModal = null;

document.addEventListener('DOMContentLoaded', async () => {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    
    const hasAccess = await checkAdminAccess();
    if (hasAccess) {
        initializeAdminPage();
        setupTabs();
        loadDashboardData();
        setupEventListeners();    }
});

async function checkAdminAccess() {
    if (sessionStorage.getItem('admin_authenticated') === 'true' && AuthService.isAuthenticated()) {
        return true;
    }
    
    if (!AuthService.isAuthenticated()) {
        await Swal.fire({
            title: 'Admin Access Required',
            text: 'Please login with an admin account first',
            icon: 'info',
            confirmButtonText: 'Go to Login',
            showCancelButton: true,
            cancelButtonText: 'Back to Store'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'login.html?redirect=admin.html';
            } else {
                window.location.href = 'index.html';
            }
        });
        return false;
    }
    
    if (!AuthService.isAdmin()) {
        await Swal.fire({
            title: 'Access Denied',
            text: 'You do not have admin privileges',
            icon: 'error',
            confirmButtonText: 'Go Back'
        });
        window.location.href = 'index.html';
        return false;
    }
    
    sessionStorage.setItem('admin_authenticated', 'true');
    return true;
}

function initializeAdminPage() {
    document.getElementById('admin-name').textContent = AuthService.getCurrentUser()?.name || 'Admin';
    loadUsers();
    loadProducts();
    loadOrders();
    loadStats();
    loadLoginHistory();
    loadCategories();
    loadDiscounts();
}

function setupTabs() {
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            document.querySelectorAll('[data-tab]').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(`${tabName}-tab`).style.display = 'block';
            
            if (tabName === 'reports') {
                loadReports();
            } else if (tabName === 'discounts') {
                loadDiscounts();
            }
        });
    });
}

function setupEventListeners() {
    document.getElementById('search-users')?.addEventListener('input', Utils.debounce(filterUsers, 300));
    document.getElementById('search-products')?.addEventListener('input', Utils.debounce(filterProducts, 300));
    
    document.getElementById('export-users')?.addEventListener('click', () => exportData('users'));
    document.getElementById('export-products')?.addEventListener('click', () => exportData('products'));
    document.getElementById('export-orders')?.addEventListener('click', () => exportData('orders'));
}

function loadDashboardData() {
    loadStats();
    loadUsers();
    loadProducts();
    loadOrders();
    loadLoginHistory();
}

function loadStats() {
    const users = StorageService.getUsers();
    const productsList = getProductsFromStorage();
    const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    const discounts = JSON.parse(localStorage.getItem('AURA_DISCOUNTS')) || [];
    
    const totalUsers = users.length;
    const totalProducts = productsList.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscounts = discounts.length;
    
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = Utils.formatPrice(totalRevenue);
    document.getElementById('avg-order-value').textContent = Utils.formatPrice(avgOrderValue);
    document.getElementById('total-discounts').textContent = totalDiscounts;
    
    const newUsersToday = users.filter(u => {
        const created = new Date(u.createdAt || 0);
        const today = new Date();
        return created.toDateString() === today.toDateString();
    }).length;
    document.getElementById('new-users-today').textContent = newUsersToday;
    
    const lowStock = productsList.filter(p => p.stock > 0 && p.stock <= 5).length;
    document.getElementById('low-stock-count').textContent = lowStock;
}

// Helper function to get products from localStorage
function getProductsFromStorage() {
    const stored = localStorage.getItem('AURA_PRODUCTS');
    if (stored) {
        return JSON.parse(stored);
    }
    // Fallback to global products
    return window.products || [];
}

// Helper function to save products to localStorage
function saveProductsToStorage(products) {
    localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
    // Update global products
    window.products = products;
    // Update ProductService if it exists
    if (typeof ProductService !== 'undefined' && ProductService.refresh) {
        ProductService.refresh();
    }
}

function loadUsers() {
    const users = StorageService.getUsers();
    const display = document.getElementById('user-display');
    
    if (!display) return;
    
    if (users.length === 0) {
        display.innerHTML = '<tr><td colspan="8" class="text-center">No users found</td></tr>';
        return;
    }
    
    display.innerHTML = users.map((user, index) => {
        const isCurrentUser = AuthService.getCurrentUser()?.email === user.email;
        const orderCount = user.orders?.length || 0;
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never';
        const wishlistCount = user.wishlist?.length || 0;
        
        return `
        <tr>
            <td>#${index + 1}</td>
            <td>
                <strong>${user.name || 'N/A'}</strong>
                ${user.isAdmin ? '<span class="badge bg-warning ms-1">Admin</span>' : ''}
                ${isCurrentUser ? '<span class="badge bg-info ms-1">You</span>' : ''}
            </td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
            <td>${orderCount}</td>
            <td>${wishlistCount}</td>
            <td><small>${lastLogin}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    ${!isCurrentUser ? `
                        <button class="btn btn-${user.isAdmin ? 'warning' : 'outline-warning'}" 
                                onclick="toggleAdminStatus('${user.email}')"
                                title="${user.isAdmin ? 'Remove Admin' : 'Make Admin'}">
                            <i class="fa fa-${user.isAdmin ? 'user-minus' : 'user-plus'}"></i>
                        </button>
                        <button class="btn btn-danger" 
                                onclick="deleteUser('${user.email}')"
                                title="Delete User">
                            <i class="fa fa-trash"></i>
                        </button>
                    ` : `
                        <button class="btn btn-outline-secondary" disabled>
                            <i class="fa fa-lock"></i>
                        </button>
                    `}
                </div>
            </td>
        </tr>
    `}).join('');
}

function loadProducts() {
    const productsList = getProductsFromStorage();
    const display = document.getElementById('product-display');
    
    if (!display) return;
    
    if (productsList.length === 0) {
        display.innerHTML = '<tr><td colspan="9" class="text-center">No products found</td></tr>';
        return;
    }
    
    display.innerHTML = productsList.map(product => {
        const stockClass = product.stock <= 0 ? 'danger' : (product.stock <= 5 ? 'warning' : 'success');
        const stockText = product.stock <= 0 ? 'Out of Stock' : (product.stock <= 5 ? `Low (${product.stock})` : `In Stock (${product.stock})`);
        
        return `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.img}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" 
                     onerror="this.src='assets/images/placeholder.jpg'">
            </td>
            <td>
                <strong>${product.name}</strong>
                ${product.featured ? '<span class="badge bg-warning ms-1">Featured</span>' : ''}
            </td>
            <td>${Utils.formatPrice(product.price)}</td>
            <td>
                <span class="badge bg-${stockClass}">${stockText}</span>
            </td>
            <td>${product.category}</td>
            <td>
                <div class="rating">
                    ${getStarRating(product.rating || 0)}
                    <small>(${product.reviews || 0})</small>
                </div>
            </td>
            <td>${product.sold || 0}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-warning" onclick="editProduct(${product.id})">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    const display = document.getElementById('order-display');
    
    if (!display) return;
    
    if (orders.length === 0) {
        display.innerHTML = '<tr><td colspan="8" class="text-center">No orders yet</td></tr>';
        return;
    }
    
    display.innerHTML = orders.map((order, index) => {
        const statusClass = {
            'pending': 'warning',
            'processing': 'info',
            'shipped': 'primary',
            'delivered': 'success',
            'cancelled': 'danger'
        }[order.status] || 'secondary';
        
        const paymentMethod = order.paymentMethod || 'Paystack';
        const itemsCount = order.items?.length || 0;
        
        return `
        <tr>
            <td>#${order.id || index + 1}</td>
            <td>${order.customerName || 'N/A'}<br><small>${order.customerEmail || ''}</small></td>
            <td>${Utils.formatPrice(order.amount || 0)}</td>
            <td>${itemsCount} items</td>
            <td>${paymentMethod}</td>
            <td>
                <span class="badge bg-${statusClass}">${order.status || 'pending'}</span>
            </td>
            <td>${new Date(order.date || Date.now()).toLocaleString()}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-info" onclick="viewOrder('${order.id}')">
                        <i class="fa fa-eye"></i>
                    </button>
                    <select class="form-select form-select-sm" style="width: auto;" 
                            onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </td>
        </tr>
    `}).join('');
}

function loadLoginHistory() {
    const history = AuthService.getLoginHistory();
    const display = document.getElementById('login-history');
    
    if (!display) return;
    
    if (history.length === 0) {
        display.innerHTML = '<tr><td colspan="3" class="text-center">No login history</td></tr>';
        return;
    }
    
    display.innerHTML = history.slice(0, 20).map(entry => `
        <tr>
            <td>${entry.name}</td>
            <td>${entry.email}</td>
            <td>${new Date(entry.lastLogin).toLocaleString()}</td>
        </tr>
    `).join('');
}

function loadCategories() {
    const categories = ProductService.getCategories();
    const display = document.getElementById('categories-display');
    
    if (!display) return;
    
    if (categories.length === 0) {
        display.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
        return;
    }
    
    display.innerHTML = categories.map((cat, index) => {
        const productCount = ProductService.getByCategory(cat).length;
        const lowStock = ProductService.getByCategory(cat).filter(p => p.stock <= 5).length;
        
        return `
        <tr>
            <td>#${index + 1}</td>
            <td>${cat}</td>
            <td>${productCount} products</td>
            <td>${lowStock} low stock</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat}')">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
    `}).join('');
}

function loadDiscounts() {
    const discounts = JSON.parse(localStorage.getItem('AURA_DISCOUNTS')) || [];
    const display = document.getElementById('discounts-display');
    
    if (!display) return;
    
    if (discounts.length === 0) {
        display.innerHTML = '<tr><td colspan="7" class="text-center">No discount codes found</td></tr>';
        return;
    }
    
    display.innerHTML = discounts.map((discount, index) => {
        const now = new Date();
        const expiry = new Date(discount.expiry);
        const isExpired = expiry < now;
        const isActive = discount.active && !isExpired;
        
        return `
        <tr>
            <td>#${index + 1}</td>
            <td><strong>${discount.code}</strong></td>
            <td>${discount.type === 'percentage' ? `${discount.value}%` : Utils.formatPrice(discount.value)}</td>
            <td>${discount.minPurchase ? Utils.formatPrice(discount.minPurchase) : 'No min'}</td>
            <td>${discount.usesLeft || 'Unlimited'}</td>
            <td>
                <span class="badge bg-${isActive ? 'success' : 'danger'}">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
                <br><small>Exp: ${expiry.toLocaleDateString()}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-warning" onclick="editDiscount('${discount.code}')">
                        <i class="fa fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteDiscount('${discount.code}')">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

function filterUsers() {
    const searchTerm = document.getElementById('search-users').value.toLowerCase();
    const rows = document.querySelectorAll('#user-display tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterProducts() {
    const searchTerm = document.getElementById('search-products').value.toLowerCase();
    const rows = document.querySelectorAll('#product-display tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function loadReports() {
    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if (!ctx) return;
    
    const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();
    
    const salesData = last30Days.map(date => {
        return orders
            .filter(o => new Date(o.date).toLocaleDateString() === date)
            .reduce((sum, o) => sum + (o.amount || 0), 0);
    });
    
    const ordersData = last30Days.map(date => {
        return orders.filter(o => new Date(o.date).toLocaleDateString() === date).length;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last30Days,
            datasets: [{
                label: 'Sales ($)',
                data: salesData,
                borderColor: '#09a5db',
                backgroundColor: 'rgba(9, 165, 219, 0.1)',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Orders',
                data: ordersData,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#fff' }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#fff' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#ffc107' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#fff', maxRotation: 45 }
                }
            }
        }
    });
}

function exportData(type) {
    let data = [];
    let filename = '';
    let headers = [];
    
    switch(type) {
        case 'users':
            data = StorageService.getUsers();
            filename = 'users_export.csv';
            headers = ['Name', 'Email', 'Created', 'Orders', 'Wishlist', 'Admin', 'Last Login'];
            break;
        case 'products':
            data = getProductsFromStorage();
            filename = 'products_export.csv';
            headers = ['ID', 'Name', 'Price', 'Stock', 'Category', 'Rating', 'Reviews', 'Sold', 'Featured'];
            break;
        case 'orders':
            data = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
            filename = 'orders_export.csv';
            headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Items', 'Status', 'Date'];
            break;
    }
    
    const csvContent = [
        headers.join(','),
        ...data.map(item => {
            if (type === 'users') {
                return `${item.name},${item.email},${item.createdAt || ''},${item.orders?.length || 0},${item.wishlist?.length || 0},${item.isAdmin || false},${item.lastLogin || ''}`;
            } else if (type === 'products') {
                return `${item.id},${item.name},${item.price},${item.stock},${item.category},${item.rating || 0},${item.reviews || 0},${item.sold || 0},${item.featured || false}`;
            } else {
                return `${item.id},${item.customerName},${item.customerEmail},${item.amount},${item.items?.length || 0},${item.status},${item.date || ''}`;
            }
        })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    Utils.showToast(`${type} exported successfully`, 'success');
}

// User management
window.deleteUser = async (email) => {
    const result = await Swal.fire({
        title: 'Delete User?',
        text: `Are you sure you want to delete ${email}? This cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
        const success = AuthService.deleteUser(email);
        if (success) {
            loadUsers();
            loadStats();
        }
    }
};

window.toggleAdminStatus = async (email) => {
    const user = StorageService.getUsers().find(u => u.email === email);
    const action = user.isAdmin ? 'remove admin from' : 'make admin';
    
    const result = await Swal.fire({
        title: `${user.isAdmin ? 'Remove' : 'Grant'} Admin Access?`,
        text: `Are you sure you want to ${action} ${email}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Yes'
    });
    
    if (result.isConfirmed) {
        const success = AuthService.toggleAdminStatus(email);
        if (success) {
            loadUsers();
            Utils.showToast(`Admin status updated`, 'success');
        }
    }
};

// Product management
window.showAddProductModal = () => {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productFeatured').checked = false;
    productModal.show();
};

window.editProduct = (id) => {
    const productsList = getProductsFromStorage();
    const product = productsList.find(p => p.id == id);
    if (!product) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productImage').value = product.img;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productFeatured').checked = product.featured || false;
    
    productModal.show();
};

window.saveProduct = () => {
    const id = document.getElementById('productId').value;
    const productData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value),
        img: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value,
        featured: document.getElementById('productFeatured')?.checked || false,
        rating: 0,
        reviews: 0,
        sold: 0
    };
    
    if (!productData.name || !productData.price || !productData.category) {
        Utils.showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Get current products from localStorage
    let productsList = getProductsFromStorage();
    
    if (id) {
        // Update existing product
        const index = productsList.findIndex(p => p.id == id);
        if (index !== -1) {
            // Preserve existing rating, reviews, and sold count
            productData.rating = productsList[index].rating || 0;
            productData.reviews = productsList[index].reviews || 0;
            productData.sold = productsList[index].sold || 0;
            productsList[index] = { ...productsList[index], ...productData };
            Utils.showToast('Product updated successfully', 'success');
        }
    } else {
        // Add new product
        productsList.push(productData);
        Utils.showToast('Product added successfully', 'success');
    }
    
    // Save to localStorage
    saveProductsToStorage(productsList);
    
    // Close modal
    productModal.hide();
    
    // Reload products in table
    loadProducts();
    loadStats();
};

window.deleteProduct = async (id) => {
    const result = await Swal.fire({
        title: 'Delete Product?',
        text: 'Are you sure you want to delete this product?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
        // Get products from localStorage
        let productsList = getProductsFromStorage();
        
        // Filter out the deleted product
        productsList = productsList.filter(p => p.id != id);
        
        // Save to localStorage
        saveProductsToStorage(productsList);
        
        // Reload display
        loadProducts();
        loadStats();
        
        Utils.showToast('Product deleted', 'success');
    }
};

// Category management
window.showAddCategoryModal = () => {
    Swal.fire({
        title: 'Add New Category',
        input: 'text',
        inputLabel: 'Category Name',
        inputPlaceholder: 'Enter category name',
        showCancelButton: true,
        confirmButtonText: 'Add',
        preConfirm: (name) => {
            if (!name) {
                Swal.showValidationMessage('Category name is required');
                return false;
            }
            return name;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            addCategory(result.value);
        }
    });
};

function addCategory(name) {
    let categories = JSON.parse(localStorage.getItem('AURA_CATEGORIES')) || [];
    
    if (categories.includes(name)) {
        Utils.showToast('Category already exists', 'error');
        return;
    }
    
    categories.push(name);
    localStorage.setItem('AURA_CATEGORIES', JSON.stringify(categories));
    loadCategories();
    Utils.showToast('Category added', 'success');
}

window.deleteCategory = async (category) => {
    const productsInCategory = ProductService.getByCategory(category).length;
    
    if (productsInCategory > 0) {
        const result = await Swal.fire({
            title: 'Category has products',
            text: `This category has ${productsInCategory} products. What would you like to do?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete Products Too',
            cancelButtonText: 'Cancel'
        });
        
        if (result.isConfirmed) {
            const productsList = getProductsFromStorage();
            const filtered = productsList.filter(p => p.category !== category);
            saveProductsToStorage(filtered);
        } else {
            return;
        }
    }
    
    let categories = JSON.parse(localStorage.getItem('AURA_CATEGORIES')) || [];
    categories = categories.filter(c => c !== category);
    localStorage.setItem('AURA_CATEGORIES', JSON.stringify(categories));
    
    loadCategories();
    loadProducts();
    Utils.showToast('Category deleted', 'success');
};

// Discount management
window.showAddDiscountModal = () => {
    Swal.fire({
        title: 'Create Discount Code',
        html: `
            <input type="text" id="discount-code" class="swal2-input" placeholder="Code (e.g., SAVE10)">
            <select id="discount-type" class="swal2-input">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
            </select>
            <input type="number" id="discount-value" class="swal2-input" placeholder="Value">
            <input type="number" id="discount-min" class="swal2-input" placeholder="Min Purchase (optional)">
            <input type="number" id="discount-uses" class="swal2-input" placeholder="Max Uses (optional)">
            <input type="date" id="discount-expiry" class="swal2-input">
        `,
        showCancelButton: true,
        confirmButtonText: 'Create',
        preConfirm: () => {
            return {
                code: document.getElementById('discount-code').value.toUpperCase(),
                type: document.getElementById('discount-type').value,
                value: parseFloat(document.getElementById('discount-value').value),
                minPurchase: parseFloat(document.getElementById('discount-min').value) || 0,
                usesLeft: parseInt(document.getElementById('discount-uses').value) || null,
                expiry: document.getElementById('discount-expiry').value,
                active: true,
                createdAt: new Date().toISOString()
            };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            saveDiscount(result.value);
        }
    });
};

function saveDiscount(discount) {
    if (!discount.code || !discount.value || !discount.expiry) {
        Utils.showToast('Please fill all required fields', 'error');
        return;
    }
    
    let discounts = JSON.parse(localStorage.getItem('AURA_DISCOUNTS')) || [];
    
    if (discounts.some(d => d.code === discount.code)) {
        Utils.showToast('Discount code already exists', 'error');
        return;
    }
    
    discounts.push(discount);
    localStorage.setItem('AURA_DISCOUNTS', JSON.stringify(discounts));
    loadDiscounts();
    Utils.showToast('Discount code created', 'success');
}

window.deleteDiscount = async (code) => {
    const result = await Swal.fire({
        title: 'Delete Discount?',
        text: `Are you sure you want to delete ${code}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Delete'
    });
    
    if (result.isConfirmed) {
        let discounts = JSON.parse(localStorage.getItem('AURA_DISCOUNTS')) || [];
        discounts = discounts.filter(d => d.code !== code);
        localStorage.setItem('AURA_DISCOUNTS', JSON.stringify(discounts));
        loadDiscounts();
        Utils.showToast('Discount deleted', 'success');
    }
};

// Order management
window.viewOrder = (orderId) => {
    const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    const order = orders.find(o => o.id == orderId);
    
    if (!order) return;
    
    let itemsHtml = '';
    order.items?.forEach(item => {
        itemsHtml += `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} x ${item.quantity || 1}</span>
                <span>${Utils.formatPrice(item.price * (item.quantity || 1))}</span>
            </div>
        `;
    });
    
    Swal.fire({
        title: `Order #${orderId}`,
        html: `
            <div class="text-start">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod || 'Paystack'}</p>
                <hr>
                <h6>Items:</h6>
                ${itemsHtml}
                <hr>
                <h5>Total: ${Utils.formatPrice(order.amount)}</h5>
            </div>
        `,
        confirmButtonText: 'Close'
    });
};

window.updateOrderStatus = (orderId, status) => {
    let orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
    const order = orders.find(o => o.id == orderId);
    
    if (order) {
        order.status = status;
        localStorage.setItem('AURA_ORDERS', JSON.stringify(orders));
        Utils.showToast(`Order status updated to ${status}`, 'success');
    }
};

// Quick actions
window.quickAction = (action) => {
    switch(action) {
        case 'clearCache':
            Swal.fire({
                title: 'Clear Cache?',
                text: 'This will clear all local data. Continue?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                confirmButtonText: 'Clear'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.clear();
                    Utils.showToast('Cache cleared', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                }
            });
            break;
        case 'backup':
            exportData('users');
            exportData('products');
            exportData('orders');
            Utils.showToast('Backup completed', 'success');
            break;
        case 'refresh':
            window.location.reload();
            break;
    }
};

window.logout = () => {
    AuthService.logout();
    window.location.href = 'index.html';
};

function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return `
        ${'<i class="fa-solid fa-star text-warning"></i>'.repeat(fullStars)}
        ${halfStar ? '<i class="fa-solid fa-star-half-alt text-warning"></i>' : ''}
        ${'<i class="fa-regular fa-star text-warning"></i>'.repeat(emptyStars)}
    `;
}