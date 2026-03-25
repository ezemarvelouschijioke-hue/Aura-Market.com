// Payment Module
const PaymentService = {
    // Initialize Paystack payment
    initializePaystack: (email, callback) => {
        const cart = CartService.getCart();
        const total = CartService.getTotal();
        
        if (cart.length === 0) {
            Utils.showToast('Your cart is empty!', 'error');
            return false;
        }
        
        if (!email) {
            Utils.showToast('Please enter your email', 'error');
            return false;
        }
        
        if (!Utils.validateEmail(email)) {
            Utils.showToast('Please enter a valid email', 'error');
            return false;
        }
        
        // Check if Paystack is loaded
        if (typeof PaystackPop === 'undefined') {
            Utils.showToast('Payment system unavailable', 'error');
            return false;
        }
        
        const amountInKobo = Math.round(total * 100); // Fixed: changed from amountInCent to amountInKobo
        
        const handler = PaystackPop.setup({
            key: CONFIG.PAYSTACK.PUBLIC_KEY,
            email: email,
            amount: amountInKobo, // Fixed variable name
            currency: CONFIG.PAYSTACK.CURRENCY,
            ref: 'AURA-' + Date.now() + '-' + Math.floor(Math.random() * 1000000),
            metadata: {
                cart: cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: item.price
                }))
            },
            callback: function(response) {
                // Payment successful
                PaymentService.handlePaymentSuccess(response);
                if (callback) callback(response);
            },
            onClose: function() {
                Utils.showToast('Payment cancelled', 'info');
            }
        });
        
        handler.openIframe();
        return true;
    },
    
    // Handle successful payment
    handlePaymentSuccess: (response) => {
        // Save order snapshot
        const lastOrder = CartService.getCart();
        localStorage.setItem('LAST_ORDER', JSON.stringify(lastOrder));
        
        // Clear cart
        CartService.clearCart();
        
        // Show success message
        Utils.showToast('Payment successful!', 'success');
        
        // Redirect to success page
        window.location.href = `success.html?reference=${response.reference}`;
    },
    
    // Validate payment (would call backend in production)
    validatePayment: (reference) => {
        // In production, this would verify with Paystack API
        console.log('Validating payment:', reference);
        return true;
    },
    
    // Process refund (admin only)
    processRefund: (orderId, reason) => {
        // In production, this would call Paystack refund API
        if (!AuthService.isAuthenticated()) {
            Utils.showToast('Authentication required', 'error');
            return false;
        }
        
        // Check if user is admin
        const user = AuthService.getCurrentUser();
        if (!user?.isAdmin) {
            Utils.showToast('Admin access required', 'error');
            return false;
        }
        
        Utils.showToast('Refund initiated', 'success');
        return true;
    }
};

// Override checkout function from your original code
window.checkout = function() {
    if (!AuthService.isAuthenticated()) {
        Utils.showToast('Please login to checkout', 'warning');
        window.location.href = 'login.html?redirect=checkout';
        return;
    }
    
    const email = document.getElementById('email-address')?.value;
    PaymentService.initializePaystack(email);
};