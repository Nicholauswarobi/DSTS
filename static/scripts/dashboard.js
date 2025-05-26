document.addEventListener('DOMContentLoaded', () => {
    const todaySalesElement = document.getElementById('todaySales');
    const todayProfitElement = document.getElementById('todayProfit');
    const revenueElement = document.getElementById('revenue');
    const expensesElement = document.getElementById('expenses');
    const topProductsTableBody = document.getElementById('topProductsTableBody');
    const stockInMetric = document.getElementById('stockInMetric');
    const stockOutMetric = document.getElementById('stockOutMetric');
    const stockInValue = document.getElementById('stockInValue');
    const stockOutValue = document.getElementById('stockOutValue');

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

                // Check if all metrics are present in the response
                console.log('Expenses:', data.expenses);
                console.log('Stock In:', data.stock_in);
                console.log('Stock Out:', data.stock_out);

                // Update the UI
                todaySalesElement.textContent = `TSH ${data.total_sales.toLocaleString()}`;
                todayProfitElement.textContent = `TSH ${data.profit.toLocaleString()}`;
                revenueElement.textContent = `TSH ${data.revenue?.toLocaleString() || '0'}`; // Handle undefined revenue
                expensesElement.textContent = `TSH ${data.expenses.toLocaleString()}`;
                stockInValue.textContent = data.stock_in;
                stockOutValue.textContent = data.stock_out;
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

    // Navigate to Inventory page when Stock In is clicked
    stockInMetric.addEventListener('click', () => {
        window.location.href = '/inventory';
    });

    // Navigate to Sales page when Stock Out is clicked
    stockOutMetric.addEventListener('click', () => {
        window.location.href = '/sales';
    });

    // Fetch metrics on page load
    fetchMetrics();
});