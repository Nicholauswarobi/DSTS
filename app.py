import os
from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import MySQLdb
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
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
    payment_method VARCHAR(50) NOT NULL,
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
    try:
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        profile_pic = request.files['profilePic']

        # Save the profile picture to the static/profilePictures folder
        if profile_pic and allowed_file(profile_pic.filename):
            filename = secure_filename(profile_pic.filename)
            profile_pic.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        else:
            return jsonify({'error': 'Invalid file type for profile picture'}), 400

        # Check if the username or email already exists
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Insert user data into the database
        cursor.execute(
            "INSERT INTO users (username, email, password, profile_pic) VALUES (%s, %s, %s, %s)",
            (username, email, hashed_password, filename)
        )
        db.commit()
        cursor.close()

        return jsonify({'message': 'Registration successful!'}), 201
    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({'error': 'An error occurred during registration. Please try again.'}), 500

# Route for the homepage
@app.route('/')
def index():
    return render_template('index.html')

# Route for the register page
@app.route('/register')
def register():
    return render_template('Register.html')




@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        # Render the login page
        return render_template('index.html')  # Ensure 'index.html' is your login page template

    if request.method == 'POST':
        try:
            username = request.json.get('username')  # Ensure you're using JSON data
            password = request.json.get('password')

            # Validate user credentials against the database
            cursor = db.cursor()
            cursor.execute("SELECT username, password, profile_pic FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            cursor.close()

            if user and check_password_hash(user[1], password):  # Use hashed password verification
                # Store the username and profile_pic in the session
                session['username'] = user[0]
                session['profile_pic'] = user[2] if user[2] else 'default.png'  # Use 'default.png' if no profile picture is set

                return jsonify({'message': 'Login successful!'}), 200
            else:
                return jsonify({'error': 'Invalid username or password'}), 401
        except Exception as e:
            print(f"Error during login: {e}")  # Debugging log
            return jsonify({'error': 'An error occurred during login. Please try again.'}), 500





# Route to handle adding a product
@app.route('/add-product', methods=['POST'])
def add_product():
    try:
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
    except Exception as e:
        print(f"Error adding product: {e}")
        return jsonify({'error': 'An error occurred while adding the product. Please try again.'}), 500




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
    try:
        # Parse JSON data from the request
        data = request.get_json()
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
            SET product_name = %s, product_quantity = %s, product_price = %s, 
                product_purchase = %s, manufactured_date = %s, expired_date = %s
            WHERE id = %s
        """, (product_name, product_quantity, product_price, product_purchase, manufactured_date, expired_date, product_id))
        db.commit()
        cursor.close()

        return jsonify({'message': 'Product updated successfully!'})
    except Exception as e:
        print(f"Error updating product: {e}")  # Debugging log
        return jsonify({'error': 'An error occurred while updating the product. Please try again.'}), 500



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
        print("Fetched Product Data:", product_data)  # Debugging log
        return jsonify(product_data)
    else:
        print("Product not found for ID:", product_id)  # Debugging log
        return jsonify({"error": "Product not found"}), 404


# Secret key for session management
app.secret_key = os.urandom(24)  # Generates a random 24-byte key

@app.route('/logout')
def logout():
    session.clear()  # Clear the session
    return redirect(url_for('index'))

@app.route('/get-products', methods=['GET'])
def get_products():
    try:
        cursor = db.cursor()
        cursor.execute("SELECT product_name, product_quantity, product_price FROM products WHERE product_quantity > 0")
        products = cursor.fetchall()  # Fetch all results
        cursor.close()  # Close the cursor after fetching results

        # Convert the data into a list of dictionaries
        product_list = [
            {
                "name": row[0],
                "quantity": row[1],
                "price": float(row[2])
            }
            for row in products
        ]

        return jsonify(product_list)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({'error': 'An error occurred while fetching products.'}), 500

@app.route('/add-sale', methods=['POST'])
def add_sale():
    try:
        data = request.json
        product_name = data['productName']
        quantity = int(data['quantity'])
        price = float(data['price'])
        payment_method = data['paymentMethod']

        # Fetch the product ID and available quantity
        cursor = db.cursor()
        cursor.execute("SELECT id, product_quantity FROM products WHERE product_name = %s", (product_name,))
        product = cursor.fetchone()

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        product_id, available_quantity = product

        # Check if the quantity is valid
        if quantity > available_quantity:
            return jsonify({'error': 'Insufficient stock available'}), 400

        # Calculate the total price
        total_price = quantity * price

        # Insert the sale into the sales table
        cursor.execute(
            "INSERT INTO sales (product_id, quantity_sold, total_price, payment_method) VALUES (%s, %s, %s, %s)",
            (product_id, quantity, total_price, payment_method)
        )

        # Update the product quantity in the products table
        cursor.execute(
            "UPDATE products SET product_quantity = product_quantity - %s WHERE id = %s",
            (quantity, product_id)
        )

        db.commit()
        cursor.close()

        return jsonify({'message': 'Sale recorded successfully!'})
    except Exception as e:
        print(f"Error recording sale: {e}")
        return jsonify({'error': 'An error occurred while recording the sale. Please try again.'}), 500

@app.route('/get-sales', methods=['GET'])
def get_sales():
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT 
                s.id,  -- Include sale ID
                p.product_name, 
                s.quantity_sold, 
                s.total_price / s.quantity_sold AS price_per_unit, 
                s.total_price, 
                s.payment_method, 
                s.sale_date 
            FROM sales s
            JOIN products p ON s.product_id = p.id
            ORDER BY s.sale_date DESC
        """)
        sales = cursor.fetchall()
        cursor.close()

        # Convert the data into a list of dictionaries
        sales_list = [
            {
                "id": row[0],  # Include sale ID
                "productName": row[1],
                "quantitySold": row[2],
                "pricePerUnit": float(row[3]),
                "totalPrice": float(row[4]),
                "paymentMethod": row[5],
                "saleDate": row[6].strftime('%Y-%m-%d %H:%M:%S') if row[6] else ''
            }
            for row in sales
        ]

        return jsonify(sales_list)
    except Exception as e:
        print(f"Error fetching sales: {e}")
        return jsonify({'error': 'An error occurred while fetching sales data.'}), 500

