document.addEventListener("DOMContentLoaded", () => {
    // 1. Get the reference from the URL (Paystack sends 'reference')
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('reference') || urlParams.get('ref') || "N/A";
    document.getElementById("order-ref").innerText = ref;

    // 2. Get the items from our "Snapshot"
    const lastOrder = JSON.parse(localStorage.getItem("LAST_ORDER")) || [];
    const summaryContainer = document.getElementById("order-summary");
    const totalPaidEl = document.getElementById("total-paid");

    if (lastOrder.length === 0) {
        summaryContainer.innerHTML = "<p class='text-muted'>No order data found.</p>";
        return;
    }

    let total = 0;
    summaryContainer.innerHTML = ""; // Clear container
    
    lastOrder.forEach(item => {
        total += item.price;
        summaryContainer.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <span class="fw-bold">${item.name}</span>
                    <br>
                    <small class="text-white-50">Qty: 1</small>
                </div>
                <span class="text-warning">$${item.price.toFixed(2)}</span>
            </div>
        `;
    });

    totalPaidEl.innerText = `$${total.toFixed(2)}`;
    
    // Optional: Clear the snapshot after displaying
    // localStorage.removeItem("LAST_ORDER"); // Uncomment if you want to clear after showing
});