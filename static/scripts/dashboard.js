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
    const notificationButton = document.getElementById('notificationButton');
    const notificationDot = document.getElementById('notificationDot');
    const lowStockModal = document.getElementById('lowStockModal');
    const lowStockList = document.getElementById('lowStockList');
    const closeLowStockModal = document.getElementById('closeLowStockModal');
    const acceptNotificationBtn = document.getElementById('acceptNotificationBtn');

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

    // Function to fetch low stock products and update the notification dot
    const updateLowStockNotification = async () => {
        try {
            const response = await fetch('/low-stock');
            const products = await response.json();

            if (products.length > 0) {
                // Show the notification dot if there are low stock products
                notificationDot.classList.add('show');
            } else {
                // Hide the notification dot if there are no low stock products
                notificationDot.classList.remove('show');
            }
        } catch (error) {
            console.error('Error fetching low stock products:', error);
        }
    };

    // Fetch low stock products and display them in the modal
    const fetchLowStockProducts = async () => {
        try {
            const response = await fetch('/low-stock');
            const products = await response.json();

            // Clear the list
            lowStockList.innerHTML = '';

            if (products.length > 0) {
                products.forEach(product => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${product.productName}: ${product.productQuantity} remaining`;
                    lowStockList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'No products with low stock.';
                lowStockList.appendChild(listItem);
            }

            // Show the modal
            lowStockModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching low stock products:', error);
        }
    };

    // Open the modal when the notification button is clicked
    notificationButton.addEventListener('click', fetchLowStockProducts);

    // Hide the notification dot when the "Accept Notification" button is clicked
    acceptNotificationBtn.addEventListener('click', () => {
        notificationDot.classList.remove('show'); // Hide the notification dot
        lowStockModal.classList.add('hidden'); // Close the modal
    });

    // Close the modal
    closeLowStockModal.addEventListener('click', () => {
        console.log('Close button clicked');
        lowStockModal.classList.add('hidden'); // Hide the modal
    });

    // Fetch metrics on page load
    fetchMetrics();

    // Update the notification dot on page load
    updateLowStockNotification();
});