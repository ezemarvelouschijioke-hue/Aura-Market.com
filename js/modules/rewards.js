// ===== REWARDS SYSTEM =====
const RewardsService = {
    pointsPerDollar: 10,
    redemptionRate: 100, // 100 points = $1
    tiers: [
        { name: 'Bronze', minPoints: 0, color: '#CD7F32', discount: 0, icon: 'fa-medal' },
        { name: 'Silver', minPoints: 1000, color: '#C0C0C0', discount: 5, icon: 'fa-star' },
        { name: 'Gold', minPoints: 5000, color: '#FFD700', discount: 10, icon: 'fa-crown' },
        { name: 'Platinum', minPoints: 10000, color: '#E5E4E2', discount: 15, icon: 'fa-gem' }
    ],

    init: () => {
        if (!localStorage.getItem('user_points')) {
            localStorage.setItem('user_points', JSON.stringify({}));
        }
    },

    addPoints: (userId, amount) => {
        if (!userId) return false;
        
        const points = JSON.parse(localStorage.getItem('user_points')) || {};
        const currentPoints = points[userId] || 0;
        const earnedPoints = Math.round(amount * RewardsService.pointsPerDollar);
        
        points[userId] = currentPoints + earnedPoints;
        localStorage.setItem('user_points', JSON.stringify(points));
        
        return {
            success: true,
            earned: earnedPoints,
            total: points[userId],
            newTier: RewardsService.checkTierUpgrade(userId, points[userId])
        };
    },

    getPoints: (userId) => {
        if (!userId) return 0;
        const points = JSON.parse(localStorage.getItem('user_points')) || {};
        return points[userId] || 0;
    },

    redeemPoints: (userId, pointsToRedeem) => {
        const currentPoints = RewardsService.getPoints(userId);
        
        if (currentPoints < pointsToRedeem) {
            return { 
                success: false, 
                message: 'Insufficient points',
                available: currentPoints,
                required: pointsToRedeem
            };
        }
        
        const pointsData = JSON.parse(localStorage.getItem('user_points')) || {};
        pointsData[userId] = currentPoints - pointsToRedeem;
        localStorage.setItem('user_points', JSON.stringify(pointsData));
        
        const discount = pointsToRedeem / RewardsService.redemptionRate;
        
        return {
            success: true,
            discount,
            pointsUsed: pointsToRedeem,
            remainingPoints: pointsData[userId],
            message: `Redeemed $${discount.toFixed(2)} discount!`
        };
    },

    getTier: (points) => {
        for (let i = RewardsService.tiers.length - 1; i >= 0; i--) {
            if (points >= RewardsService.tiers[i].minPoints) {
                return RewardsService.tiers[i];
            }
        }
        return RewardsService.tiers[0];
    },

    checkTierUpgrade: (userId, points) => {
        const oldPoints = RewardsService.getPoints(userId) - points; // This is tricky, better to store last tier
        const oldTier = RewardsService.getTier(oldPoints);
        const newTier = RewardsService.getTier(points);
        
        if (oldTier.name !== newTier.name) {
            return {
                upgraded: true,
                oldTier: oldTier.name,
                newTier: newTier.name
            };
        }
        return null;
    },

    calculatePointsForOrder: (orderTotal) => {
        return Math.round(orderTotal * RewardsService.pointsPerDollar);
    },

    getNextTier: (points) => {
        for (let i = 0; i < RewardsService.tiers.length - 1; i++) {
            if (points < RewardsService.tiers[i + 1].minPoints) {
                return {
                    tier: RewardsService.tiers[i + 1],
                    pointsNeeded: RewardsService.tiers[i + 1].minPoints - points
                };
            }
        }
        return null;
    },

    getLeaderboard: (limit = 10) => {
        const points = JSON.parse(localStorage.getItem('user_points')) || {};
        const users = StorageService.getUsers();
        
        const leaderboard = Object.entries(points)
            .map(([userId, points]) => {
                const user = users.find(u => u.id === userId || u.email === userId);
                return {
                    userId,
                    name: user ? user.name : 'Anonymous',
                    points,
                    tier: RewardsService.getTier(points).name
                };
            })
            .sort((a, b) => b.points - a.points)
            .slice(0, limit);
        
        return leaderboard;
    }
};

// Initialize on load
RewardsService.init();

window.RewardsService = RewardsService;
console.log('✅ Rewards system loaded');