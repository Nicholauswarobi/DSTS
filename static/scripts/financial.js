
const fetchData = async (endpoint) => {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch data');
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        return [];
    }
};

const populateTable = (tableId, data, columns) => {
    const tableBody = document.querySelector(`#${tableId} tbody`);
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col] || '';
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
};

const refreshTables = async () => {
    const inventoryData = await fetchData('/get-inventory-history');
    const salesData = await fetchData('/get-sales-history');
    const expensesData = await fetchData('/get-expenses-history');
    const debtorsData = await fetchData('/get-debtors-history');

    populateTable('inventory-table', inventoryData, ['created_at', 'product_name', 'quantity', 'price', 'status']);
    populateTable('sales-table', salesData, ['created_at', 'product_name', 'quantity_sold', 'total_price', 'status']);
    populateTable('expenses-table', expensesData, ['created_at', 'description', 'amount', 'status']);
    populateTable('debtors-table', debtorsData, ['created_at', 'customer_name', 'amount_owed', 'status']);
};

document.getElementById('filter-button').addEventListener('click', async () => {
    const filterDate = document.getElementById('filter-date').value;
    if (!filterDate) return;

    const inventoryData = await fetchData(`/get-inventory-history?date=${filterDate}`);
    const salesData = await fetchData(`/get-sales-history?date=${filterDate}`);
    const expensesData = await fetchData(`/get-expenses-history?date=${filterDate}`);
    const debtorsData = await fetchData(`/get-debtors-history?date=${filterDate}`);

    populateTable('inventory-table', inventoryData, ['created_at', 'product_name', 'quantity', 'price', 'status']);
    populateTable('sales-table', salesData, ['created_at', 'product_name', 'quantity_sold', 'total_price', 'status']);
    populateTable('expenses-table', expensesData, ['created_at', 'description', 'amount', 'status']);
    populateTable('debtors-table', debtorsData, ['created_at', 'customer_name', 'amount_owed', 'status']);
});

document.getElementById('export-button').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const addTableToPDF = (title, tableId, startY) => {
        doc.text(title, 10, startY);
        const table = document.getElementById(tableId);
        const rows = Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.textContent));
        doc.autoTable({
            startY: startY + 10,
            head: [rows[0]],
            body: rows.slice(1),
        });
        return doc.lastAutoTable.finalY + 10;
    };

    let currentY = 10;
    currentY = addTableToPDF('Inventory History', 'inventory-table', currentY);
    currentY = addTableToPDF('Sales History', 'sales-table', currentY);
    currentY = addTableToPDF('Expenses History', 'expenses-table', currentY);
    addTableToPDF('Debtors History', 'debtors-table', currentY);

    doc.save('Filtered_Data.pdf');
});

// Initial population of tables
refreshTables();
