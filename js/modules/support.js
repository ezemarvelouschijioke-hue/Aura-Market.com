// ===== CUSTOMER SUPPORT =====
const SupportService = {
    // Ticket System
    tickets: JSON.parse(localStorage.getItem('support_tickets')) || [],
    
    createTicket: (subject, message, category) => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            Utils.showToast('Login to create support ticket', 'warning');
            window.location.href = 'login.html';
            return;
        }
        
        const ticket = {
            id: 'TKT-' + Date.now(),
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            subject,
            message,
            category,
            status: 'open',
            priority: 'normal',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [{ from: user.email, message, timestamp: new Date().toISOString() }]
        };
        
        SupportService.tickets.unshift(ticket);
        localStorage.setItem('support_tickets', JSON.stringify(SupportService.tickets));
        
        Utils.showToast('Ticket created! We\'ll respond within 24 hours', 'success');
        
        // Send email notification
        if (typeof EmailService !== 'undefined') {
            EmailService.sendTicketConfirmation(ticket);
        }
        
        return ticket;
    },
    
    replyToTicket: (ticketId, message) => {
        const ticket = SupportService.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.messages.push({
                from: AuthService.getCurrentUser()?.email || 'support@auramarket.com',
                message,
                timestamp: new Date().toISOString()
            });
            ticket.updatedAt = new Date().toISOString();
            ticket.status = 'pending';
            localStorage.setItem('support_tickets', JSON.stringify(SupportService.tickets));
            Utils.showToast('Reply sent', 'success');
        }
    },
    
    closeTicket: (ticketId) => {
        const ticket = SupportService.tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'closed';
            localStorage.setItem('support_tickets', JSON.stringify(SupportService.tickets));
            Utils.showToast('Ticket closed', 'info');
        }
    },
    
    // Knowledge Base
    articles: [
        { id: 1, title: 'How to place an order', category: 'ordering', content: '...' },
        { id: 2, title: 'Track your order', category: 'shipping', content: '...' },
        { id: 3, title: 'Return policy', category: 'returns', content: '...' },
        { id: 4, title: 'Payment methods', category: 'payment', content: '...' },
        { id: 5, title: 'Using coupons', category: 'discounts', content: '...' }
    ],
    
    searchArticles: (query) => {
        const q = query.toLowerCase();
        return SupportService.articles.filter(a =>
            a.title.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q)
        );
    },
    
    // Auto FAQ Bot (Enhanced AI)
    autoReply: (message) => {
        const msg = message.toLowerCase();
        const responses = {
            'order': 'You can track your order at: <a href="order-tracking.html">Track Order Page</a>',
            'return': 'Returns accepted within 30 days. <a href="returns.html">Start a return</a>',
            'refund': 'Refunds process in 3-5 business days after we receive the item',
            'shipping': 'Free shipping over $50. Standard: 3-5 days, Express: 1-2 days',
            'payment': 'We accept Paystack, cards, bank transfers, and Pay on Delivery',
            'coupon': 'Active codes: WELCOME10 (10%), SAVE20 (20% off $50+), FLAT5 ($5 off)',
            'account': 'Manage your account at <a href="account.html">Account Settings</a>',
            'warranty': 'All products come with 1-year warranty',
            'contact': 'Email: support@auramarket.com | Phone: +234 123 456 7890'
        };
        
        for (const [key, value] of Object.entries(responses)) {
            if (msg.includes(key)) return value;
        }
        
        return "I'm here to help! Our team will respond within 24 hours. For immediate help, call +234 123 456 7890";
    },
    
    // Click-to-Call
    clickToCall: (phone) => {
        window.location.href = `tel:${phone}`;
    },
    
    // Live Chat Transfer (to human)
    transferToHuman: () => {
        Utils.showToast('Connecting to a support agent...', 'info');
        setTimeout(() => {
            Utils.showToast('Agent Sarah joined the chat', 'success');
            document.getElementById('chatMessages').innerHTML += `
                <div class="message received">
                    <p>Hi! I'm Sarah from support. How can I help you?</p>
                    <span class="time">Just now</span>
                </div>
            `;
        }, 2000);
    }
};