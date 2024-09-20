const dbName = "MSKM_InventoryDB";
const productsTable = "products";




// Initialize IndexedDB and see if it contains shit...
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = (event) => reject("IndexedDB error: " + event.target.error);
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            db.createObjectStore(productsTable, { keyPath: "Product_Name" });
        };
    });
}




// Handles Products Displaying... if it isnt obvious yet...
async function displayProducts(filterType, filterValue) {
    const products = await fetchProducts(filterType, filterValue);
    const productsContainer = document.getElementById('productsContainer');

    if (!productsContainer) {
        console.error('productsContainer is null');
        return;
    }
    productsContainer.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'row';
    products.forEach(product => {
        const productCard = createProductCard(product);
        row.appendChild(productCard);
    });
    productsContainer.appendChild(row);
}




// Fetch Products from Supabase
async function fetchProducts(filterType, filterValue, category = null) {
    try {
        let query = supabase
            .from('Products')
            .select(`
                Product_Name, 
                Product_Price, 
                Category_ID, 
                Section_ID,
                Category:Category_ID(Category_Name),
                Section:Section_ID(Section_Name)
            `);

        if (filterType === 'category') {
            query = query.eq('Category.Category_Name', filterValue);
        }
        
        if (filterType === 'section') {
            query = query.eq('Section.Section_Name', filterValue);
            query = query.eq('Category.Category_Name', filterValue);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (data.length === 0) {
            console.log(`No products found for ${filterType}:`, filterValue);
        }

        if (data.length > 0) {
            await saveProductsToIndexedDB(data);
            return data;
        }
    } catch (error) {
        console.error('Error fetching from Supabase:', error);
        const offlineData = await getProductsFromIndexedDB(filterType, filterValue);
        console.log('Offline data:', offlineData);
        return offlineData;
    }
}




// Products fetched from SupabaseDB will be saved to IndexedDB
async function saveProductsToIndexedDB(products) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], "readwrite");
        const store = transaction.objectStore('products');

        products.forEach(product => {
            const request = store.put(product);
            request.onerror = (event) => {
                console.error('Error saving product to IndexedDB:', event.target.error);
            };
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.error);
            reject(event.target.error);
        };
    });
}




// Get products from IndexedDB based on filter
async function getProductsFromIndexedDB(filterType, filterValue) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], "readonly");
        const store = transaction.objectStore('products');
        const request = store.getAll();

        request.onsuccess = () => {
            let products = request.result;

            if (filterType === 'category') {
                products = products.filter(p => p.Category_ID === filterValue);
            } 
            
            if (filterType === 'section') {
                products = products.filter(p => p.Section_ID === filterValue);
            }

            resolve(products);
        };

        request.onerror = (event) => reject(event.target.error);
    });
}




// This part creates the Product Cards... if it aint obvious yet...
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4 mb-3';
    col.innerHTML = `
        <div class="product-card" onclick="showProductProperties('${product.Product_Name}', '${product.Product_Price}', '../Assets/product icons/drinks.svg')">
            <div class="product-image" id="product-image">
                <img src="../Assets/product icons/drinks.svg">
            </div>
            <h6>${product.Product_Name}</h6>
            <p class="mb-0">PHP ${product.Product_Price.toFixed(2)}</p>
        </div>
    `;
    return col;
}




// If the name isnt obvious yet then i dont know what to tell you...
async function fetchAndSaveAllProducts() {
    try {
        const query = supabase
            .from('Products')
            .select('*');

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        await saveProductsToIndexedDB(data);
    } catch (error) {
        console.error('Error fetching all products:', error);
    }
}




// Event listeners for category and section buttons
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initDB().then(() => {
        displayProducts('category', '1');
    });

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            displayProducts('category', category);
            
            // Update active class
            document.querySelectorAll('.category-btn').forEach(b => {
                if (b.classList.contains('active')) {
                    b.classList.remove('active');
                }
            });
            e.target.classList.add('active');
        });
    });

    // Section (subcategory) buttons
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            const category = e.target.getAttribute('data-category');
            
            if (section) {
                displayProducts('section', section);
            }
            
            // Update active class for categories
            document.querySelectorAll('.category-btn').forEach(b => {
                if (b.classList.contains('active')) {
                    b.classList.remove('active');
                }
            });
            const categoryBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
            if (categoryBtn) {
                categoryBtn.classList.add('active');
            }

            // Remove active class from other section buttons
            document.querySelectorAll('.section-btn').forEach(b => {
                if (b.classList.contains('active')) {
                    b.classList.remove('active');
                }
            });
            e.target.classList.add('active');
        });
    });
});





// Shopping Cart
let cart = [];

function showProductProperties(name, price, imageURL) {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) {
        console.error('cartItems container is null');
        return;
    }
    cartContainer.innerHTML = `
        <div class="cart-item">
            <div class="product-image">
                <img src="${imageURL}" alt="${name}">
            </div>
            <div>
                <h6>Product: ${name}</h6>
                <p>Price: PHP <input type="number" id="productPriceInput" value="${parseFloat(price).toFixed(2)}" step="0.01"></p>
                <p>Quantity: <input type="number" id="productQuantityInput" value="1" min="1"></p>
            </div>
        </div>
    `;

    // Update the button to handle updates
    const updateButton = document.querySelector('.updateBTN');
    updateButton.onclick = () => updateProductProperties(name);
}

