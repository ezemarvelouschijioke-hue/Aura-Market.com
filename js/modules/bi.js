// ===== BUSINESS INTELLIGENCE =====
const BIService = {
    // Customer Segmentation
    getCustomerSegments: () => {
        const users = StorageService.getUsers();
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        
        const segments = {
            new: { count: 0, users: [] },
            active: { count: 0, users: [] },
            dormant: { count: 0, users: [] },
            vip: { count: 0, users: [] }
        };
        
        users.forEach(user => {
            const userOrders = orders.filter(o => o.customerEmail === user.email);
            const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
            const lastOrder = userOrders[0]?.date;
            
            if (totalSpent > 500) {
                segments.vip.count++;
                segments.vip.users.push(user);
            } else if (userOrders.length > 0) {
                segments.active.count++;
                segments.active.users.push(user);
            } else if (userOrders.length === 0 && new Date(user.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
                segments.dormant.count++;
                segments.dormant.users.push(user);
            } else {
                segments.new.count++;
                segments.new.users.push(user);
            }
        });
        
        return segments;
    },
    
    // Sales Forecast (Simple linear regression)
    forecastSales: (days = 30) => {
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        const dailySales = {};
        
        orders.forEach(order => {
            const date = new Date(order.date).toLocaleDateString();
            dailySales[date] = (dailySales[date] || 0) + (order.amount || 0);
        });
        
        const salesArray = Object.values(dailySales);
        if (salesArray.length < 7) return { forecast: 0, confidence: 'low' };
        
        // Simple moving average
        const avg = salesArray.slice(-7).reduce((a, b) => a + b, 0) / 7;
        const forecast = avg * days;
        
        return {
            forecast,
            daily: avg,
            confidence: salesArray.length > 30 ? 'high' : 'medium',
            trend: salesArray.slice(-3)[0] > salesArray.slice(-7)[0] ? 'up' : 'down'
        };
    },
    
    // Inventory Alerts
    getInventoryAlerts: () => {
        const products = ProductService.getAll();
        const alerts = [];
        
        products.forEach(product => {
            if (product.stock <= 0) {
                alerts.push({ type: 'out_of_stock', product, severity: 'critical' });
            } else if (product.stock <= 5) {
                alerts.push({ type: 'low_stock', product, severity: 'warning' });
            } else if (product.stock <= product.reorderPoint) {
                alerts.push({ type: 'reorder', product, severity: 'info' });
            }
        });
        
        return alerts;
    },
    
    // Export Reports
    exportReport: (type, format = 'csv') => {
        let data = [];
        let filename = '';
        
        switch(type) {
            case 'sales':
                const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
                data = orders.map(o => ({
                    'Order ID': o.id,
                    'Customer': o.customerName,
                    'Amount': o.amount,
                    'Status': o.status,
                    'Date': o.date
                }));
                filename = 'sales_report';
                break;
            case 'products':
                const products = ProductService.getAll();
                data = products.map(p => ({
                    'ID': p.id,
                    'Name': p.name,
                    'Price': p.price,
                    'Stock': p.stock,
                    'Sold': p.sold,
                    'Revenue': (p.price * (p.sold || 0)).toFixed(2)
                }));
                filename = 'products_report';
                break;
            case 'customers':
                const users = StorageService.getUsers();
                data = users.map(u => ({
                    'Name': u.name,
                    'Email': u.email,
                    'Joined': u.createdAt,
                    'Orders': u.orders?.length || 0
                }));
                filename = 'customers_report';
                break;
        }
        
        // Convert to CSV
        const headers = Object.keys(data[0] || {});
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
        ].join('\n');
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
        Utils.showToast(`${type} report exported`, 'success');
    },
    
    // Sales Dashboard Data
    getDashboardData: () => {
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        const products = ProductService.getAll();
        const users = StorageService.getUsers();
        
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.date?.startsWith(today));
        
        return {
            totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
            totalOrders: orders.length,
            totalCustomers: users.length,
            totalProducts: products.length,
            todayRevenue: todayOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
            todayOrders: todayOrders.length,
            topProduct: [...products].sort((a,b) => (b.sold||0) - (a.sold||0))[0],
            avgOrderValue: orders.length ? orders.reduce((sum, o) => sum + (o.amount||0),0) / orders.length : 0,
            conversionRate: users.length ? (orders.length / users.length * 100).toFixed(1) : 0
        };
    }
};