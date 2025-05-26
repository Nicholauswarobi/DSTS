document.addEventListener('DOMContentLoaded', () => {
    const chartTypeSelector = document.getElementById('chartTypeSelector');
    const ctx = document.getElementById('dailyMetricsChart').getContext('2d');

    let currentChart;
    let chartTypes = ['bar', 'line', 'pie']; // Cycle through these chart types
    let currentChartIndex = 0; // Start with the first chart type

    const fetchDailyMetrics = async (month) => {
        try {
            const response = await fetch(`/get-daily-metrics?month=${month}`);
            if (!response.ok) {
                throw new Error('Failed to fetch daily metrics');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching daily metrics:', error);
            return null;
        }
    };

    const renderChart = (chartType, labels, revenueData, purchaseData, profitData, expensesData) => {
        if (currentChart) {
            currentChart.destroy(); // Destroy the existing chart before creating a new one
        }

        const datasets = [
            {
                label: 'Revenue',
                data: revenueData,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: '#36A2EB',
                borderWidth: 1,
            },
            {
                label: 'Purchase',
                data: purchaseData,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: '#FF6384',
                borderWidth: 1,
            },
            {
                label: 'Profit',
                data: profitData,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: '#4BC0C0',
                borderWidth: 1,
            },
            {
                label: 'Expenses',
                data: expensesData,
                backgroundColor: 'rgba(255, 206, 86, 0.6)',
                borderColor: '#FFCE56',
                borderWidth: 1,
            },
        ];

        // Configure the data object based on the chart type
        const data = {
            labels: labels, // Labels for bar/line charts
            datasets: datasets, // Datasets for bar/line charts
        };

        // Configure the options for the chart
        const options = {
            responsive: true, // Ensure the chart is responsive
            maintainAspectRatio: false, // Allow the chart to stretch to fit the container
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: `Daily Metrics (${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart)`,
                },
                datalabels: {
                    color: '#000', // Black text for bar chart
                    formatter: (value, context) => {
                        if (chartType === 'bar') {
                            // const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            // const percentage = ((value / total) * 100).toFixed(1);
                            // return `${percentage}%`; 
                        }
                        return null; // No labels for other chart types
                    },
                    font: {
                        weight: 'bold',
                    },
                    anchor: 'end', // Position at the top of the bar
                    align: 'end', // Align text inside the bar
                },
            },
            scales: { y: { beginAtZero: true } }, // Scales for bar/line charts
        };

        // Create the chart
        currentChart = new Chart(ctx, {
            type: chartType, // Chart type (bar, line, or pie)
            data: data,
            options: options,
            plugins: [ChartDataLabels], // Add the datalabels plugin
        });
    };

    const initializeChart = async () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // Get current month in YYYY-MM format
        const metrics = await fetchDailyMetrics(currentMonth);

        if (metrics) {
            const { labels, revenueData, purchaseData, profitData, expensesData } = metrics;

            // Start with the first chart type (Bar Chart)
            renderChart(chartTypes[currentChartIndex], labels, revenueData, purchaseData, profitData, expensesData);

            // Automatically cycle through chart types every 10 seconds
            setInterval(() => {
                currentChartIndex = (currentChartIndex + 1) % chartTypes.length; // Cycle through chart types
                const selectedChartType = chartTypes[currentChartIndex];
                chartTypeSelector.value = selectedChartType; // Update the dropdown to match the current chart type
                renderChart(selectedChartType, labels, revenueData, purchaseData, profitData, expensesData);
            }, 10000); // Change chart every 10 seconds
        }
    };

    // Initialize the chart on page load
    initializeChart();

    // Update the chart when the user manually selects a chart type
    chartTypeSelector.addEventListener('change', async (event) => {
        const selectedChartType = event.target.value;
        const currentMonth = new Date().toISOString().slice(0, 7); // Get current month in YYYY-MM format
        const metrics = await fetchDailyMetrics(currentMonth);

        if (metrics) {
            const { labels, revenueData, purchaseData, profitData, expensesData } = metrics;
            renderChart(selectedChartType, labels, revenueData, purchaseData, profitData, expensesData);
        }
    });
});
