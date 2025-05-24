document.addEventListener('DOMContentLoaded', () => {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const salesFormContainer = document.getElementById('salesFormContainer');
    const cancelSaleBtn = document.getElementById('cancelSaleBtn');
    const salesForm = document.getElementById('salesForm');
    const productSelect = document.getElementById('productSelect');
    const priceDisplay = document.getElementById('priceDisplay');
    const pastSalesTableBody = document.querySelector('#pastSalesTable tbody');
    const editSaleModal = document.getElementById('editSaleModal');
    const closeEditSaleModal = document.getElementById('closeEditSaleModal');
    const editSaleForm = document.getElementById('editSaleForm');
    const editSaleId = document.getElementById('editSaleId');
    const editQuantity = document.getElementById('editQuantity');
    const editPaymentMethod = document.getElementById('editPaymentMethod');
    const cancelEditSale = document.getElementById('cancelEditSale');

    // Show the sales form
    addSaleBtn.addEventListener('click', () => {
        salesFormContainer.classList.remove('hidden');
    });

    // Hide the sales form
    cancelSaleBtn.addEventListener('click', () => {
        salesFormContainer.classList.add('hidden');
    });

    // Function to fetch and populate the product dropdown
    function loadProducts() {
        fetch('/get-products')
            .then(response => response.json())
            .then(products => {
                // Clear the dropdown
                productSelect.innerHTML = '<option value="">Select a product</option>';

                // Populate the dropdown with products
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify(product); // Store product data as JSON string
                    option.textContent = `${product.name} (Available: ${product.quantity})`;
                    productSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Update price display when a product is selected
    productSelect.addEventListener('change', () => {
        const selectedProduct = JSON.parse(productSelect.value);
        priceDisplay.value = selectedProduct ? selectedProduct.price : '';
    });

    // Handle form submission
    salesForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const productData = JSON.parse(productSelect.value);
        const quantityInput = document.getElementById('quantityInput').value;
        const paymentMethod = document.getElementById('paymentMethod').value;

        // Validate quantity
        if (quantityInput > productData.quantity) {
            alert('Insufficient stock available!');
            return;
        }

        // Send the sale data to the backend
        fetch('/add-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName: productData.name,
                quantity: quantityInput,
                price: productData.price,
                paymentMethod,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert('Sale recorded successfully!');
                    // Reload the sales table and product dropdown
                    loadSalesData();
                    loadProducts();
                }
            })
            .catch(error => console.error('Error saving sale:', error));

        // Reset the form and hide it
        salesForm.reset();
        salesFormContainer.classList.add('hidden');
    });

    // Function to fetch and display sales data
    function loadSalesData() {
        fetch('/get-sales')
            .then(response => response.json())
            .then(sales => {
                const pastSalesTableBody = document.querySelector('#pastSalesTable tbody');
                // Clear the table body
                pastSalesTableBody.innerHTML = '';

                // Populate the table with sales data
                sales.forEach(sale => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${sale.productName}</td>
                        <td>${sale.quantitySold}</td>
                        <td>${sale.pricePerUnit.toFixed(2)}</td>
                        <td>${sale.totalPrice.toFixed(2)}</td>
                        <td>${sale.paymentMethod}</td>
                        <td>${sale.saleDate}</td>
                        <td>
                            <button class="edit-sale-btn" data-id="${sale.id}" data-quantity="${sale.quantitySold}" data-payment="${sale.paymentMethod}">Edit</button>
                            <button class="delete-sale-btn" data-id="${sale.id}">Delete</button>
                        </td>
                    `;

                    pastSalesTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching sales data:', error));
    }

    // Show the modal when the "Edit" button is clicked
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-sale-btn')) {
            const saleId = e.target.dataset.id;
            console.log('Sale ID:', saleId); // Debugging line
            const quantity = e.target.dataset.quantity;
            const paymentMethod = e.target.dataset.payment;

            // Populate the modal fields
            document.getElementById('editSaleId').value = saleId;
            document.getElementById('editQuantity').value = quantity;
            document.getElementById('editPaymentMethod').value = paymentMethod;

            // Show the modal
            editSaleModal.classList.remove('hidden');
        }
    });

    // Close the modal when the "Close" button is clicked
    closeEditSaleModal.addEventListener('click', () => {
        editSaleModal.classList.add('hidden');
    });

    // Close the modal when the "Cancel" button is clicked
    cancelEditSale.addEventListener('click', () => {
        editSaleModal.classList.add('hidden');
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === editSaleModal) {
            editSaleModal.classList.add('hidden');
        }
    });

    // Handle edit form submission
    editSaleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const saleId = editSaleId.value;
        const quantity = editQuantity.value;
        const paymentMethod = editPaymentMethod.value;

        fetch('/update-sale', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                saleId,
                quantity,
                paymentMethod,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(`Error: ${data.error}`);
                } else {
                    alert('Sale updated successfully!');
                    // Reload the sales table and product dropdown
                    loadSalesData();
                    loadProducts();
                }
            })
            .catch(error => console.error('Error updating sale:', error));

        // Hide the modal
        editSaleModal.classList.add('hidden');
    });

    // Function to handle adding a product
    function addProduct(data) {
        fetch('/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    alert(`Error: ${result.error}`);
                } else {
                    alert('Product added successfully!');
                    // Reload the sales table
                    loadSalesData();
                }
            })
            .catch(error => console.error('Error adding product:', error));
    }

    // Load sales data and products when the page loads
    loadSalesData();
    loadProducts();
});
