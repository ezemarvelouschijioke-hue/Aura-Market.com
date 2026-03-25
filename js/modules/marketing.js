// ===== ADVANCED MARKETING =====
const MarketingService = {
    // Referral Program
    referralCodes: JSON.parse(localStorage.getItem('referral_codes')) || {},
    
    generateReferralCode: (userId) => {
        const code = `REF-${userId}-${Date.now().toString(36).toUpperCase()}`;
        MarketingService.referralCodes[userId] = code;
        localStorage.setItem('referral_codes', JSON.stringify(MarketingService.referralCodes));
        return code;
    },
    
    trackReferral: (refCode) => {
        localStorage.setItem('referral_code', refCode);
    },
    
    applyReferralDiscount: (cartTotal, refCode) => {
        const referrer = Object.entries(MarketingService.referralCodes).find(([_, code]) => code === refCode);
        if (referrer) {
            const [userId, code] = referrer;
            let points = JSON.parse(localStorage.getItem('user_points')) || {};
            points[userId] = (points[userId] || 0) + (cartTotal * 10);
            localStorage.setItem('user_points', JSON.stringify(points));
            return cartTotal * 0.9; // 10% off
        }
        return cartTotal;
    },
    
    // Affiliate System
    affiliates: JSON.parse(localStorage.getItem('affiliates')) || [],
    
    registerAffiliate: (userId) => {
        if (MarketingService.affiliates.find(a => a.userId === userId)) return;
        
        MarketingService.affiliates.push({
            userId,
            code: MarketingService.generateReferralCode(userId),
            earnings: 0,
            clicks: 0,
            conversions: 0,
            joined: new Date().toISOString()
        });
        localStorage.setItem('affiliates', JSON.stringify(MarketingService.affiliates));
        Utils.showToast('Registered as affiliate! Share your link to earn', 'success');
    },
    
    trackAffiliateClick: (affiliateCode) => {
        const affiliate = MarketingService.affiliates.find(a => a.code === affiliateCode);
        if (affiliate) {
            affiliate.clicks++;
            localStorage.setItem('affiliates', JSON.stringify(MarketingService.affiliates));
        }
        localStorage.setItem('affiliate_code', affiliateCode);
    },
    
    recordAffiliateSale: (affiliateCode, amount) => {
        const affiliate = MarketingService.affiliates.find(a => a.code === affiliateCode);
        if (affiliate) {
            affiliate.conversions++;
            affiliate.earnings += amount * 0.1; // 10% commission
            localStorage.setItem('affiliates', JSON.stringify(MarketingService.affiliates));
            
            // Notify affiliate
            const user = AuthService.getCurrentUser();
            if (user && user.id === affiliate.userId) {
                Utils.showToast(`You earned $${(amount * 0.1).toFixed(2)} from referral!`, 'success');
            }
        }
    },
    
    // Loyalty Tiers
    loyaltyTiers: [
        { name: 'Bronze', minSpend: 0, discount: 0, color: '#CD7F32', icon: 'fa-medal' },
        { name: 'Silver', minSpend: 100, discount: 5, color: '#C0C0C0', icon: 'fa-star' },
        { name: 'Gold', minSpend: 500, discount: 10, color: '#FFD700', icon: 'fa-crown' },
        { name: 'Platinum', minSpend: 1000, discount: 15, color: '#E5E4E2', icon: 'fa-gem' },
        { name: 'Diamond', minSpend: 5000, discount: 20, color: '#B9F2FF', icon: 'fa-diamond' }
    ],
    
    getUserTier: (userId) => {
        const orders = JSON.parse(localStorage.getItem('AURA_ORDERS')) || [];
        const userOrders = orders.filter(o => o.customerEmail === AuthService.getCurrentUser()?.email);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
        
        let tier = MarketingService.loyaltyTiers[0];
        for (let i = MarketingService.loyaltyTiers.length - 1; i >= 0; i--) {
            if (totalSpent >= MarketingService.loyaltyTiers[i].minSpend) {
                tier = MarketingService.loyaltyTiers[i];
                break;
            }
        }
        return tier;
    },
    
    // Birthday Discounts
    birthdayDiscounts: JSON.parse(localStorage.getItem('birthday_discounts')) || {},
    
    setBirthday: (userId, date) => {
        MarketingService.birthdayDiscounts[userId] = date;
        localStorage.setItem('birthday_discounts', JSON.stringify(MarketingService.birthdayDiscounts));
    },
    
    checkBirthdayDiscount: (userId) => {
        const birthday = MarketingService.birthdayDiscounts[userId];
        if (!birthday) return false;
        
        const today = new Date();
        const bday = new Date(birthday);
        const isBirthday = today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
        
        if (isBirthday && !localStorage.getItem(`birthday_used_${userId}`)) {
            localStorage.setItem(`birthday_used_${userId}`, 'true');
            return { discount: 20, message: 'Happy Birthday! 20% off your order!' };
        }
        return false;
    }
};