@app.route('/update-sale', methods=['POST'])
def update_sale():
    try:
        # Parse JSON data from the request
        data = request.get_json()
        print(f"Received data: {data}")  # Debugging line

        # Validate and extract inputs
        try:
            sale_id = int(data.get('saleId'))
            new_quantity = int(data.get('quantity'))
            new_payment_method = data.get('paymentMethod')
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid data format'}), 400

        cursor = db.cursor()

        # Fetch the original sale data
        cursor.execute("""
            SELECT product_id, quantity_sold 
            FROM sales 
            WHERE id = %s
        """, (sale_id,))
        sale = cursor.fetchone()

        if not sale:
            return jsonify({'error': 'Sale not found'}), 404

        product_id, old_quantity = sale

        # Update the product quantity in the products table
        quantity_difference = new_quantity - old_quantity
        cursor.execute("""
            UPDATE products 
            SET product_quantity = product_quantity - %s 
            WHERE id = %s
        """, (quantity_difference, product_id))

        # Update the sale record
        cursor.execute("""
            UPDATE sales 
            SET quantity_sold = %s, 
                total_price = (SELECT product_price FROM products WHERE id = %s) * %s,
                payment_method = %s
            WHERE id = %s
        """, (new_quantity, product_id, new_quantity, new_payment_method, sale_id))

        db.commit()
        cursor.close()

        return jsonify({'message': 'Sale updated successfully!'})
    except Exception as e:
        print(f"Error updating sale: {e}")  # Debugging line
        return jsonify({'error': 'An error occurred while updating the sale.'}), 500

if __name__ == '__main__':
    app.run(debug=True)