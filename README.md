# Digital Sales Tracking System (DSTS

Welcome to the Digital Sales Tracking System (DSTS)! This web application is designed to help hardware shops in Dodoma, Tanzania, efficiently manage their sales, inventory, expenses, and financial metrics.

---

## Project Structure

The project is organized as follows:

```
DSTS/
├── app.py                     # Main Flask application file
├── requirements.txt           # Python dependencies
├── README.md                  # Project documentation
├── static/                    # Static files (CSS, JS, images)
│   ├── styles/                # CSS files for styling
│   │   ├── styles.css         # Main stylesheet
│   │   ├── calendar.css       # Calendar styling
│   │   ├── product-sales.css  # Product sales page styling
│   │   ├── expenses.css       # Expenses page styling
│   │   ├── financial.css      # Financial page styling
│   │   ├── graph.css          # Graph page styling
│   │   ├── login.css          # Login page styling
│   ├── scripts/               # JavaScript files
│   │   ├── inventory.js       # Inventory management logic
│   │   ├── dashboard.js       # Dashboard functionality
│   │   ├── calendar.js        # Calendar functionality
│   │   ├── profile.js         # Profile management logic
│   │   ├── sales.js           # Sales tracking logic
│   │   ├── expenses.js        # Expenses tracking logic
│   │   ├── debtors.js         # Debtors management logic
│   │   ├── charts.js          # Charts management logic
│   │   ├── financial.js       # Financial management logic
│   ├── images/                # Images used in the application
│   │   ├── dstsICON.png       # Application icon
│   │   ├── profilePictures/   # Profile pictures
├── templates/                 # HTML templates
│   ├── index.html             # Login page
│   ├── dashboard.html         # Dashboard page
│   ├── inventory.html         # Inventory management page
│   ├── sales.html             # Sales tracking page
│   ├── expenses.html          # Expenses tracking page
│   ├── Register.html          # Register management page
│   ├── dsts.html              # Main page
│   ├── financial.html         # Financial page
```

---

## How to Run the Web Application

### Prerequisites

Before running the application, ensure the following are installed on your computer:
1. **Python** (Version 3.10 or higher)
2. **MySQL Server** (Ensure the MySQL service is running)
3. **pip** (Python package manager)

---

### Installation Steps

#### 1. Clone the Repository
Download or clone the project repository to your computer:
```bash
git clone https://github.com/your-repository/dsts.git
cd dsts
```

#### 2. Install Python Dependencies
Install the required Python packages using `pip`:
```bash
pip install -r requirements.txt
```

#### 3. Configure MySQL Database
Ensure MySQL is running and create a database for the application:
1. Open MySQL Workbench or any MySQL client.
2. Create a database named `dstsdb`:
   ```sql
   CREATE DATABASE dstsdb;
   ```
3. Update the database credentials in `app.py`:
   ```python
   app.config['MYSQL_HOST'] = 'localhost'
   app.config['MYSQL_USER'] = 'root'
   app.config['MYSQL_PASSWORD'] = 'your_password'
   app.config['MYSQL_DB'] = 'dstsdb'
   ```

#### 4. Initialize the Database
Run the application to automatically create the required tables:
```bash
python app.py
```
The application will create tables such as `users`, `products`, `sales`, `expenses`, and `debtors`.

#### 5. Run the Application
Start the Flask development server:
```bash
python app.py
```
Access the application in your browser at [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

## Features

- **Dashboard**: View daily metrics such as sales, profit, revenue, and expenses.
- **Inventory Management**: Add, edit, and delete products.
- **Sales Recording**: Record customer purchases and manage transactions.
- **Expenses Tracking**: Track business expenses and manage debtors.
- **Financial Reports**: Generate and export financial data.

---

## Troubleshooting

### Common Issues
1. **Database Connection Error**:
   - Ensure MySQL is running and the credentials in `app.py` are correct.
   - Verify the database `dstsdb` exists.

2. **Missing Dependencies**:
   - Run `pip install -r requirements.txt` to install all required packages.

3. **Port Conflict**:
   - If port `5000` is in use, change the port in `app.run()`:
     ```python
     app.run(debug=True, port=5001)
     ```

---

## License

This project is licensed under the MIT License.

---

## Contact

For support or inquiries, contact:
- **Email**: empireprodevelopment@gmail.com
- **Phone**: +255 746 562 187


