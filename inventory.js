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

// Edit Product
editProductBtn.addEventListener('click', () => {
    if (selectedRow) {
        const productName = prompt('Edit Product Name:', selectedRow.cells[1].textContent);
        const productQuantity = prompt('Edit Product Quantity:', selectedRow.cells[2].textContent);
        const productPrice = prompt('Edit Product Price:', selectedRow.cells[3].textContent);

        if (productName && productQuantity && productPrice) {
            const totalValue = (productQuantity * productPrice).toFixed(2);

            selectedRow.cells[1].textContent = productName;
            selectedRow.cells[2].textContent = productQuantity;
            selectedRow.cells[3].textContent = productPrice;
            selectedRow.cells[4].textContent = totalValue;
        }
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