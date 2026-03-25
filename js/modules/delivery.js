// ===== DELIVERY & LOGISTICS =====
const DeliveryService = {
    // Delivery Tracking
    deliveries: JSON.parse(localStorage.getItem('deliveries')) || [],
    
    createDelivery: (orderId, address) => {
        const delivery = {
            id: 'DEL-' + Date.now(),
            orderId,
            address,
            status: 'pending',
            driver: null,
            location: { lat: 6.5244, lng: 3.3792 }, // Lagos coordinates
            estimatedTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            history: [{ status: 'Order received', time: new Date().toISOString() }]
        };
        
        DeliveryService.deliveries.push(delivery);
        localStorage.setItem('deliveries', JSON.stringify(DeliveryService.deliveries));
        return delivery;
    },
    
    updateDeliveryLocation: (deliveryId, lat, lng) => {
        const delivery = DeliveryService.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            delivery.location = { lat, lng };
            localStorage.setItem('deliveries', JSON.stringify(DeliveryService.deliveries));
        }
    },
    
    updateDeliveryStatus: (deliveryId, status) => {
        const delivery = DeliveryService.deliveries.find(d => d.id === deliveryId);
        if (delivery) {
            delivery.status = status;
            delivery.history.push({ status, time: new Date().toISOString() });
            localStorage.setItem('deliveries', JSON.stringify(DeliveryService.deliveries));
            
            // Notify user
            if (typeof NotificationService !== 'undefined') {
                NotificationService.show('Delivery Update', `Your order status: ${status}`);
            }
        }
    },
    
    // Delivery Slot Booking
    slots: [
        { time: '09:00 - 12:00', available: 10 },
        { time: '12:00 - 15:00', available: 8 },
        { time: '15:00 - 18:00', available: 12 },
        { time: '18:00 - 21:00', available: 5 }
    ],
    
    bookSlot: (slotIndex) => {
        if (DeliveryService.slots[slotIndex].available > 0) {
            DeliveryService.slots[slotIndex].available--;
            localStorage.setItem('delivery_slots', JSON.stringify(DeliveryService.slots));
            Utils.showToast('Delivery slot booked!', 'success');
            return true;
        }
        Utils.showToast('Slot full, choose another time', 'error');
        return false;
    },
    
    // Store Pickup Locations
    pickupLocations: [
        { id: 1, name: 'Lagos Store', address: '123 Main St, Lagos', hours: '9am-6pm' },
        { id: 2, name: 'Abuja Store', address: '456 Central Rd, Abuja', hours: '9am-6pm' },
        { id: 3, name: 'Port Harcourt Store', address: '789 Oil Rd, PH', hours: '9am-5pm' }
    ],
    
    // Map Integration (Google Maps)
    initMap: (elementId, lat, lng) => {
        // In production, use Google Maps API
        const mapHtml = `
            <div style="background: #1a1a1a; padding: 20px; text-align: center;">
                <i class="fas fa-map-marked-alt fa-3x mb-3"></i>
                <p>Live tracking map would appear here</p>
                <p>Coordinates: ${lat}, ${lng}</p>
                <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" class="btn btn-primary">
                    Open in Google Maps
                </a>
            </div>
        `;
        document.getElementById(elementId).innerHTML = mapHtml;
    }
};