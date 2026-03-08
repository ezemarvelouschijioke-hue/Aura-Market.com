// Make products globally available with CORRECT image paths
const defaultProducts = [
    { 
        id: 1, 
        name: "USB Drive", 
        price: 3.29, 
        category: "Electronics", 
        img: "https://via.placeholder.com/300x300/09a5db/ffffff?text=USB+Drive", 
        description: "High speed USB drive - 64GB storage capacity", 
        stock: 15, 
        rating: 4.5, 
        reviews: 23, 
        sold: 0, 
        featured: true,
        salePrice: 2.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 45
    },
    { 
        id: 2, 
        name: "White Snickers", 
        price: 7.29, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/ff6b81/ffffff?text=White+Snickers", 
        description: "Classic white sneakers - Comfortable and stylish", 
        stock: 8, 
        rating: 4.2, 
        reviews: 15, 
        sold: 0, 
        featured: true,
        salePrice: 5.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 32
    },
    { 
        id: 3, 
        name: "Vintage Shirt", 
        price: 50, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/ffd700/000000?text=Vintage+Shirt", 
        description: "Retro style vintage shirt - 100% cotton", 
        stock: 5, 
        rating: 4.8, 
        reviews: 32, 
        sold: 0, 
        featured: true,
        salePrice: 39.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 18
    },
    { 
        id: 4, 
        name: "Vintage Shirt 2", 
        price: 15, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/9b59b6/ffffff?text=Vintage+Shirt+2", 
        description: "Classic vintage style - Perfect for casual wear", 
        stock: 12, 
        rating: 4.0, 
        reviews: 8, 
        sold: 0, 
        featured: false,
        salePrice: 12.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 7
    },
    { 
        id: 5, 
        name: "Dinner Outfit", 
        price: 9.05, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/e74c3c/ffffff?text=Dinner+Outfit", 
        description: "Elegant dinner outfit - Perfect for special occasions", 
        stock: 3, 
        rating: 4.6, 
        reviews: 11, 
        sold: 0, 
        featured: true,
        salePrice: 7.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 15
    },
    { 
        id: 6, 
        name: "Sneakers", 
        price: 4.59, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/1abc9c/ffffff?text=Sneakers", 
        description: "Comfortable everyday sneakers - Lightweight design", 
        stock: 20, 
        rating: 4.1, 
        reviews: 19, 
        sold: 0, 
        featured: false,
        salePrice: 3.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 42
    },
    { 
        id: 7, 
        name: "Black Sneakers", 
        price: 9.23, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/34495e/ffffff?text=Black+Sneakers", 
        description: "Stylish black sneakers - Goes with everything", 
        stock: 7, 
        rating: 4.4, 
        reviews: 14, 
        sold: 0, 
        featured: true,
        salePrice: 7.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 23
    },
    { 
        id: 8, 
        name: "White Can", 
        price: 20, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/ecf0f1/000000?text=White+Can", 
        description: "Trendy white accessory - Modern design", 
        stock: 4, 
        rating: 4.3, 
        reviews: 6, 
        sold: 0, 
        featured: false,
        salePrice: 16.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 9
    },
    { 
        id: 9, 
        name: "White Can 2", 
        price: 15.72, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/bdc3c7/000000?text=White+Can+2", 
        description: "Another stylish white accessory - Limited edition", 
        stock: 9, 
        rating: 3.9, 
        reviews: 5, 
        sold: 0, 
        featured: false,
        salePrice: 12.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 14
    },
    { 
        id: 10, 
        name: "Timberland", 
        price: 7.67, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/8B4513/ffffff?text=Timberland", 
        description: "Classic Timberland boots - Durable and stylish", 
        stock: 6, 
        rating: 4.7, 
        reviews: 27, 
        sold: 0, 
        featured: true,
        salePrice: 6.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 31
    },
    { 
        id: 11, 
        name: "Black Shoe", 
        price: 12.34, 
        category: "Fashion", 
        img: "https://via.placeholder.com/300x300/2c3e50/ffffff?text=Black+Shoe", 
        description: "Elegant black formal shoes - Perfect for office", 
        stock: 10, 
        rating: 4.2, 
        reviews: 13, 
        sold: 0, 
        featured: false,
        salePrice: 9.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 22
    },
    { 
        id: 12, 
        name: "Black Accessory", 
        price: 12, 
        category: "Accessories", 
        img: "https://via.placeholder.com/300x300/000000/ffffff?text=Black+Accessory", 
        description: "Black accessory - Premium quality", 
        stock: 10, 
        rating: 4.2, 
        reviews: 13, 
        sold: 0, 
        featured: false,
        salePrice: 9.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 18
    },
    { 
        id: 13, 
        name: "Beauty Product", 
        price: 12, 
        category: "Beauty", 
        img: "https://via.placeholder.com/300x300/ff9ff3/000000?text=Beauty+Product", 
        description: "Beauty product - Skincare essential", 
        stock: 10, 
        rating: 4.2, 
        reviews: 13, 
        sold: 0, 
        featured: false,
        salePrice: 9.99,
        saleEnds: '2024-12-31T23:59:59',
        isOnSale: true,
        soldCount: 25
    }
];

