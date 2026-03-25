// ===== EMAIL SERVICE =====
const EmailService = {
    // Your Brevo API Key (replace with your actual key)
    API_KEY: 'xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // ← PUT YOUR KEY HERE
    
    // Send order confirmation email
    sendOrderConfirmation: async (order) => {
        const user = AuthService.getCurrentUser();
        if (!user) return false;
        
        // Format order items for email
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">$${item.price}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity || 1}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
        `).join('');
        
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: #09a5db; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .order-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .order-table { width: 100%; border-collapse: collapse; }
                    .order-table th { background: #333; color: white; padding: 10px; text-align: left; }
                    .order-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .total { font-size: 20px; font-weight: bold; color: #09a5db; text-align: right; margin-top: 20px; }
                    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
                    .track-btn { background: #09a5db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Order Confirmed!</h1>
                        <p>Thank you for shopping at Aura Market</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.name}!</h2>
                        <p>Your order <strong>#${order.id}</strong> has been received and is being processed.</p>
                        
                        <div class="order-details">
                            <h3>Order Details</h3>
                            <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
                            <p><strong>Payment Method:</strong> ${order.paymentMethod === 'paystack' ? 'Paystack' : order.paymentMethod === 'bank' ? 'Bank Transfer' : 'Pay on Delivery'}</p>
                            <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                        </div>
                        
                        <h3>Items Ordered</h3>
                        <table class="order-table">
                            <thead>
                                <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class="total">
                            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
                            <p>Shipping: $${order.shipping.toFixed(2)}</p>
                            ${order.discount > 0 ? `<p>Discount: -$${order.discount.toFixed(2)}</p>` : ''}
                            <p><strong>Total: $${order.amount.toFixed(2)}</strong></p>
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="https://auramarket.com/order-tracking.html?id=${order.id}" class="track-btn">
                                Track Your Order
                            </a>
                        </div>
                        
                        <p>We'll notify you when your order ships. Estimated delivery: 3-5 business days.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 Aura Market | Questions? Contact support@auramarket.com</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Send via Brevo API
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': EmailService.API_KEY
                },
                body: JSON.stringify({
                    sender: { name: 'Aura Market', email: 'orders@auramarket.com' },
                    to: [{ email: user.email, name: user.name }],
                    subject: `Order Confirmation #${order.id} - Aura Market`,
                    htmlContent: emailHtml
                })
            });
            
            if (response.ok) {
                console.log('✅ Email sent successfully');
                return true;
            } else {
                console.error('Email failed:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    },
    
    // Send shipping update email
    sendShippingUpdate: async (orderId, status) => {
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        const order = orders.find(o => o.id === orderId);
        if (!order) return false;
        
        const user = AuthService.getCurrentUser();
        if (!user) return false;
        
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
                    .header { background: #09a5db; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .status { background: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
                    .footer { background: #f5f5f5; padding: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📦 Order Update</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.name}!</h2>
                        <p>Your order <strong>#${order.id}</strong> status has been updated.</p>
                        
                        <div class="status">
                            <strong>New Status:</strong> ${status.toUpperCase()}
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="https://auramarket.com/order-tracking.html?id=${order.id}" style="background: #09a5db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Track Order
                            </a>
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 Aura Market</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': EmailService.API_KEY
                },
                body: JSON.stringify({
                    sender: { name: 'Aura Market', email: 'updates@auramarket.com' },
                    to: [{ email: user.email, name: user.name }],
                    subject: `Order Update #${order.id} - ${status}`,
                    htmlContent: emailHtml
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    },
    
    // Send welcome email
    sendWelcomeEmail: async (user) => {
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; }
                    .header { background: #09a5db; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; text-align: center; }
                    .coupon { background: #f0f0f0; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Aura Market!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.name}!</h2>
                        <p>Thanks for joining Aura Market. We're excited to have you!</p>
                        
                        <div class="coupon">
                            WELCOME10
                        </div>
                        <p>Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
                        
                        <a href="https://auramarket.com" style="background: #09a5db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                            Start Shopping
                        </a>
                    </div>
                    <div class="footer">
                        <p>© 2024 Aura Market</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': EmailService.API_KEY
                },
                body: JSON.stringify({
                    sender: { name: 'Aura Market', email: 'welcome@auramarket.com' },
                    to: [{ email: user.email, name: user.name }],
                    subject: 'Welcome to Aura Market! 🎉',
                    htmlContent: emailHtml
                })
            });
            
            return response.ok;
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    }
};

window.EmailService = EmailService;