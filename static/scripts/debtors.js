document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const debtorModal = document.getElementById('debtorModal');
    const openDebtorModal = document.getElementById('openDebtorModal');
    const closeDebtorModal = document.getElementById('closeDebtorModal');

    // Open Debtor Modal
    openDebtorModal.addEventListener('click', () => {
        debtorModal.classList.remove('hidden');
    });

    // Close Debtor Modal
    closeDebtorModal.addEventListener('click', () => {
        debtorModal.classList.add('hidden');
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === debtorModal) {
            debtorModal.classList.add('hidden');
        }
    });

    // Handle adding debtors
    const debtorForm = document.getElementById('debtorForm');
    debtorForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const customerName = document.getElementById('customerName').value;
        const amountOwed = parseFloat(document.getElementById('amountOwed').value);

        fetch('/add-debtor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ customer_name: customerName, amount_owed: amountOwed }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add debtor');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                populateDebtorTable(); // Refresh the table
                debtorForm.reset(); // Reset the form
                debtorModal.classList.add('hidden'); // Close the modal
            })
            .catch(error => console.error('Error adding debtor:', error));
    });

    // Populate the debtor table
    const populateDebtorTable = () => {
        fetch('/get-debtors')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch debtors');
                }
                return response.json();
            })
            .then(debtors => {
                const debtorTableBody = document.getElementById('debtorTableBody');
                debtorTableBody.innerHTML = '';

                debtors.forEach(debtor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${debtor.customer_name}</td>
                        <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TSH' }).format(debtor.amount_owed)}</td>
                        <td>${debtor.date_added}</td>
                        <td>${debtor.last_payment_date || 'N/A'}</td>
                        <td>${debtor.status}</td>
                        <td><button class="record-payment-button" data-id="${debtor.id}">Pay</button></td>
                    `;
                    debtorTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching debtors:', error));
    };

    // Call populateDebtorTable on page load
    populateDebtorTable();

    // Refresh table when navigating back to the page
    window.addEventListener('pageshow', () => {
        populateDebtorTable();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentAmountInput = document.getElementById('paymentAmount');
    const debtorIdInput = document.getElementById('debtorId');

    // Function to open the payment modal
    const openPaymentModal = (debtorId) => {
        debtorIdInput.value = debtorId; // Set the debtor ID in the hidden input
        paymentModal.classList.remove('hidden'); // Show the modal
    };

    // Function to close the payment modal
    const closeModal = () => {
        paymentModal.classList.add('hidden'); // Hide the modal
        paymentForm.reset(); // Reset the form
    };

    // Event listener to close the modal when clicking the close button
    closePaymentModal.addEventListener('click', closeModal);

    // Event listener to close the modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            closeModal();
        }
    });

    // Event listener for the "Record Payment" button
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('record-payment-button')) {
            const debtorId = event.target.getAttribute('data-id');
            openPaymentModal(debtorId); // Open the modal with the debtor ID
        }
    });

    // Function to show the notification popup
    const showNotification = (message) => {
        const notificationPopup = document.getElementById('notificationPopup');
        const notificationMessage = document.getElementById('notificationMessage');

        notificationMessage.textContent = message;
        notificationPopup.classList.remove('hidden');

        // Automatically hide the notification after 3 seconds
        setTimeout(() => {
            notificationPopup.classList.add('hidden');
        }, 3000);
    };

    // Handle Payment Form Submission
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const paymentAmount = parseFloat(paymentAmountInput.value);
        const debtorId = debtorIdInput.value;

        console.log('Submitting payment:', { paymentAmount, debtorId });

        fetch(`/record-payment/${debtorId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payment_amount: paymentAmount }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to record payment');
                }
                return response.json();
            })
            .then(data => {
                console.log('Payment recorded successfully:', data.message);
                populateDebtorTable(); // Refresh the table
                closeModal(); // Close the modal
                showNotification('Payment recorded successfully!'); // Show success notification
            })
            .catch(error => {
                console.error('Error recording payment:', error);
                showNotification('Failed to record payment.'); // Show error notification
            });
    });

    // Populate the debtor table
    const populateDebtorTable = () => {
        fetch('/get-debtors')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch debtors');
                }
                return response.json();
            })
            .then(debtors => {
                const debtorTableBody = document.getElementById('debtorTableBody');
                debtorTableBody.innerHTML = '';

                debtors.forEach(debtor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${debtor.customer_name}</td>
                        <td>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TSH' }).format(debtor.amount_owed)}</td>
                        <td>${debtor.date_added}</td>
                        <td>${debtor.last_payment_date || 'N/A'}</td>
                        <td>${debtor.status}</td>
                        <td><button class="record-payment-button" data-id="${debtor.id}">Pay</button></td>
                    `;
                    debtorTableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error fetching debtors:', error));
    };

    // Call populateDebtorTable on page load
    populateDebtorTable();

    // Refresh table when navigating back to the page
    window.addEventListener('pageshow', () => {
        populateDebtorTable();
    });
});