// Try to load from localStorage, otherwise use defaults
let products = [];
try {
    const stored = localStorage.getItem('AURA_PRODUCTS');
    if (stored) {
        products = JSON.parse(stored);
        console.log('✅ Loaded products from localStorage:', products.length);
    } else {
        products = [...defaultProducts];
        localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
        console.log('✅ Initialized default products');
    }
} catch (e) {
    console.error('Error loading products:', e);
    products = [...defaultProducts];
}

// Product service functions
const ProductService = {
    getAll: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products;
    },
    
    getById: (id) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.find(p => p.id === id);
    },
    
    getByCategory: (category) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        if (category === 'all' || !category) return products;
        return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    },
    
    getFeatured: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.filter(p => p.featured);
    },
    
    search: (query) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        query = query.toLowerCase().trim();
        if (!query) return products;
        
        return products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
    },
    
    filterByPrice: (min, max) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.filter(p => p.price >= min && p.price <= max);
    },
    
    getInStock: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.filter(p => p.stock > 0);
    },
    
    getLowStock: (threshold = 5) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.filter(p => p.stock > 0 && p.stock <= threshold);
    },
    
    getOutOfStock: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        return products.filter(p => p.stock === 0);
    },
    
    updateStock: (id, quantity) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        const product = products.find(p => p.id === id);
        if (product) {
            product.stock -= quantity;
            product.sold = (product.sold || 0) + quantity;
            localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
            return true;
        }
        return false;
    },
    
    checkAvailability: (id, quantity = 1) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        const product = products.find(p => p.id === id);
        return product && product.stock >= quantity;
    },
    
    getAverageRating: (id) => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        const product = products.find(p => p.id === id);
        return product ? product.rating : 3;
    },
    
    getCategories: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        const categories = [...new Set(products.map(p => p.category))];
        return categories.sort();
    },
    
    getCategoryStats: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
        }
        const stats = {};
        products.forEach(p => {
            if (!stats[p.category]) {
                stats[p.category] = {
                    count: 0,
                    totalStock: 0,
                    totalSales: 0
                };
            }
            stats[p.category].count++;
            stats[p.category].totalStock += p.stock || 0;
            stats[p.category].totalSales += p.sold || 0;
        });
        return stats;
    },
    
    refresh: () => {
        const stored = localStorage.getItem('AURA_PRODUCTS');
        if (stored) {
            products = JSON.parse(stored);
            window.products = products;
        }
        return products;
    }
};

window.products = products;
window.ProductService = ProductService;

console.log('✅ products.js loaded:', products.length, 'items');