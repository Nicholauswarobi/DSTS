// Select form and table elements
const inventoryTable = document.getElementById('inventoryTable').querySelector('tbody');
const addProductBtn = document.getElementById('addProductBtn');
const editProductBtn = document.getElementById('editProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');

let selectedRow = null;

// Redirect to Add Product Page
addProductBtn.addEventListener('click', () => {
    window.location.href = 'add-product.html'; // Ensure this file exists in the same directory
});

// Redirect to Edit Product Page
editProductBtn.addEventListener('click', () => {
    if (selectedRow) {
        const productName = selectedRow.cells[1].textContent;
        const productQuantity = selectedRow.cells[2].textContent;
        const productPrice = selectedRow.cells[3].textContent;

        // Pass product details as query parameters
        window.location.href = `edit-product.html?productName=${encodeURIComponent(productName)}&quantity=${encodeURIComponent(productQuantity)}&price=${encodeURIComponent(productPrice)}`;
    } else {
        alert('Please select a product to edit.');
    }
});

// Delete Product
deleteProductBtn.addEventListener('click', () => {
    if (selectedRow) {
        const productName = selectedRow.cells[1].textContent;

        // Confirm deletion
        const confirmDelete = confirm(`Are you sure you want to delete the product "${productName}"?`);
        if (confirmDelete) {
            inventoryTable.removeChild(selectedRow);
            selectedRow = null;
            editProductBtn.disabled = true;
            deleteProductBtn.disabled = true;
        }
    } else {
        alert('Please select a product to delete.');
    }
});

// Handle row selection
document.getElementById('inventoryTable').addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
        selectedRow = e.target.closest('tr');
        editProductBtn.disabled = false;
        deleteProductBtn.disabled = false;
    }
});