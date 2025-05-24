document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const expenseTableBody = document.getElementById('expenseTableBody');

    // Handle adding expenses
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const description = document.getElementById('expenseName').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);

        // Send data to the backend
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
                console.log(data.message); // Debugging log
                populateExpenseTable(); // Refresh the table
                expenseForm.reset(); // Reset the form
            })
            .catch(error => console.error('Error adding expense:', error));
    });

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
                expenseTableBody.innerHTML = ''; // Clear the table

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

                // Add event listeners to delete buttons
                const deleteButtons = document.querySelectorAll('.delete-button');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        deleteExpense(id);
                    });
                });
            })
            .catch(error => console.error('Error fetching expenses:', error));
    };

    // Delete an expense
    const deleteExpense = (id) => {
        fetch(`/delete-expense/${id}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete expense');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message); // Debugging log
                populateExpenseTable(); // Refresh the table
            })
            .catch(error => console.error('Error deleting expense:', error));
    };

    // Call populateExpenseTable on page load
    populateExpenseTable();
});