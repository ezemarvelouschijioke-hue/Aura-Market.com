// ===== ADVANCED ADMIN =====
const AdvancedAdmin = {
    // Bulk Product Upload
    bulkUpload: (csvFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            
            const products = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length === headers.length) {
                    const product = {};
                    headers.forEach((h, idx) => {
                        product[h.trim()] = values[idx].trim();
                    });
                    product.id = Date.now() + i;
                    product.price = parseFloat(product.price);
                    product.stock = parseInt(product.stock);
                    products.push(product);
                }
            }
            
            // Save products
            let existing = ProductService.getAll();
            existing.push(...products);
            localStorage.setItem('AURA_PRODUCTS', JSON.stringify(existing));
            
            Utils.showToast(`Uploaded ${products.length} products`, 'success');
        };
        reader.readAsText(csvFile);
    },
    
    // Variations Manager
    manageVariations: (productId, variations) => {
        const products = ProductService.getAll();
        const product = products.find(p => p.id === productId);
        if (product) {
            product.variations = variations;
            localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
            Utils.showToast('Variations updated', 'success');
        }
    },
    
    // Print Shipping Labels
    printLabel: (orderId) => {
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        const order = orders.find(o => o.id === orderId);
        if (order) {
            const labelHtml = `
                <div style="width: 300px; padding: 20px; border: 1px solid black;">
                    <h3>Aura Market</h3>
                    <hr>
                    <p><strong>Order #${order.id}</strong></p>
                    <p>Customer: ${order.customerName}</p>
                    <p>Address: ${order.shippingAddress}</p>
                    <p>Items: ${order.items?.length || 0}</p>
                    <hr>
                    <p>Thank you for shopping!</p>
                </div>
            `;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(labelHtml);
            printWindow.print();
        }
    },
    
    // Restock Management
    restockRequests: JSON.parse(localStorage.getItem('restock_requests')) || [],
    
    requestRestock: (productId, quantity) => {
        AdvancedAdmin.restockRequests.push({
            productId,
            quantity,
            requestedBy: AuthService.getCurrentUser()?.email || 'admin',
            requestedAt: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('restock_requests', JSON.stringify(AdvancedAdmin.restockRequests));
        Utils.showToast('Restock request submitted', 'success');
    },
    
    approveRestock: (requestId) => {
        const request = AdvancedAdmin.restockRequests.find(r => r.id === requestId);
        if (request) {
            const products = ProductService.getAll();
            const product = products.find(p => p.id === request.productId);
            if (product) {
                product.stock += request.quantity;
                localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
                request.status = 'approved';
                request.approvedAt = new Date().toISOString();
                localStorage.setItem('restock_requests', JSON.stringify(AdvancedAdmin.restockRequests));
                Utils.showToast('Restock approved', 'success');
            }
        }
    },
    
    // Bulk Discount Apply
    applyBulkDiscount: (category, discountPercent) => {
        const products = ProductService.getAll();
        products.forEach(product => {
            if (product.category === category || category === 'all') {
                product.salePrice = product.price * (1 - discountPercent / 100);
                product.isOnSale = true;
            }
        });
        localStorage.setItem('AURA_PRODUCTS', JSON.stringify(products));
        Utils.showToast(`Applied ${discountPercent}% discount to ${category}`, 'success');
    },
    
    // Export All Data
    exportAllData: () => {
        const data = {
            products: ProductService.getAll(),
            orders: JSON.parse(localStorage.getItem('AURA_ORDERS')) || [],
            users: StorageService.getUsers(),
            coupons: JSON.parse(localStorage.getItem('coupons')) || [],
            points: JSON.parse(localStorage.getItem('user_points')) || {},
            reviews: localStorage.getItem('reviews') || {}
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auramarket_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showToast('All data exported', 'success');
    },
    
    // Import Data
    importData: (jsonFile) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            
            if (data.products) localStorage.setItem('AURA_PRODUCTS', JSON.stringify(data.products));
            if (data.orders) localStorage.setItem('AURA_ORDERS', JSON.stringify(data.orders));
            if (data.users) localStorage.setItem('AURA_USERS', JSON.stringify(data.users));
            if (data.coupons) localStorage.setItem('coupons', JSON.stringify(data.coupons));
            
            Utils.showToast('Data imported successfully', 'success');
            location.reload();
        };
        reader.readAsText(jsonFile);
    }
};