function updateProductProperties(name) {
    const newPrice = parseFloat(document.getElementById('productPriceInput').value);
    const newQuantity = parseInt(document.getElementById('productQuantityInput').value, 10);

    if (!isNaN(newPrice) && newQuantity >= 1) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.price = newPrice;
            item.quantity = newQuantity;
        } else {
            cart.push({ name, price: newPrice, quantity: newQuantity });
        }
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) {
        console.error('cartItems container is null');
        return;
    }
    cartContainer.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div>
                        <h6>${item.name}</h6>
                        <p>PHP ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="quantity-control">
                        <button onclick="updateQuantity('${item.name}', -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity('${item.name}', this.value)">
                        <button onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                </div>
            `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

function updateQuantity(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }
    updateCartDisplay();
}

function changeQuantity(name, newQuantity) {
    const parsedQuantity = parseInt(newQuantity, 10);
    if (!isNaN(parsedQuantity) && parsedQuantity >= 1) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity = parsedQuantity;
            updateCartDisplay();
        }
    }
}

function clearCart() {
    cart = [];
    updateCartDisplay();
}

document.getElementById('delete-button').addEventListener('click', function() {
    this.classList.add('shake');
    setTimeout(() => {
        this.classList.remove('shake');
    }, 500);
});




function showPaymentPopup() {
    document.getElementById('payment-popup').style.display = 'block';
}

function closePaymentPopup() {
    document.getElementById('payment-popup').style.display = 'none';
}

function closeCashPopup() {
    document.getElementById('cash-popup').style.display = 'none';
}




let pastTime = 0;
let just_a_Number = 0;

function generateTransactionID() {
    const nowTime = Date.now();
    const timestamp = Math.floor(nowTime / 1000);

    if (timestamp === pastTime) {
        just_a_Number = ( just_a_Number + 1) % 1000;
    }

    if (timestamp !== pastTime) {
        just_a_Number = 0;
        pastTime = timestamp;
    }

    const uniqueID = just_a_Number * 100 + Math.floor(Math.random() * 100);
    return timestamp * 100000 + uniqueID;
}




function handleCashPayment() {
    document.getElementById('payment-popup').style.display = 'none';
    document.getElementById('cash-popup').style.display = 'block';

    let transactionID = generateTransactionID();

    processTransaction(transactionID, "Cash");

    document.getElementById('display-transactionID').innerText = "Transaction ID: " + transactionID;
}

function handleGCashPayment() {
    document.getElementById('payment-popup').style.display = 'none';
    document.getElementById('gcash-popup').style.display = 'block';

    let transactionID = generateTransactionID();

    processTransaction(transactionID, "GCash")

    document.getElementById('display-transactionID').innerText = "Transaction ID: " + transactionID;
}




async function processTransaction(transactionID, paymentMethod) {
    const itemsSummary = cart.map(item => `${item.name} (x${item.quantity})`).join(',');
    const totalAmount = document.getElementById('cartTotal').textContent;
    const dateTime = new Date().toISOString();

    const { data, error } = await supabase
        .from('Transactions')
        .insert({
            Transaction_ID: transactionID,
            Items: itemsSummary,
            Total: totalAmount,
            DateTime: dateTime,
            PaymentMethod: paymentMethod
        })
        .single();

    if (error) {
        console.error('Error uploading transaction:', error);
    }

    if(!error) {
        console.log('Transaction uploaded :P');
        generateReceipt(transactionID, itemsSummary, totalAmount, dateTime, paymentMethod);
        clearCart();
        closePaymentPopup();
    }
}

function generateReceipt(transactionID, items, total, dateTime, paymentMethod) {
    console.log('Receipt');
    console.log('Transaction ID: ', transactionID)
    console.log('Items:', items);
    console.log('Total:', total);
    console.log('Date:', dateTime);
    console.log('Payment Method:', paymentMethod);
}




// ===== ===== ===== ===== ===== Logout Handler ===== ===== ===== ===== ===== //
async function LogoutHandler() {
    const employeeNum = localStorage.getItem('Number');
    const employeeId = localStorage.getItem('employeeId');

    console.log('Date_Time from localStorage:', employeeNum);
    console.log('Employee_ID from localStorage:', employeeId);

    if (!employeeNum || !employeeId) {
        alert('No clock-in record found. Please clock in first.');
        return;
    }

    const now = new Date().toISOString();
    console.log('Attempting to update ClockOut at:', now);

    try {
        const { data, error } = await supabase
            .from('Employee_Attendance')
            .update({ ClockOut: now })
            .match({ Number: employeeNum, Employee_Number: employeeId })
            .select();

        console.log('Update result:', data);

        if (error) {
            throw new Error(error.message);
        }

        if (data.length === 0) {
            console.error('No matching record found to update.');
            alert('No matching record found. Please ensure you are clocked in.');
            return;
        }

        localStorage.removeItem('Number');
        localStorage.removeItem('employeeId');

        alert('You have successfully clocked out.');
    } catch (err) {
        console.error('Error during clock-out:', err);
        alert('There was an error recording your clock-out. Please try again.');
    }
}




document.addEventListener('DOMContentLoaded', () => {
    // Logout confirmation
    const logoutLink = document.querySelector('.navbarLogo_Logout .nav-link');
    const logoutPopup = document.getElementById('logout-popup');
    const confirmLogoutButton = document.getElementById('confirm-logout');
    const cancelLogoutButton = document.getElementById('cancel-logout');

    logoutLink.addEventListener('click', (event) => {
        event.preventDefault();
        logoutPopup.style.display = 'block';
    });

    cancelLogoutButton.addEventListener('click', () => {
        logoutPopup.style.display = 'none';
    });

    confirmLogoutButton.addEventListener('click', () => {
        LogoutHandler();
        window.location.href = 'Login.html';
    });
});