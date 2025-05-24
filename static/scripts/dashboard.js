document.addEventListener('DOMContentLoaded', () => {
    const todaySalesElement = document.getElementById('todaySales');
    const todayProfitElement = document.getElementById('todayProfit');
    const revenueElement = document.getElementById('revenue');
    const expensesElement = document.getElementById('expenses');
    

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

    // Fetch and update metrics on page load
    fetchMetrics();
});