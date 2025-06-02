document.addEventListener('DOMContentLoaded', () => {
    // Modal elements for adding debtor
    const debtorModal = document.getElementById('debtorModal');
    const openDebtorModal = document.getElementById('openDebtorModal');
    const closeDebtorModal = document.getElementById('closeDebtorModal');
    const debtorForm = document.getElementById('debtorForm');

    // Modal elements for payment
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentAmountInput = document.getElementById('paymentAmount');
    const debtorIdInput = document.getElementById('debtorId');

    // Notification popup
    const notificationPopup = document.getElementById('notificationPopup');
    const notificationMessage = document.getElementById('notificationMessage');

    // Open Add Debtor Modal
    openDebtorModal.addEventListener('click', () => {
        debtorModal.classList.remove('hidden');
    });

    // Close Add Debtor Modal
    closeDebtorModal.addEventListener('click', () => {
        debtorModal.classList.add('hidden');
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === debtorModal) {
            debtorModal.classList.add('hidden');
        }
        if (event.target === paymentModal) {
            closePaymentModalFunc();
        }
    });

    // Add Debtor
    debtorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const customerName = document.getElementById('customerName').value;
        const amountOwed = parseFloat(document.getElementById('amountOwed').value);

        fetch('/add-debtor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_name: customerName, amount_owed: amountOwed }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add debtor');
            return response.json();
        })
        .then(data => {
            showNotification(data.message);
            debtorForm.reset();
            debtorModal.classList.add('hidden');
            populateDebtorTable();
        })
        .catch(error => {
            showNotification('Error adding debtor.');
            console.error(error);
        });
    });

    // Open Payment Modal
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('record-payment-button')) {
            const debtorId = event.target.getAttribute('data-id');
            debtorIdInput.value = debtorId;
            paymentModal.classList.remove('hidden');
        }
    });

    // Close Payment Modal
    function closePaymentModalFunc() {
        paymentModal.classList.add('hidden');
        paymentForm.reset();
    }
    closePaymentModal.addEventListener('click', closePaymentModalFunc);

    // Handle Payment Submission
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const paymentAmount = parseFloat(paymentAmountInput.value);
        const debtorId = debtorIdInput.value;

        fetch(`/record-payment/${debtorId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_amount: paymentAmount }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to record payment');
            return response.json();
        })
        .then(data => {
            showNotification('Payment recorded successfully!');
            closePaymentModalFunc();
            populateDebtorTable();
        })
        .catch(error => {
            showNotification('Failed to record payment.');
            console.error(error);
        });
    });

    // Show notification popup
    function showNotification(message) {
        notificationMessage.textContent = message;
        notificationPopup.classList.remove('hidden');
        setTimeout(() => {
            notificationPopup.classList.add('hidden');
        }, 3000);
    }

    // Populate the debtor table
    function populateDebtorTable() {
        fetch('/get-debtors')
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch debtors');
                return response.json();
            })
            .then(debtors => {
                const debtorTableBody = document.getElementById('debtorTableBody');
                debtorTableBody.innerHTML = '';
                debtors.forEach(debtor => {
                    // Only show debtors with a non-zero amount owed
                    if (debtor.amount_owed > 0) {
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
                    }
                });
            })
            .catch(error => {
                showNotification('Error fetching debtors.');
                console.error(error);
            });
    }

    // Initial table load and on page show
    populateDebtorTable();
    window.addEventListener('pageshow', populateDebtorTable);
});