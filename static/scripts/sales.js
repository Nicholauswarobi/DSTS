document.addEventListener('DOMContentLoaded', () => {
    const addSaleBtn = document.getElementById('addSaleBtn');
    const salesFormModal = document.getElementById('salesFormModal');
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
    const deleteSaleModal = document.getElementById('deleteSaleModal');
    const confirmDeleteSaleBtn = document.getElementById('confirmDeleteSaleBtn');
    const cancelDeleteSaleBtn = document.getElementById('cancelDeleteSaleBtn');
    let saleIdToDelete = null;

    // Show the sales form modal
    addSaleBtn.addEventListener('click', () => {
        salesFormModal.classList.remove('hidden');
    });

    // Hide the sales form modal
    cancelSaleBtn.addEventListener('click', () => {
        salesFormModal.classList.add('hidden');
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === salesFormModal) {
            salesFormModal.classList.add('hidden');
        }
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

        const productData = JSON.parse(document.getElementById('productSelect').value);
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
                    showSalesNotification(`Error: ${data.error}`, 'error');
                } else {
                    showSalesNotification('Sale recorded successfully!');
                    // Reload the sales table and product dropdown
                    loadSalesData();
                    loadProducts();
                }
            })
            .catch(error => console.error('Error saving sale:', error));

        // Reset the form and hide the modal
        salesForm.reset();
        salesFormModal.classList.add('hidden');
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
            const quantity = e.target.dataset.quantity;
            const paymentMethod = e.target.dataset.payment;

            // Debugging: Log the saleId
            console.log('Sale ID:', saleId);

            if (!saleId || saleId === "undefined") {
                alert("Sale ID is missing.");
                return;
            }

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
                    showSalesNotification(`Error: ${result.error}`, 'error');
                } else {
                    showSalesNotification('Product added successfully!');
                    // Reload the sales table
                    loadSalesData();
                }
            })
            .catch(error => console.error('Error adding product:', error));
    }

    // Handle edit form submission
    editSaleForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const saleId = document.getElementById('editSaleId').value;
        const quantity = document.getElementById('editQuantity').value;
        const paymentMethod = document.getElementById('editPaymentMethod').value;

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
                    showSalesNotification(`Error: ${data.error}`, 'error');
                } else {
                    showSalesNotification('Sale updated successfully!');
                    // Reload the sales table and product dropdown
                    loadSalesData();
                    loadProducts();
                }
            })
            .catch(error => console.error('Error updating sale:', error));

        // Hide the modal
        editSaleModal.classList.add('hidden');
    });

    // Show the delete sale modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-sale-btn')) {
            saleIdToDelete = e.target.dataset.id;
            deleteSaleModal.classList.add('show');
        }
    });

    // Handle the "Yes, Delete" button
    confirmDeleteSaleBtn.addEventListener('click', () => {
        if (!saleIdToDelete) return;

        fetch(`/delete-sale/${saleIdToDelete}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showSalesNotification(`Error: ${data.error}`, 'error');
                } else {
                    showSalesNotification('Sale deleted successfully!');
                    // Reload the sales table and product dropdown
                    loadSalesData();
                    loadProducts();
                }
            })
            .catch(error => console.error('Error deleting sale:', error))
            .finally(() => {
                // Hide the modal
                deleteSaleModal.classList.remove('show');
                saleIdToDelete = null;
            });
    });

    // Handle the "Cancel" button
    cancelDeleteSaleBtn.addEventListener('click', () => {
        deleteSaleModal.classList.remove('show');
        saleIdToDelete = null;
    });

    // Close the modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === deleteSaleModal) {
            deleteSaleModal.classList.remove('show');
            saleIdToDelete = null;
        }
    });

    // Load sales data and products when the page loads
    loadSalesData();
    loadProducts();

    // Function to show sales notifications
    function showSalesNotification(message, type = 'success') {
        const notification = document.getElementById('salesNotification');
        if (!notification) {
            console.error('Notification container not found!');
            return;
        }

        // Set the message and apply the appropriate class
        notification.textContent = message;
        notification.className = `sales-notification ${type}`;
        notification.classList.add('show');

        // Hide the notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
