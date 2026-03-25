// ===== ABANDONED CART SYSTEM =====
const AbandonedCartService = {
    checkInterval: 30 * 60 * 1000, // 30 minutes
    
    init: () => {
        // Check for abandoned carts every 30 minutes
        setInterval(() => {
            AbandonedCartService.checkAbandonedCarts();
        }, AbandonedCartService.checkInterval);
        
        // Track when user leaves page
        window.addEventListener('beforeunload', () => {
            const user = AuthService.getCurrentUser();
            const cart = CartService.getCart();
            
            if (user && cart.length > 0 && !localStorage.getItem('cart_reminder_sent')) {
                localStorage.setItem('pending_abandoned_cart', JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    items: cart,
                    timestamp: Date.now()
                }));
            }
        });
        
        // Check on load for pending abandoned cart
        const pending = localStorage.getItem('pending_abandoned_cart');
        if (pending && !localStorage.getItem('cart_reminder_sent')) {
            const cartData = JSON.parse(pending);
            if (Date.now() - cartData.timestamp > 30 * 60 * 1000) {
                AbandonedCartService.sendReminder(cartData);
            }
        }
    },
    
    checkAbandonedCarts: () => {
        const carts = JSON.parse(localStorage.getItem('abandoned_carts')) || [];
        const now = Date.now();
        
        carts.forEach(cart => {
            if (now - cart.timestamp > 30 * 60 * 1000 && !cart.reminderSent) {
                AbandonedCartService.sendReminder(cart);
                cart.reminderSent = true;
            }
        });
        
        localStorage.setItem('abandoned_carts', JSON.stringify(carts));
    },
    
    sendReminder: (cartData) => {
        if (typeof EmailService === 'undefined') return;
        
        const itemsHtml = cartData.items.map(item => `
            <div style="display: flex; gap: 15px; margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${item.img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                <div>
                    <strong>${item.name}</strong><br>
                    $${item.price} × ${item.quantity || 1}
                </div>
            </div>
        `).join('');
        
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
                    .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .cart-items { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .coupon { background: #ffd700; padding: 15px; border-radius: 5px; text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🛒 Forgot Something?</h1>
                        <p>Your cart is waiting for you!</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${cartData.email}!</h2>
                        <p>You left these items in your cart:</p>
                        
                        <div class="cart-items">
                            ${itemsHtml}
                        </div>
                        
                        <div class="coupon">
                            SAVE20
                        </div>
                        <p>Use code <strong>SAVE20</strong> for 20% off your order!</p>
                        
                        <a href="https://auramarket.com/checkout.html" style="background: #ff6b6b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">
                            Complete Checkout
                        </a>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': EmailService.API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Aura Market', email: 'reminders@auramarket.com' },
                to: [{ email: cartData.email }],
                subject: '🛒 Don\'t forget your items!',
                htmlContent: emailHtml
            })
        }).catch(console.error);
        
        localStorage.setItem('cart_reminder_sent', 'true');
    }
};

// Initialize
AbandonedCartService.init();