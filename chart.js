document.addEventListener('DOMContentLoaded', () => {
    // Example data (replace with actual data from localStorage or API)
    const salesData = [
        { productName: 'Hammer', quantity: 10, price: 15, cost: 10 },
        { productName: 'Nails', quantity: 50, price: 0.5, cost: 0.3 },
        { productName: 'Screwdriver', quantity: 20, price: 8, cost: 5 },
        { productName: 'Drill', quantity: 5, price: 50, cost: 30 },
        { productName: 'Saw', quantity: 8, price: 25, cost: 15 },
    ];

    // Calculate metrics
    const totalStockIn = salesData.reduce((sum, item) => sum + item.quantity, 0);
    const totalStockOut = salesData.reduce((sum, item) => sum + item.quantity, 0); // Example: same as stock in
    const remainingStock = totalStockIn - totalStockOut; // Example calculation
    const revenue = salesData.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const expenses = salesData.reduce((sum, item) => sum + item.quantity * item.cost, 0);
    const profit = revenue - expenses;

    // Update metrics in the DOM
    document.getElementById('totalStockIn').textContent = totalStockIn;
    document.getElementById('totalStockOut').textContent = totalStockOut;
    document.getElementById('remainingStock').textContent = remainingStock;
    document.getElementById('revenue').textContent = `$${revenue.toFixed(2)}`;
    document.getElementById('expenses').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('profit').textContent = `$${profit.toFixed(2)}`;

    // Display top 5 sales products
    const topProducts = salesData
        .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
        .slice(0, 5);
    const topProductsList = document.getElementById('topProducts');
    topProducts.forEach((product) => {
        const li = document.createElement('li');
        li.textContent = `${product.productName} - $${(product.quantity * product.price).toFixed(2)}`;
        topProductsList.appendChild(li);
    });

    // Create revenue and purchase cost graph
    const ctx = document.getElementById('revenueGraph').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesData.map((item) => item.productName),
            datasets: [
                {
                    label: 'Revenue',
                    data: salesData.map((item) => item.quantity * item.price),
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                },
                {
                    label: 'Purchase Cost',
                    data: salesData.map((item) => item.quantity * item.cost),
                    backgroundColor: 'rgba(220, 53, 69, 0.5)',
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        },
    });
});