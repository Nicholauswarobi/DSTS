document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const expenseModal = document.getElementById('expenseModal');
    const openExpenseModal = document.getElementById('openExpenseModal');
    const closeExpenseModal = document.getElementById('closeExpenseModal');
    const confirmationPopup = document.getElementById('confirmationPopup');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationMessage = document.getElementById('notificationMessage');
    let expenseIdToDelete = null; // Store the ID of the expense to delete

    // Open Expense Modal
    openExpenseModal.addEventListener('click', () => {
        expenseModal.classList.remove('hidden');
    });

    // Close Expense Modal
    closeExpenseModal.addEventListener('click', () => {
        expenseModal.classList.add('hidden');
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === expenseModal) {
            expenseModal.classList.add('hidden');
        }
    });

    // Handle adding expenses
    const expenseForm = document.getElementById('expenseForm');
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const description = document.getElementById('expenseName').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);

        fetch('/add-expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ description, amount }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add expense');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                populateExpenseTable();
                expenseForm.reset();
                expenseModal.classList.add('hidden');
            })
            .catch(error => console.error('Error adding expense:', error));
    });

    // Function to show the confirmation popup
    const showConfirmationPopup = (expenseId) => {
        expenseIdToDelete = expenseId; // Store the expense ID
        confirmationPopup.classList.remove('hidden');
    };

    // Function to hide the confirmation popup
    const hideConfirmationPopup = () => {
        confirmationPopup.classList.add('hidden');
        expenseIdToDelete = null; // Reset the expense ID
    };

    // Function to show the notification popup
    const showNotification = (message) => {
        notificationMessage.textContent = message;
        notificationPopup.classList.remove('hidden');

        // Automatically hide the notification after 3 seconds
        setTimeout(() => {
            notificationPopup.classList.add('hidden');
        }, 3000);
    };

    // Handle delete button clicks
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-button')) {
            const expenseId = event.target.getAttribute('data-id');
            showConfirmationPopup(expenseId); // Show confirmation popup
        }
    });

    // Handle confirmation of delete
    confirmDeleteButton.addEventListener('click', () => {
        if (expenseIdToDelete) {
            fetch(`/delete-expense/${expenseIdToDelete}`, {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete expense');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data.message);
                    populateExpenseTable(); // Refresh the table
                    showNotification('Expense deleted successfully!'); // Show notification
                })
                .catch(error => {
                    console.error('Error deleting expense:', error);
                    showNotification('Failed to delete expense.');
                })
                .finally(() => {
                    hideConfirmationPopup(); // Hide the confirmation popup
                });
        }
    });

    // Handle cancellation of delete
    cancelDeleteButton.addEventListener('click', hideConfirmationPopup);

    // Populate the expense table
    const populateExpenseTable = () => {
        fetch('/get-expenses')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch expenses');
                }
                return response.json();
            })
            .then(expenses => {
                const expenseTableBody = document.getElementById('expenseTableBody');
                expenseTableBody.innerHTML = '';

                expenses.forEach(expense => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${expense.description}</td>
                        <td>${expense.amount.toFixed(2)}</td>
                        <td>${expense.date}</td>
                        <td><button class="delete-button" data-id="${expense.id}">Delete</button></td>
                    `;
                    expenseTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching expenses:', error));
    };

    // Call populateExpenseTable on page load
    populateExpenseTable();
});