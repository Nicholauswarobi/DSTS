// Select form and table elements
const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
const addProductBtn = document.getElementById('addProductBtn');
const editProductBtn = document.getElementById('editProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');

// Disable buttons by default
editProductBtn.disabled = true;
deleteProductBtn.disabled = true;

// Redirect to Add Product Page
addProductBtn.addEventListener('click', () => {
    window.location.href = 'add-product.html';
});

// Redirect to Edit Product Page
editProductBtn.addEventListener('click', () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    if (selectedRows.length === 1) {
        const row = selectedRows[0].closest('tr');
        const productName = row.cells[1].textContent;
        const productQuantity = row.cells[2].textContent;
        const productPrice = row.cells[3].textContent;
        const dateAdded = row.cells[5].textContent; // Retrieve the date from the 6th column

        // Pass product details as query parameters
        window.location.href = `edit-product.html?productName=${encodeURIComponent(productName)}&quantity=${encodeURIComponent(productQuantity)}&price=${encodeURIComponent(productPrice)}&dateAdded=${encodeURIComponent(dateAdded)}`;
    } else {
        alert('Please select exactly one product to edit.');
    }
});

// Delete Product
deleteProductBtn.addEventListener('click', () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    if (selectedRows.length > 0) {
        const confirmDelete = confirm(`Are you sure you want to delete ${selectedRows.length} product(s)?`);
        if (confirmDelete) {
            const products = JSON.parse(localStorage.getItem('products')) || [];
            const updatedProducts = products.filter((product) => {
                // Check if the product is not selected for deletion
                return !Array.from(selectedRows).some((row) => {
                    const rowElement = row.closest('tr');
                    return (
                        rowElement.cells[1].textContent === product.productName &&
                        rowElement.cells[2].textContent === product.productQuantity &&
                        rowElement.cells[3].textContent === product.productPrice
                    );
                });
            });

            // Update localStorage and reload the table
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            window.location.reload();
        }
    } else {
        alert('Please select at least one product to delete.');
    }
});

// Enable/Disable buttons based on selection
document.addEventListener('change', () => {
    const selectedRows = document.querySelectorAll('.selectRow:checked');
    deleteProductBtn.disabled = selectedRows.length === 0; // Enable Delete if at least one row is selected
    editProductBtn.disabled = selectedRows.length !== 1;  // Enable Edit only if exactly one row is selected
});