const calendarBody = document.getElementById('calendarBody');
const currentMonth = document.getElementById('currentMonth');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const resetToTodayButton = document.getElementById('resetToToday'); // Button for resetting to today

let date = new Date();

// Function to render the calendar
const renderCalendar = () => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();

    // Set the current month name
    currentMonth.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Get the first and last day of the month
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Clear the calendar body
    calendarBody.innerHTML = '';

    // Generate calendar rows
    let day = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < firstDay) {
                // Empty cells before the first day
                cell.textContent = '';
            } else if (day > lastDate) {
                // Empty cells after the last day
                cell.textContent = '';
            } else {
                // Fill in the day
                cell.textContent = day;
                cell.classList.add('calendar-day');

                // Highlight today's date
                if (
                    year === today.getFullYear() &&
                    month === today.getMonth() &&
                    day === today.getDate()
                ) {
                    cell.classList.add('today');
                }

                const currentDay = day; // Capture the correct value
                cell.addEventListener('click', () => {
                    const selectedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
                    fetchMetricsByDate(selectedDate);
                });

                day++;
            }

            row.appendChild(cell);
        }

        calendarBody.appendChild(row);
    }
};

// Function to fetch metrics by the selected date
const fetchMetricsByDate = (selectedDate) => {
    // Validate the selected date
    const dateParts = selectedDate.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);

    const isValidDate = (year, month, day) => {
        const date = new Date(year, month - 1, day); // JavaScript months are 0-based
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    };

    if (!isValidDate(year, month, day)) {
        console.error('Invalid date selected:', selectedDate);
        alert('Invalid date selected. Please choose a valid date.');
        return;
    }

    // Fetch metrics for the valid date
    fetch(`/get-metrics-by-date?date=${selectedDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Metrics by Date:', data); // Debugging log

            // Update the UI
            document.getElementById('todaySales').textContent = `TSH ${data.total_sales}`;
            document.getElementById('todayProfit').textContent = `TSH ${data.profit}`;
            document.getElementById('revenue').textContent = `TSH ${data.revenue}`;
            document.getElementById('expenses').textContent = `TSH ${data.expenses}`;
            document.getElementById('stockInValue').textContent = data.stock_in;
            document.getElementById('stockOutValue').textContent = data.stock_out;

            // Update top products table
            const topProductsTableBody = document.getElementById('topProductsTableBody');
            topProductsTableBody.innerHTML = ''; // Clear existing rows
            data.top_products.forEach(product => {
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
        .catch(error => console.error('Error fetching metrics by date:', error));
};

// Event listeners for navigation buttons
prevMonth.addEventListener('click', () => {
    date.setMonth(date.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener('click', () => {
    date.setMonth(date.getMonth() + 1);
    renderCalendar();
});

// Event listener for resetting to today
resetToTodayButton.addEventListener('click', () => {
    date = new Date(); // Reset the date to today
    renderCalendar(); // Re-render the calendar
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    fetchMetricsByDate(today); // Fetch metrics for today
});

// Render the calendar on page load
document.addEventListener('DOMContentLoaded', () => {
    renderCalendar();
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    fetchMetricsByDate(today); // Fetch metrics for today on page load
});