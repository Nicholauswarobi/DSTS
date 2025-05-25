document.addEventListener('DOMContentLoaded', () => {
    const todaySalesElement = document.getElementById('todaySales');
    const todayProfitElement = document.getElementById('todayProfit');
    const revenueElement = document.getElementById('revenue');
    const expensesElement = document.getElementById('expenses');
    const topProductsTableBody = document.getElementById('topProductsTableBody');

    // Fetch metrics from the backend
    function fetchMetrics() {
        fetch('/get-metrics')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Metrics data:', data); // Debugging log
                todaySalesElement.textContent = `TSH ${data.total_sales.toLocaleString()}`;
                todayProfitElement.textContent = `TSH ${data.profit.toLocaleString()}`;
                revenueElement.textContent = `TSH ${data.revenue.toLocaleString()}`;
                expensesElement.textContent = `TSH ${data.expenses.toLocaleString()}`;
            })
            .catch(error => console.error('Error fetching metrics:', error));
    }

    if (topProductsTableBody) {
        // Function to fetch and display the top 5 products
        const fetchTopProducts = () => {
            fetch('/get-top-products')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch top products');
                    }
                    return response.json();
                })
                .then(topProducts => {
                    topProductsTableBody.innerHTML = ''; // Clear existing rows

                    topProducts.forEach(product => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${product.rank}</td>
                            <td>${product.product_name}</td>
                            <td>${product.units_sold}</td>
                            <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TSH' }).format(product.revenue)}</td>
                        `;
                        topProductsTableBody.appendChild(row);
                    });
                })
                .catch(error => console.error('Error fetching top products:', error));
        };

        // Fetch top products on page load
        fetchTopProducts();
    }

    // Fetch and update metrics on page load
    fetchMetrics();
});