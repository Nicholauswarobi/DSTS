import os
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import MySQLdb
from werkzeug.utils import secure_filename
import datetime

app = Flask(__name__)

# Database configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'dstsdb'

# Folder to store profile pictures (inside the static folder)
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'profilePictures')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allowed file extensions for profile pictures
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Ensure the database exists
db_connection = MySQLdb.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    passwd=app.config['MYSQL_PASSWORD']
)
cursor = db_connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS dstsdb")
db_connection.close()

# Connect to the database
db = MySQLdb.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    passwd=app.config['MYSQL_PASSWORD'],
    db=app.config['MYSQL_DB']
)

# Create tables if they do not exist
cursor = db.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_quantity INT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_purchase DecIMAL(10, 2) NOT NULL,
    manufactured_date DATE NOT NULL,
    expired_date DATE NOT NULL,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    quantity_sold INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
""")
cursor.execute("""
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
db.commit()
cursor.close()

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route for registering a user
@app.route('/register', methods=['POST'])
def handle_register():
    username = request.form['username']
    email = request.form['email']
    password = request.form['password']
    profile_pic = request.files['profilePic']

    # Save the profile picture to the static/profilePictures folder
    if profile_pic and allowed_file(profile_pic.filename):
        filename = secure_filename(profile_pic.filename)
        profile_pic.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    else:
        return "Invalid file type for profile picture", 400

    # Insert user data into the database, including the profile picture filename
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO users (username, email, password, profile_pic) VALUES (%s, %s, %s, %s)",
        (username, email, password, filename)
    )
    db.commit()
    cursor.close()

    return redirect(url_for('index'))

# Route for the homepage
@app.route('/')
def index():
    return render_template('index.html')

# Route for the register page
@app.route('/register')
def register():
    return render_template('Register.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']

    # Validate user credentials against the database
    cursor = db.cursor()
    cursor.execute("SELECT username, profile_pic FROM users WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()
    cursor.close()

    if user:
        # Store the username and profile_pic in the session
        session['username'] = user[0]
        session['profile_pic'] = user[1] if user[1] else 'default.png'  # Use 'default.png' if no profile picture is set

        # Redirect to the dashboard
        return redirect(url_for('dsts'))
    else:
        # Invalid credentials
        return "Invalid username or password", 401

# Route for the dashboard (after successful login)
# @app.route('/dashboard')
# def dashboard():
#     return "Welcome to the Dashboard!"

# Route to handle adding a product
@app.route('/add-product', methods=['POST'])
def add_product():
    data = request.json
    product_name = data['productName']
    product_quantity = data['productQuantity']
    product_price = data['productPrice']
    product_purchase = data['productPurchase']
    manufactured_date = data['manufacturedDate']
    expired_date = data['expiredDate']
    date_added = datetime.datetime.now().strftime('%Y-%m-%d')

    # Save the product to the database
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO products (product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, date_added) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, date_added)
    )
    db.commit()
    cursor.close()

    return jsonify({'message': 'Product added successfully!'})

# Route for the inventory page
@app.route('/inventory')
def inventory():
    # Fetch data from the database
    cursor = db.cursor()
    cursor.execute("SELECT id, product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, date_added FROM products")
    products = cursor.fetchall()
    product_list = [
        {
            "id": row[0],
            "productName": row[1],
            "productQuantity": row[2],
            "productPrice": float(row[3]),
            "productPurchase": float(row[4]),
            "manufacturedDate": row[5].strftime('%Y-%m-%d') if row[5] else '',
            "expiredDate": row[6].strftime('%Y-%m-%d') if row[6] else '',
            "dateAdded": row[7].strftime('%Y-%m-%d') if row[7] else ''
        }
        for row in products
    ]


    # Pass the product list to the template
    return render_template('inventory.html', products=product_list)

# Route for the sales page
@app.route('/sales')
def sales():
    return render_template('sales.html')

# Route for the expenses page
@app.route('/expenses')
def expenses():
    return render_template('expenses.html')

@app.route('/dsts')
def dsts():
    if 'username' not in session or 'profile_pic' not in session:
        # Redirect to login page if the user is not logged in
        return redirect(url_for('index'))

    # Retrieve username and profile_pic from the session
    username = session['username']
    profile_pic = session['profile_pic']

    return render_template('dsts.html', username=username, profile_pic=profile_pic)

@app.route('/financial')
def financial():
    return render_template('financial.html')



# Route to handle editing a product
@app.route('/edit-product/<int:product_id>', methods=['POST'])
def edit_product(product_id):
    data = request.json
    product_name = data['productName']
    product_quantity = data['productQuantity']
    product_price = data['productPrice']
    product_purchase = data['productPurchase']
    manufactured_date = data['manufacturedDate']
    expired_date = data['expiredDate']

    # Update the product in the database
    cursor = db.cursor()
    cursor.execute("""
        UPDATE products
        SET product_name = %s, product_quantity = %s, product_price = %s, product_purchase = %s,
            manufactured_date = %s, expired_date = %s
        WHERE id = %s
    """, (product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, product_id))
    db.commit()
    cursor.close()

    return jsonify({'message': 'Product updated successfully!'})

# Route to handle deleting a product
@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    # Delete the product from the database
    cursor = db.cursor()
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    db.commit()
    cursor.close()

    return jsonify({'message': 'Product deleted successfully!'})



# Route to fetch inventory data in JSON format
@app.route('/inventory-data', methods=['GET'])
def get_inventory_data():
    cursor = db.cursor()
    cursor.execute("SELECT id, product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, date_added FROM products")
    products = cursor.fetchall()
    cursor.close()

    # Convert the data into a list of dictionaries
    product_list = [
        {
            "id": row[0],
            "productName": row[1],
            "productQuantity": row[2],
            "productPrice": float(row[3]),
            "productPurchase": float(row[4]),
            "manufacturedDate": row[5].strftime('%Y-%m-%d') if row[5] else '',
            "expiredDate": row[6].strftime('%Y-%m-%d') if row[6] else '',
            "dateAdded": row[7].strftime('%Y-%m-%d') if row[7] else ''
        }
        for row in products
    ]

    return jsonify(product_list)

# Route to get product details for editing
@app.route('/edit-product/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
    product = cursor.fetchone()
    cursor.close()

    if product:
        product_data = {
            "id": product[0],
            "productName": product[1],
            "productQuantity": product[2],
            "productPrice": float(product[3]),
            "productPurchase": float(product[4]),
            "manufacturedDate": product[5].strftime('%Y-%m-%d') if product[5] else '',
            "expiredDate": product[6].strftime('%Y-%m-%d') if product[6] else '',
        }
        return jsonify(product_data)
    else:
        return jsonify({"error": "Product not found"}), 404

# Secret key for session management
app.secret_key = os.urandom(24)  # Generates a random 24-byte key

if __name__ == '__main__':
    app.run(debug=True)