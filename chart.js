document.addEventListener('DOMContentLoaded', () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const today = new Date().toLocaleDateString();

    // Calculate Total Stock In
    const totalStockIn = products.reduce((sum, product) => sum + parseInt(product.productQuantity || 0, 10), 0);

    // Calculate Total Stock Out
    const totalStockOut = sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);

    // Calculate Remaining Stock
    // const remainingStock = totalStockIn - totalStockOut;

    // Calculate Total Revenue
    const revenue = sales.reduce((sum, sale) => sum + (sale.quantity * sale.price || 0), 0);

    // Filter sales for today
    const todaySales = sales.filter((sale) => sale.date === today);
    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + (sale.quantity * sale.price || 0), 0);

    // Calculate Today's Profit
    const todayProfit = todaySales.reduce((sum, sale) => {
        const product = products.find((p) => p.productName === sale.productName);
        const costPrice = product ? parseFloat(product.productPurchase || 0) : 0; // Use productPurchase for cost price
        return sum + ((sale.price - costPrice) * sale.quantity || 0);
    }, 0);

    // Calculate Total Expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.expenseAmount || 0), 0);

    // Update metrics in the DOM
    document.getElementById('totalStockIn').textContent = totalStockIn;
    document.getElementById('totalStockOut').textContent = totalStockOut;
    document.getElementById('revenue').textContent = `TSH ${revenue.toFixed(2)}`;
    document.getElementById('todaySales').textContent = `TSH ${todaySalesTotal.toFixed(2)}`;
    document.getElementById('todayProfit').textContent = `TSH ${todayProfit.toFixed(2)}`;
    document.getElementById('expenses').textContent = `TSH ${totalExpenses.toFixed(2)}`;

    document.getElementById('calendarFilter').addEventListener('change', (event) => {
        const selectedDate = event.target.value; // Get the selected date
        console.log('Selected Date:', selectedDate);

        // Example: Filter sales data by the selected date
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        const filteredSales = sales.filter((sale) => sale.date === selectedDate);

        console.log('Filtered Sales:', filteredSales);

        // Update metrics or charts based on the filtered sales
        // ...
    });
});