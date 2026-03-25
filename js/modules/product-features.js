// ===== ADVANCED PRODUCT FEATURES =====
const ProductFeatures = {
    // Product Comparison
    compareList: JSON.parse(localStorage.getItem('compare_products')) || [],
    
    addToCompare: (productId) => {
        if (ProductFeatures.compareList.length >= 4) {
            Utils.showToast('Can compare up to 4 products', 'warning');
            return;
        }
        
        if (!ProductFeatures.compareList.includes(productId)) {
            ProductFeatures.compareList.push(productId);
            localStorage.setItem('compare_products', JSON.stringify(ProductFeatures.compareList));
            Utils.showToast('Added to comparison', 'success');
        }
    },
    
    removeFromCompare: (productId) => {
        ProductFeatures.compareList = ProductFeatures.compareList.filter(id => id !== productId);
        localStorage.setItem('compare_products', JSON.stringify(ProductFeatures.compareList));
        Utils.showToast('Removed from comparison', 'info');
    },
    
    getCompareProducts: () => {
        return ProductFeatures.compareList.map(id => ProductService.getById(id)).filter(p => p);
    },
    
    // Product Q&A
    questions: JSON.parse(localStorage.getItem('product_questions')) || [],
    
    askQuestion: (productId, question) => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Utils.showToast('Login to ask questions', 'warning');
            window.location.href = 'login.html';
            return;
        }
        
        ProductFeatures.questions.push({
            id: Date.now(),
            productId,
            userId: user.id,
            userName: user.name,
            question,
            answers: [],
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('product_questions', JSON.stringify(ProductFeatures.questions));
        Utils.showToast('Question posted! We\'ll answer soon', 'success');
    },
    
    answerQuestion: (questionId, answer) => {
        const user = AuthService.getCurrentUser();
        const isAdmin = AuthService.isAdmin();
        
        if (!isAdmin) {
            Utils.showToast('Only admins can answer questions', 'error');
            return;
        }
        
        const question = ProductFeatures.questions.find(q => q.id === questionId);
        if (question) {
            question.answers.push({
                answer,
                answeredBy: user.name,
                answeredAt: new Date().toISOString()
            });
            localStorage.setItem('product_questions', JSON.stringify(ProductFeatures.questions));
            Utils.showToast('Answer posted', 'success');
        }
    },
    
    // Product Videos
    addProductVideo: (productId, videoUrl) => {
        const product = ProductService.getById(productId);
        if (product) {
            if (!product.videos) product.videos = [];
            product.videos.push(videoUrl);
            localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
            Utils.showToast('Video added', 'success');
        }
    },
    
    // Stock Alerts
    stockAlerts: JSON.parse(localStorage.getItem('stock_alerts')) || [],
    
    subscribeStockAlert: (productId, email) => {
        if (!email) {
            const user = AuthService.getCurrentUser();
            if (!user) {
                Utils.showToast('Please login or enter email', 'warning');
                return;
            }
            email = user.email;
        }
        
        if (!ProductFeatures.stockAlerts.some(a => a.productId === productId && a.email === email)) {
            ProductFeatures.stockAlerts.push({ productId, email, subscribedAt: new Date().toISOString() });
            localStorage.setItem('stock_alerts', JSON.stringify(ProductFeatures.stockAlerts));
            Utils.showToast('We\'ll notify you when back in stock!', 'success');
        }
    },
    
    checkStockAlerts: () => {
        const products = ProductService.getAll();
        ProductFeatures.stockAlerts.forEach(alert => {
            const product = products.find(p => p.id === alert.productId);
            if (product && product.stock > 0 && !alert.notified) {
                // Send email notification
                if (typeof EmailService !== 'undefined') {
                    EmailService.sendStockAlert(alert.email, product);
                }
                alert.notified = true;
                alert.notifiedAt = new Date().toISOString();
            }
        });
        localStorage.setItem('stock_alerts', JSON.stringify(ProductFeatures.stockAlerts));
    }
};