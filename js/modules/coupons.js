// ===== COUPON SYSTEM =====
const CouponService = {
    coupons: JSON.parse(localStorage.getItem('coupons')) || [
        { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 0, expiry: '2024-12-31', uses: 100, used: 0 },
        { code: 'SAVE20', type: 'percentage', value: 20, minPurchase: 50, expiry: '2024-12-31', uses: 50, used: 0 },
        { code: 'FREESHIP', type: 'shipping', value: 100, minPurchase: 30, expiry: '2024-12-31', uses: 200, used: 0 },
        { code: 'FLAT5', type: 'fixed', value: 5, minPurchase: 20, expiry: '2024-12-31', uses: 100, used: 0 }
    ],
    
    validateCoupon: (code, cartTotal) => {
        const coupon = CouponService.coupons.find(c => 
            c.code.toUpperCase() === code.toUpperCase() && 
            new Date(c.expiry) > new Date() &&
            c.used < c.uses
        );
        
        if (!coupon) {
            return { valid: false, message: 'Invalid or expired coupon' };
        }
        
        if (cartTotal < coupon.minPurchase) {
            return { valid: false, message: `Minimum purchase of $${coupon.minPurchase} required` };
        }
        
        return { valid: true, coupon };
    },
    
    applyCoupon: (code, cartTotal) => {
        const validation = CouponService.validateCoupon(code, cartTotal);
        
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }
        
        const coupon = validation.coupon;
        let discount = 0;
        
        if (coupon.type === 'percentage') {
            discount = (cartTotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            discount = coupon.value;
        } else if (coupon.type === 'shipping') {
            discount = 5; // Assume $5 shipping
        }
        
        // Increment usage
        coupon.used++;
        localStorage.setItem('coupons', JSON.stringify(CouponService.coupons));
        
        return {
            success: true,
            discount,
            finalTotal: cartTotal - discount,
            coupon: coupon.code
        };
    },
    
    addCoupon: (coupon) => {
        CouponService.coupons.push(coupon);
        localStorage.setItem('coupons', JSON.stringify(CouponService.coupons));
    }
};