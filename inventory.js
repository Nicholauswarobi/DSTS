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
        const productPurchase = row.cells[4].textContent; // Get Purchase value
        const dateAdded = row.cells[5].textContent;

        // Pass product details as query parameters
        window.location.href = `edit-product.html?productName=${encodeURIComponent(productName)}&quantity=${encodeURIComponent(productQuantity)}&price=${encodeURIComponent(productPrice)}&purchase=${encodeURIComponent(productPurchase)}&dateAdded=${encodeURIComponent(dateAdded)}`;
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
            // Get the current products from localStorage
            const products = JSON.parse(localStorage.getItem('products')) || [];

            // Get the names of the selected products
            const selectedProductNames = Array.from(selectedRows).map((row) => {
                const rowElement = row.closest('tr');
                return rowElement.cells[1].textContent; // Assuming the product name is in the 2nd column
            });

            // Filter out the selected products
            const updatedProducts = products.filter(
                (product) => !selectedProductNames.includes(product.productName)
            );

            // Update localStorage with the remaining products
            localStorage.setItem('products', JSON.stringify(updatedProducts));

            // Reload the page to refresh the table
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

// Populate Inventory Table
const populateInventoryTable = () => {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
    inventoryTable.innerHTML = ''; // Clear existing rows

    products.forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="selectRow"></td>
            <td>${product.productName}</td>
            <td>${product.productQuantity}</td>
            <td>$${product.productPrice.toFixed(2)}</td>
            <td>$${product.productPurchase.toFixed(2)}</td> <!-- New Purchase Column -->
            <td>${product.dateAdded}</td>
        `;
        inventoryTable.appendChild(row);
    });
};

// Initial population of the inventory table
populateInventoryTable();