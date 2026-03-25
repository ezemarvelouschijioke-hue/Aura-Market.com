// ===== INTERNATIONAL FEATURES =====
const InternationalService = {
    // Currency Exchange Rates (simulated)
    currencies: {
        USD: { symbol: '$', rate: 1, name: 'US Dollar' },
        NGN: { symbol: '₦', rate: 1500, name: 'Nigerian Naira' },
        GBP: { symbol: '£', rate: 0.78, name: 'British Pound' },
        EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
        CAD: { symbol: 'C$', rate: 1.35, name: 'Canadian Dollar' }
    },
    
    currentCurrency: localStorage.getItem('currency') || 'USD',
    
    convertPrice: (priceUSD) => {
        const currency = InternationalService.currencies[InternationalService.currentCurrency];
        return (priceUSD * currency.rate).toFixed(2);
    },
    
    formatPrice: (priceUSD) => {
        const currency = InternationalService.currencies[InternationalService.currentCurrency];
        return `${currency.symbol}${InternationalService.convertPrice(priceUSD)}`;
    },
    
    setCurrency: (code) => {
        if (InternationalService.currencies[code]) {
            InternationalService.currentCurrency = code;
            localStorage.setItem('currency', code);
            location.reload();
        }
    },
    
    // Languages
    languages: {
        en: { name: 'English', flag: '🇺🇸', translations: {} },
        fr: { name: 'Français', flag: '🇫🇷', translations: {} },
        es: { name: 'Español', flag: '🇪🇸', translations: {} },
        yo: { name: 'Yorùbá', flag: '🇳🇬', translations: {} }
    },
    
    currentLanguage: localStorage.getItem('language') || 'en',
    
    translate: (text) => {
        // In production, use Google Translate API
        return text;
    },
    
    setLanguage: (code) => {
        if (InternationalService.languages[code]) {
            InternationalService.currentLanguage = code;
            localStorage.setItem('language', code);
            location.reload();
        }
    },
    
    // International Shipping
    shippingZones: {
        'NG': { name: 'Nigeria', cost: 0, days: '3-5', freeShipping: 50 },
        'US': { name: 'United States', cost: 25, days: '7-10', freeShipping: 100 },
        'UK': { name: 'United Kingdom', cost: 20, days: '5-7', freeShipping: 100 },
        'CA': { name: 'Canada', cost: 22, days: '7-10', freeShipping: 100 },
        'default': { name: 'International', cost: 35, days: '10-15', freeShipping: 150 }
    },
    
    calculateInternationalShipping: (countryCode, subtotal) => {
        const zone = InternationalService.shippingZones[countryCode] || InternationalService.shippingZones.default;
        if (subtotal >= zone.freeShipping) return 0;
        return zone.cost;
    },
    
    // Tax Calculator
    taxRates: {
        'NG': 0.075, // 7.5% VAT
        'US': 0.1,   // 10% average
        'UK': 0.2,   // 20% VAT
        'CA': 0.13,  // 13% HST
        'default': 0.1
    },
    
    calculateTax: (subtotal, countryCode) => {
        const rate = InternationalService.taxRates[countryCode] || InternationalService.taxRates.default;
        return subtotal * rate;
    }
};