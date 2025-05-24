// Select form and table elements
const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
const addProductBtn = document.getElementById('addProductBtn');
const editProductBtn = document.getElementById('editProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');

// Disable buttons by default
editProductBtn.disabled = true;
deleteProductBtn.disabled = true;

// Redirect to Edit Product Page
// Handle the Edit Product Button Click
editProductBtn.addEventListener('click', async () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    if (selectedRows.length === 1) {
        const row = selectedRows[0].closest('tr');
        const productId = row.dataset.productId;

        console.log('Selected Product ID:', productId); // Debugging log

        if (!productId) {
            alert('Product ID is missing. Please try again.');
            return;
        }

        try {
            // Fetch product details from the server
            const response = await fetch(`/edit-product/${productId}`, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Failed to fetch product details. Status: ${response.status}`);
            }

            const product = await response.json();
            console.log('Fetched Product Details:', product); // Debugging log

            // Populate the modal with product details
            document.getElementById('editProductId').value = product.id;
            document.getElementById('editProductName').value = product.productName;
            document.getElementById('editProductQuantity').value = product.productQuantity;
            document.getElementById('editProductPrice').value = product.productPrice;
            document.getElementById('editProductPurchase').value = product.productPurchase;
            document.getElementById('editManufacturedDate').value = product.manufacturedDate;
            document.getElementById('editExpiredDate').value = product.expiredDate;

            // Show the modal
            const modal = document.getElementById('editProductModalContainer');
            modal.style.display = 'block'; // Show the modal
            console.log('Modal should now be visible'); // Debugging log
        } catch (error) {
            console.error('Error fetching product details:', error); // Log the error
            alert('Failed to load product details. Please try again.');
        }
    } else {
        alert('Please select exactly one product to edit.');
    }
});

// Close the Edit Product Modal
document.getElementById('closeEditProductModal').addEventListener('click', () => {
    document.getElementById('editProductModalContainer').style.display = 'none'; // Hide the modal
});

// Cancel Button Functionality
document.getElementById('cancelEditProduct').addEventListener('click', () => {
    document.getElementById('editProductModalContainer').style.display = 'none'; // Hide the modal
});

// Delete Product
deleteProductBtn.addEventListener('click', async () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    if (selectedRows.length > 0) {
        const confirmDelete = confirm(`Are you sure you want to delete ${selectedRows.length} product(s)?`);
        if (confirmDelete) {
            const productIds = Array.from(selectedRows).map(row => row.closest('tr').dataset.productId);

            try {
                for (const productId of productIds) {
                    await fetch(`/delete-product/${productId}`, {
                        method: 'DELETE',
                    });
                }
                showNotification('Product(s) deleted successfully!');
                populateInventoryTable(); // Refresh the table
            } catch (error) {
                showNotification('Failed to delete product(s). Please try again.');
            }
        }
    } else {
        showNotification('Please select at least one product to delete.');
    }
});

// Enable/Disable buttons based on selection
document.addEventListener('change', () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    deleteProductBtn.disabled = selectedRows.length === 0; // Enable Delete if at least one row is selected
    editProductBtn.disabled = selectedRows.length !== 1;  // Enable Edit only if exactly one row is selected
});

// Populate Inventory Table
const populateInventoryTable = async () => {
    try {
        const response = await fetch('/inventory-data'); // Fetch data from the server
        if (!response.ok) {
            throw new Error('Failed to fetch inventory data.');
        }

        const products = await response.json();
        inventoryTable.innerHTML = ''; // Clear existing rows

        products.forEach(product => {
            const row = document.createElement('tr');
            row.dataset.productId = product.id; // Store product ID in a data attribute
            row.innerHTML = `
                <td><input type="checkbox" class="selectRow"></td>
                <td>${product.productName}</td>
                <td>${product.productQuantity}</td>
                <td>TZS ${parseFloat(product.productPrice).toFixed(2)}</td>
                <td>TZS ${parseFloat(product.productPurchase).toFixed(2)}</td>
                <td>${product.manufacturedDate}</td>
                <td>${product.expiredDate}</td>
                <td>${product.dateAdded}</td>
            `;
            inventoryTable.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        alert('Failed to load inventory data. Please try again.');
    }
};

// Initial population of the inventory table
populateInventoryTable();

document.addEventListener('DOMContentLoaded', () => {
    // Add Product Modal Elements
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const cancelAddProduct = document.getElementById('cancelAddProduct');

    // Edit Product Modal Elements
    const editProductBtn = document.getElementById('editProductBtn');
    const editProductModal = document.getElementById('editProductModalContainer');
    const cancelEditProduct = document.getElementById('cancelEditProduct');
    const closeEditProductModal = document.getElementById('closeEditProductModal');

    // Show the Add Product Modal
    addProductBtn.addEventListener('click', () => {
        console.log('Add Product button clicked'); // Debugging log
        addProductModal.style.display = 'block'; // Show the Add Product modal
    });

    // Hide the Add Product Modal
    cancelAddProduct.addEventListener('click', () => {
        console.log('Cancel Add Product button clicked'); // Debugging log
        addProductModal.style.display = 'none'; // Hide the Add Product modal
    });

    // Show the Edit Product Modal
    editProductBtn.addEventListener('click', async () => {
        const selectedRows = document.querySelectorAll('.selectRow:checked');
        if (selectedRows.length === 1) {
            const row = selectedRows[0].closest('tr');
            const productId = row.dataset.productId;

            console.log('Selected Product ID:', productId); // Debugging log

            if (!productId) {
                alert('Product ID is missing. Please try again.');
                return;
            }

            try {
                // Fetch product details from the server
                const response = await fetch(`/edit-product/${productId}`, { method: 'GET' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch product details. Status: ${response.status}`);
                }

                const product = await response.json();
                console.log('Fetched Product Details:', product); // Debugging log

                // Populate the modal with product details
                document.getElementById('editProductId').value = product.id;
                document.getElementById('editProductName').value = product.productName;
                document.getElementById('editProductQuantity').value = product.productQuantity;
                document.getElementById('editProductPrice').value = product.productPrice;
                document.getElementById('editProductPurchase').value = product.productPurchase;
                document.getElementById('editManufacturedDate').value = product.manufacturedDate;
                document.getElementById('editExpiredDate').value = product.expiredDate;

                // Show the Edit Product modal
                editProductModal.style.display = 'block';
            } catch (error) {
                console.error('Error fetching product details:', error); // Log the error
                alert('Failed to load product details. Please try again.');
            }
        } else {
            alert('Please select exactly one product to edit.');
        }
    });

    // Hide the Edit Product Modal
    cancelEditProduct.addEventListener('click', () => {
        console.log('Cancel Edit Product button clicked'); // Debugging log
        editProductModal.style.display = 'none'; // Hide the Edit Product modal
    });

    // Close the Edit Product Modal
    closeEditProductModal.addEventListener('click', () => {
        console.log('Close Edit Product button clicked'); // Debugging log
        editProductModal.style.display = 'none'; // Hide the Edit Product modal
    });

    // Function to show the notification popup
    const showNotification = (message, type = 'success') => {
        const notificationPopup = document.getElementById('notificationPopup');
        const notificationMessage = document.getElementById('notificationMessage');

        // Set the message and apply the appropriate class
        notificationMessage.textContent = message;
        notificationPopup.className = `notification ${type}`;
        notificationPopup.classList.add('show');

        // Automatically hide the notification after 3 seconds
        setTimeout(() => {
            notificationPopup.classList.remove('show');
        }, 3000);
    };

   
    // Handle Add Product Form Submission
    document.getElementById('addProductForm').addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission

        const productName = document.getElementById('productName').value;
        const productQuantity = document.getElementById('productQuantity').value;
        const productPrice = document.getElementById('productPrice').value;
        const productPurchase = document.getElementById('productPurchase').value;
        const manufacturedDate = document.getElementById('manufacturedDate').value;
        const expiredDate = document.getElementById('expiredDate').value;

        try {
            const response = await fetch('/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName,
                    productQuantity,
                    productPrice,
                    productPurchase,
                    manufacturedDate,
                    expiredDate,
                }),
            });

            if (response.ok) {
                showNotification('Product added successfully!');
                addProductModal.style.display = 'none';
                addProductForm.reset();
                await populateInventoryTable(); // Reload the table to apply changes
            } else {
                showNotification('Failed to add product. Please try again.');
            }
        } catch (error) {
            console.error(error);
            showNotification('An error occurred while adding the product. Please try again.');
        }
    });

    // Handle Edit Product Form Submission
    document.getElementById('editProductForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = document.getElementById('editProductId').value;
        const productName = document.getElementById('editProductName').value;
        const productQuantity = document.getElementById('editProductQuantity').value;
        const productPrice = document.getElementById('editProductPrice').value;
        const productPurchase = document.getElementById('editProductPurchase').value;
        const manufacturedDate = document.getElementById('editManufacturedDate').value;
        const expiredDate = document.getElementById('editExpiredDate').value;

        try {
            const response = await fetch(`/edit-product/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productName,
                    productQuantity,
                    productPrice,
                    productPurchase,
                    manufacturedDate,
                    expiredDate,
                }),
            });

            if (response.ok) {
                showNotification('Product updated successfully!');
                editProductModal.style.display = 'none';
                populateInventoryTable(); // Refresh the table
            } else {
                showNotification('Failed to update product. Please try again.');
            }
        } catch (error) {
            console.error(error);
            showNotification('An error occurred while updating the product. Please try again.');
        }
    });

    deleteProductBtn.addEventListener('click', async () => {
        const selectedRows = document.querySelectorAll('.selectRow:checked');
        if (selectedRows.length > 0) {
            const confirmDelete = confirm(`Are you sure you want to delete ${selectedRows.length} product(s)?`);
            if (confirmDelete) {
                const productIds = Array.from(selectedRows).map(row => row.closest('tr').dataset.productId);

                try {
                    for (const productId of productIds) {
                        await fetch(`/delete-product/${productId}`, {
                            method: 'DELETE',
                        });
                    }
                    showNotification('Product(s) deleted successfully!');
                    populateInventoryTable();
                } catch (error) {
                    showNotification('Failed to delete product(s). Please try again.');
                }
            }
        } else {
            showNotification('Please select at least one product to delete.');
        }
    });
});