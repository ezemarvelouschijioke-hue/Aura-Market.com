// ===== SECURITY & TRUST =====
const SecurityService = {
    // 2-Factor Authentication
    twoFactorEnabled: JSON.parse(localStorage.getItem('two_factor_enabled')) || {},
    twoFactorCodes: JSON.parse(localStorage.getItem('two_factor_codes')) || {},
    
    enable2FA: (userId) => {
        const code = Math.floor(100000 + Math.random() * 900000);
        SecurityService.twoFactorCodes[userId] = code;
        localStorage.setItem('two_factor_codes', JSON.stringify(SecurityService.twoFactorCodes));
        
        // Simulate sending SMS/Email
        Utils.showToast(`Your 2FA code: ${code}`, 'info');
        return code;
    },
    
    verify2FA: (userId, code) => {
        if (SecurityService.twoFactorCodes[userId] == code) {
            SecurityService.twoFactorEnabled[userId] = true;
            localStorage.setItem('two_factor_enabled', JSON.stringify(SecurityService.twoFactorEnabled));
            Utils.showToast('2FA enabled successfully!', 'success');
            return true;
        }
        Utils.showToast('Invalid code', 'error');
        return false;
    },
    
    // Captcha
    generateCaptcha: () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        const result = num1 + num2;
        localStorage.setItem('captcha_result', result);
        return { question: `${num1} + ${num2} = ?`, answer: result };
    },
    
    verifyCaptcha: (answer) => {
        const result = parseInt(localStorage.getItem('captcha_result'));
        if (answer === result) {
            localStorage.removeItem('captcha_result');
            return true;
        }
        Utils.showToast('Captcha verification failed', 'error');
        return false;
    },
    
    // Fraud Detection
    fraudScore: (order) => {
        let score = 0;
        
        // High value order
        if (order.amount > 1000) score += 10;
        if (order.amount > 5000) score += 30;
        
        // New user with high value
        const user = StorageService.getUsers().find(u => u.email === order.customerEmail);
        if (user && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            score += 20;
        }
        
        // Suspicious email
        if (order.customerEmail.includes('temp') || order.customerEmail.includes('test')) score += 15;
        
        // Multiple items
        if (order.items?.length > 20) score += 15;
        
        return {
            score,
            isFraud: score > 50,
            flags: score > 30 ? ['Manual review required'] : [],
            recommendation: score > 50 ? 'Hold for review' : 'Auto-approve'
        };
    },
    
    // SSL Enforcement
    enforceSSL: () => {
        if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
            window.location.href = 'https://' + window.location.href.substring(7);
        }
    },
    
    // Login History
    addLoginRecord: (email, ip, userAgent) => {
        let history = JSON.parse(localStorage.getItem('login_history')) || [];
        history.unshift({
            email,
            ip: ip || '127.0.0.1',
            userAgent: userAgent || navigator.userAgent,
            timestamp: new Date().toISOString(),
            location: 'Unknown' // Would use IP geolocation API
        });
        
        // Keep last 20
        history = history.slice(0, 20);
        localStorage.setItem('login_history', JSON.stringify(history));
        
        // Check for suspicious logins
        const recent = history.filter(h => h.email === email).slice(0, 5);
        const ips = [...new Set(recent.map(r => r.ip))];
        if (ips.length > 2) {
            Utils.showToast('Suspicious login activity detected!', 'warning');
        }
    },
    
    // Mask Sensitive Data
    maskEmail: (email) => {
        const [name, domain] = email.split('@');
        return name.slice(0, 3) + '***@' + domain;
    },
    
    maskCard: (cardNumber) => {
        return '**** **** **** ' + cardNumber.slice(-4);
    }
};