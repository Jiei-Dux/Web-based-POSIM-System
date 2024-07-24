const dbName = "MSKM_Inventory_Database";
const storeName = "products";

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

async function displayProducts(category) {
    const products = await fetchProducts(category);
    console.log('Products to display:', products);
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

async function saveProductsToIndexedDB(products) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);

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

async function getProductsFromIndexedDB(category) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => {
            const products = request.result.filter(p => p.Product_Category === category);
            resolve(products);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

async function fetchProducts(category) {
    try {
        console.log('Fetching products for category:', category);
        const query = supabase
            .from('Product_Table')
            .select('Product_Name, Product_Price, Product_Category')
            .eq('Product_Category', category);

        console.log('Query:', query.toString());

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }
        console.log('Fetched data:', data);
        if (data.length === 0) {
            console.log('No products found for category:', category);
        }
        await saveProductsToIndexedDB(data);
        return data;
    } catch (error) {
        console.error('Error fetching from Supabase:', error);
        if (error.message) console.error('Error message:', error.message);
        if (error.details) console.error('Error details:', error.details);
        if (error.hint) console.error('Error hint:', error.hint);
        try {
            const offlineData = await getProductsFromIndexedDB(category);
            console.log('Offline data:', offlineData);
            return offlineData;
        } catch (offlineError) {
            console.error('Error fetching from IndexedDB:', offlineError);
            return [];
        }
    }
}

async function initialize() {
    initSupabase();
    try {
        await initDB();
        console.log("IndexedDB initialized");
        await displayProducts('DRINKS');
    } catch (error) {
        console.error("Failed to initialize:", error);
    }
}

document.addEventListener('DOMContentLoaded', initialize);

document.querySelectorAll('.horizontal-navbar .nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = e.target.getAttribute('data-category');
        displayProducts(category);
        document.querySelectorAll('.horizontal-navbar .nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
    });
});

function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-6 col-lg-4 mb-3';
    col.innerHTML = `
                <div class="product-card">
                    <div class="product-image">?</div>
                        <h6>${product.Product_Name}</h6>
                        <p class="mb-0">PHP ${product.Product_Price.toFixed(2)}</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="addToCart('${product.Product_Name}', ${product.Product_Price})">Add to Cart</button>
                </div>
            `;
    return col;
}

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

document.addEventListener('DOMContentLoaded', () => {
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