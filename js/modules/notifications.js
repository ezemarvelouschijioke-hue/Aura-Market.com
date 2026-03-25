// ===== PUSH NOTIFICATIONS =====
const NotificationService = {
    permission: false,
    
    init: () => {
        if ('Notification' in window) {
            NotificationService.permission = Notification.permission === 'granted';
        }
    },
    
    requestPermission: () => {
        if ('Notification' in window) {
            Notification.requestPermission().then(perm => {
                NotificationService.permission = perm === 'granted';
                if (NotificationService.permission) {
                    localStorage.setItem('push_notifications', 'enabled');
                    NotificationService.show('🔔 Notifications enabled!', 'You\'ll receive updates from Aura Market');
                }
            });
        }
    },
    
    show: (title, body, icon = '/assets/images/icon-192.png') => {
        if (NotificationService.permission && !document.hidden) {
            new Notification(title, { body, icon });
        }
    },
    
    notifyDeal: (product) => {
        NotificationService.show(
            '🔥 Flash Sale!',
            `${product.name} is now ${product.isOnSale ? `${Math.round((1 - product.salePrice/product.price) * 100)}% OFF` : 'on sale'}!`,
            product.img
        );
    },
    
    notifyOrderUpdate: (orderId, status) => {
        NotificationService.show(
            '📦 Order Update',
            `Your order #${orderId} status: ${status}`,
            '/assets/images/icon-192.png'
        );
    },
    
    notifyPriceDrop: (product, oldPrice) => {
        NotificationService.show(
            '💰 Price Drop!',
            `${product.name} dropped from $${oldPrice} to $${product.price}`,
            product.img
        );
    }
};

// Show notification button in navbar
function addNotificationButton() {
    if (!('Notification' in window)) return;
    
    const navIcons = document.querySelector('.nav-icons');
    if (!navIcons) return;
    
    const notifBtn = document.createElement('button');
    notifBtn.className = 'icon-btn notification-btn';
    notifBtn.innerHTML = '<i class="fas fa-bell"></i>';
    notifBtn.onclick = () => NotificationService.requestPermission();
    notifBtn.title = 'Enable notifications';
    
    navIcons.insertBefore(notifBtn, navIcons.firstChild);
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    NotificationService.init();
    addNotificationButton();
});

window.NotificationService = NotificationService;