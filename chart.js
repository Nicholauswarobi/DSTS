document.addEventListener('DOMContentLoaded', () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const sales = JSON.parse(localStorage.getItem('sales')) || [];

    // Get today's date in the same format as stored in sales
    const today = new Date().toLocaleDateString();

    // Calculate Total Stock In (sum of all product quantities in the store)
    const totalStockIn = products.reduce((sum, product) => sum + parseInt(product.productQuantity, 10), 0);

    // Calculate Total Stock Out (sum of all quantities sold)
    const totalStockOut = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Calculate Remaining Stock (Total Stock In - Total Stock Out)
    const remainingStock = totalStockIn - totalStockOut;

    // Calculate Revenue (sum of all sales revenue)
    const revenue = sales.reduce((sum, sale) => sum + sale.quantity * sale.price, 0);

    // Filter sales for today
    const todaySales = sales.filter((sale) => sale.date === today);
    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.quantity * sale.price, 0);

    // Calculate Today's Profit
    const todayProfit = todaySales.reduce((sum, sale) => {
        const product = products.find((p) => p.productName === sale.productName);
        const costPrice = product ? parseFloat(product.productPrice) : 0; // Assuming cost price is stored in productPrice
        return sum + (sale.price - costPrice) * sale.quantity;
    }, 0);

    // Update metrics in the DOM
    document.getElementById('totalStockIn').textContent = totalStockIn;
    document.getElementById('totalStockOut').textContent = totalStockOut;
    document.getElementById('remainingStock').textContent = remainingStock;
    document.getElementById('revenue').textContent = `$${revenue.toFixed(2)}`;
    document.getElementById('todaySales').textContent = `$${todaySalesTotal.toFixed(2)}`;
    document.getElementById('todayProfit').textContent = `$${todayProfit.toFixed(2)}`;
});