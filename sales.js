document.addEventListener('DOMContentLoaded', () => {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const salesFormContainer = document.getElementById('salesFormContainer');
    const salesForm = document.getElementById('salesForm');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    const priceDisplay = document.getElementById('priceDisplay');
    const pastSalesTable = document.getElementById('pastSalesTable').querySelector('tbody');

    // Example stock data (replace with actual data from localStorage)
    const stockData = [
        { productName: 'Hammer', quantity: 10, price: 15 },
        { productName: 'Nails', quantity: 50, price: 0.5 },
        { productName: 'Screwdriver', quantity: 20, price: 8 },
    ];

    // Example past sales data (replace with actual data from localStorage)
    const pastSales = JSON.parse(localStorage.getItem('sales')) || [];

    // Populate product dropdown
    const populateProductDropdown = () => {
        productSelect.innerHTML = '<option value="">Select a product</option>';
        stockData.forEach((product) => {
            if (product.quantity > 0) {
                const option = document.createElement('option');
                option.value = product.productName;
                option.textContent = `${product.productName} (Available: ${product.quantity})`;
                option.dataset.price = product.price;
                productSelect.appendChild(option);
            }
        });
    };

    // Populate past sales table
    const populatePastSalesTable = () => {
        pastSalesTable.innerHTML = '';
        pastSales.forEach((sale) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.productName}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.price.toFixed(2)}</td>
                <td>$${(sale.quantity * sale.price).toFixed(2)}</td>
                <td>${sale.date}</td>
            `;
            pastSalesTable.appendChild(row);
        });
    };

    // Show sales form on button click
    addSaleBtn.addEventListener('click', () => {
        salesFormContainer.classList.toggle('hidden');
        populateProductDropdown();
    });

    // Update price when product is selected
    productSelect.addEventListener('change', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        priceDisplay.value = selectedOption.dataset.price || '';
    });

    // Handle form submission
    salesForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productName = productSelect.value;
        const quantity = parseInt(quantityInput.value, 10);
        const price = parseFloat(priceDisplay.value);

        if (!productName || quantity <= 0 || isNaN(price)) {
            alert('Please fill out all fields correctly.');
            return;
        }

        // Update stock
        const product = stockData.find((item) => item.productName === productName);
        if (product && product.quantity >= quantity) {
            product.quantity -= quantity;

            // Add sale to past sales
            const sale = {
                productName,
                quantity,
                price,
                date: new Date().toLocaleDateString(),
            };
            pastSales.push(sale);
            localStorage.setItem('sales', JSON.stringify(pastSales));

            // Refresh UI
            populateProductDropdown();
            populatePastSalesTable();
            salesForm.reset();
            salesFormContainer.classList.add('hidden');
        } else {
            alert('Insufficient stock for the selected product.');
        }
    });

    // Initial population of past sales table
    populatePastSalesTable();
});