const dbName = "MSKM_Inventory_Database";
const storeName = "products";

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
            db.createObjectStore(storeName, { keyPath: "Product_Name" });
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
async function fetchProducts(filterType, filterValue) {
    try {
        let query = supabase
            .from('Product_Table')
            .select('Product_Name, Product_Price, Product_Category, Product_SubCategory');

        if (filterType === 'category') {
            query = query.eq('Product_Category', filterValue);
        } else if (filterType === 'subCategory') {
            query = query.eq('Product_SubCategory', filterValue);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (data.length === 0) {
            console.log(`No products found for ${filterType}:`, filterValue);
        }

        await saveProductsToIndexedDB(data);
        return data;
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
                products = products.filter(p => p.Product_Category === filterValue);
            } else if (filterType === 'subCategory') {
                products = products.filter(p => p.Product_SubCategory === filterValue);
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
      <div class="product-card">
        <div class="product-image" id="product-image">
            <img src="../Assets/images/product icons/drinks.svg">
        </div>
        <h6>${product.Product_Name}</h6>
        <p class="mb-0">PHP ${product.Product_Price.toFixed(2)}</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="addToCart('${product.Product_Name}', ${product.Product_Price})">Add to Cart</button>
      </div>
    `;
    return col;
}

// If the name isnt obvious yet then i dont know what to tell you...
async function fetchAndSaveAllProducts() {
    try {
        const query = supabase
            .from('Product_Table')
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

// Event listeners for me category buttons
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    // Initialize IndexedDB
    initDB().then(() => {
        // Display default category products on load
        displayProducts('category', 'DRINKS');
    });

    // Category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            displayProducts('category', category);

            // Update active class
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Subcategory buttons
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const subCategory = e.target.getAttribute('data-subcategory');
            const mainCategory = e.target.getAttribute('data-maincategory');

            displayProducts('subCategory', subCategory);

            // Update active class for categories
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            const mainCategoryBtn = document.querySelector(`.category-btn[data-category="${mainCategory}"]`);
            if (mainCategoryBtn) {
                mainCategoryBtn.classList.add('active');
            }

            // Remove active class
            document.querySelectorAll('.subcategory-btn').forEach(b => b.classList.remove('active'));
        });
    });
});

let cart = [];

function addToCart(name, price) {
    const item = cart.find(item => item.name === name);
    if (item) {
        updateQuantity(name, 1);
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartDisplay();
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

function clearCart() {
    cart = [];
    updateCartDisplay();
}




function showPaymentPopup() {
    document.getElementById('payment-popup').style.display = 'block';
}

function closePaymentPopup() {
    document.getElementById('payment-popup').style.display = 'none';
}




async function processTransaction(paymentMethod) {
    const cartItemsString = JSON.stringify(cart);
    const totalAmount = document.getElementById('cartTotal').textContent;
    const dateTime = new Date().toISOString();

    // Upload transaction to Supabase
    const { data, error } = await supabase
        .from('Transactions')
        .insert({
            Items: cartItemsString,
            Total: totalAmount,
            DateTime: dateTime,
            PaymentMethod: paymentMethod
        });

    if (error) {
        console.error('Error uploading transaction:', error);
    } 
    
    if (!error) {
        console.log('Transaction uploaded:', data);
        generateReceipt(cartItemsString, totalAmount, dateTime, paymentMethod);
        clearCart();
        closePaymentPopup();
    }
}




function generateReceipt(items, total, dateTime, paymentMethod) {
    console.log('Receipt');
    console.log('Items:', items);
    console.log('Total:', total);
    console.log('Date:', dateTime);
    console.log('Payment Method:', paymentMethod);
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
        window.location.href = 'Login.html';
    });
});