document.addEventListener('DOMContentLoaded', () => {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const salesFormContainer = document.getElementById('salesFormContainer');
    const salesForm = document.getElementById('salesForm');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    const priceDisplay = document.getElementById('priceDisplay');
    const pastSalesTable = document.getElementById('pastSalesTable').querySelector('tbody');

    // Retrieve products from localStorage
    const stockData = JSON.parse(localStorage.getItem('products')) || [];

    // Example past sales data (replace with actual data from localStorage)
    const pastSales = JSON.parse(localStorage.getItem('sales')) || [];

    // Populate product dropdown
    const populateProductDropdown = () => {
        productSelect.innerHTML = '<option value="">Select a product</option>';
        stockData.forEach((product) => {
            if (product.productQuantity > 0) {
                const option = document.createElement('option');
                option.value = product.productName;
                option.textContent = `${product.productName} (Remaining: ${product.productQuantity})`;
                option.dataset.price = product.productPrice;
                option.dataset.remainingStock = product.productQuantity; // Store remaining stock in the option
                productSelect.appendChild(option);
            }
        });
    };

    // Populate past sales table
    const populatePastSalesTable = () => {
        pastSalesTable.innerHTML = '';
        pastSales.forEach((sale, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.productName}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.price.toFixed(2)}</td>
                <td>$${(sale.quantity * sale.price).toFixed(2)}</td>
                <td>${sale.date} ${sale.time}</td>
                <td>
                    <button class="edit-sale-btn" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-sale-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            pastSalesTable.appendChild(row);
        });

        // Attach event listeners to Edit and Delete buttons
        document.querySelectorAll('.edit-sale-btn').forEach((button) => {
            button.addEventListener('click', handleEditSale);
        });

        document.querySelectorAll('.delete-sale-btn').forEach((button) => {
            button.addEventListener('click', handleDeleteSale);
        });
    };

    // Handle Edit Sale
    const handleEditSale = (e) => {
        const saleIndex = e.target.closest('button').dataset.index;
        const sale = pastSales[saleIndex];

        // Populate the sales form with the selected sale's data
        productSelect.value = sale.productName;
        quantityInput.value = sale.quantity;
        priceDisplay.value = sale.price;

        // Store the index of the sale being edited
        salesForm.dataset.editIndex = saleIndex;

        // Show the sales form for editing
        salesFormContainer.classList.remove('hidden');
    };

    // Handle Delete Sale
    const handleDeleteSale = (e) => {
        const saleIndex = e.target.dataset.index;

        // Confirm deletion
        const confirmDelete = confirm('Are you sure you want to delete this sale?');
        if (confirmDelete) {
            // Remove the sale from the array and update localStorage
            pastSales.splice(saleIndex, 1);
            localStorage.setItem('sales', JSON.stringify(pastSales));

            // Refresh the table
            populatePastSalesTable();
        }
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

        // Check if editing an existing sale
        const editIndex = salesForm.dataset.editIndex;
        if (editIndex !== undefined) {
            // Update the existing sale
            pastSales[editIndex] = {
                productName,
                quantity,
                price,
                date: pastSales[editIndex].date, // Keep the original date
                time: pastSales[editIndex].time, // Keep the original time
            };
            delete salesForm.dataset.editIndex; // Clear the edit index
        } else {
            // Add a new sale
            const now = new Date();
            pastSales.push({
                productName,
                quantity,
                price,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString(),
            });

            // Update the inventory quantity
            const product = stockData.find((item) => item.productName === productName);
            if (product) {
                product.productQuantity -= quantity; // Reduce the quantity in inventory
                localStorage.setItem('products', JSON.stringify(stockData)); // Update inventory in localStorage
            }
        }

        // Update localStorage
        localStorage.setItem('sales', JSON.stringify(pastSales));

        // Refresh the table and reset the form
        populatePastSalesTable();
        populateProductDropdown(); // Refresh the dropdown to show updated stock
        salesForm.reset();
        salesFormContainer.classList.add('hidden');
    });

    // Initial population of past sales table
    populatePastSalesTable();
});