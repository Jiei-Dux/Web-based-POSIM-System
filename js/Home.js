const dbName = "MSKM_InventoryDB";
const products = "Products";




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
            db.createObjectStore(products, { keyPath: "Product_Name" });
        };
    });
}




async function fetchProducts(filterType, filterValue, category = null) {
    try {
        let query = supabase
            .from('Products')
            .select(`
                Product_Name, 
                Product_Price, 
                Category_ID, 
                Section_ID,
                Variant,
                Category:Category_ID(Category_Name),
                Section:Section_ID(Section_Name)
            `);

        if (filterType === 'category') {
            query = query.eq('Category_ID', filterValue);
        }

        if (filterType === 'section') {
            query = query.eq('Section_ID', filterValue);

            if (category) {
                query = query.eq('Category_ID', category);
            }
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
      <div class="product-card">
        <div class="product-image" id="product-image">
            <img src="../Assets/product icons/drinks.svg">
        </div>
        <h6>${product.Product_Name}</h6>
        <p class="mb-0">PHP ${product.Product_Price.toFixed(2)}</p>
        <button class="btn btn-sm btn-primary mt-2" onclick="addToCart('${product.Product_Name}', ${product.Product_Price})">Add to Cart</button>
      </div>
    `;
    return col;
}




// Handles Products Displaying with dropdown filter integration
async function displayProducts(filterType, filterValue, category = null) {
    const products = await fetchProducts(filterType, filterValue, category);
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

// Function to fetch categories from Supabase and update the dropdown menu
async function fillCategoryDropdown() {
    const categoryDropdown = document.querySelector('.dropdown-menu');

    // Clear existing categories
    categoryDropdown.innerHTML = '';

    try {
        const { data: categories, error } = await supabase
            .from('Category')
            .select('Category_ID, Category_Name');

        if (error) {
            console.error('Error fetching categories:', error);
            return;
        }

        if (categories.length === 0) {
            console.log('No categories found');
            return;
        }

        function formatCategoryName(name) {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }

        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            const categoryLink = document.createElement('a');
            categoryLink.classList.add('dropdown-item', 'category-option');
            categoryLink.dataset.category = category.Category_ID;
            categoryLink.textContent = formatCategoryName(category.Category_Name);
            categoryItem.appendChild(categoryLink);
            categoryDropdown.appendChild(categoryItem);

            categoryLink.addEventListener('click', async (e) => {
                const selectedCategoryId = e.target.dataset.category;
                console.log('Category selected:', selectedCategoryId);
                await displayProducts('category', selectedCategoryId);
                document.querySelector('.section-btn').disabled = false;
                document.querySelector('.dropdown-toggle-split').disabled = false;
                await populateSectionDropdown(selectedCategoryId);
            });
        });
    } catch (error) {
        console.error('Error fetching categories from Supabase:', error);
    }
}




document.querySelector('.searchbar input').addEventListener('input', async function (e) {
    const searchQuery = e.target.value.toLowerCase();
    
    if (searchQuery.length === 0) {
        await displayProducts('category', '1');
        return;
    }

    const products = await fetchProducts('all');
    
    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchQuery)
    );

    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'row';

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        row.appendChild(productCard);
    });

    productsContainer.appendChild(row);
});





async function populateSectionDropdown(categoryId) {
    const sectionDropdown = document.getElementById('sectionDropdown');
    sectionDropdown.innerHTML = '';

    try {
        const { data: sections, error } = await supabase
            .from('Section')
            .select('Section_Name, Section_ID')
            .eq('Category_ID', categoryId);

        if (error) {
            console.error('Error fetching sections:', error);
            return;
        }

        if (sections.length === 0) {
            console.log('No sections found for Category_ID:', categoryId);
            return;
        }

        function formatSectionName(name) {
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }

        // Populate the section dropdown with the fetched sections
        sections.forEach(section => {
            const sectionItem = document.createElement('li');
            const sectionLink = document.createElement('a');
            sectionLink.classList.add('dropdown-item', 'section-option');
            sectionLink.dataset.section = section.Section_ID;
            sectionLink.textContent = formatSectionName(section.Section_Name);
            sectionItem.appendChild(sectionLink);
            sectionDropdown.appendChild(sectionItem);
        });
    } catch (error) {
        console.error('Error fetching sections from Supabase:', error);
    }
}




async function getSectionDetails(sectionId) {
    try {
        const { data: section, error } = await supabase
            .from('Section')
            .select('Section_ID, Category_ID')
            .eq('Section_ID', sectionId)
            .single();

        if (error) {
            console.error('Error fetching section details:', error);
            return null;
        }

        console.log('Fetched section details:', section);
        return section;
    } catch (error) {
        console.error('Error getting section details:', error);
        return null;
    }
}





document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initDB().then(() => {
        displayProducts('category', '1');
    });

    // +++++ +++++ +++++ +++++ +++++ Category dropdown logic +++++ +++++ +++++ +++++ +++++ //
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            const selectedCategoryId = e.target.dataset.category;
            await displayProducts('category', selectedCategoryId);
            document.querySelector('.section-btn').disabled = false;
            document.querySelector('.dropdown-toggle-split').disabled = false;
            await populateSectionDropdown(selectedCategoryId);
        });
    });

    // +++++ +++++ +++++ +++++ +++++ Section dropdown logic +++++ +++++ +++++ +++++ +++++ //
    document.getElementById('sectionDropdown').addEventListener('click', async (e) => {
        if (e.target.classList.contains('section-option')) {
            const selectedSectionId = e.target.dataset.section;
            console.log('Section selected:', selectedSectionId);

            try {
                const sectionDetails = await getSectionDetails(selectedSectionId);

                if (sectionDetails) {
                    const { Section_ID, Category_ID } = sectionDetails;
                    await displayProducts('section', Section_ID, Category_ID);
                } 
                
                if (!sectionDetails) {
                    console.log('Section details not found');
                }
            } catch (error) {
                console.error('Error getting section details:', error);
            }
        }
    });
});




// Shopping Cart
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




// ===== ===== ===== ===== ===== FORM HANDLER ===== ===== ===== ===== ===== //
// Form Submission Handler
// Uncomment this function and the related code if you need to handle form submissions in the future

// function handleFormSubmission(event) {
//     event.preventDefault(); // Prevent the default form submission

//     const form = event.target;
//     const formData = new FormData(form);
    
//     // Collect form data
//     const data = {};
//     formData.forEach((value, key) => {
//         data[key] = value;
//     });
    
//     console.log('Form data:', data);

//     // Example: Sending data to Supabase
//     supabase
//         .from('YourTable')
//         .insert([data])
//         .then(({ data, error }) => {
//             if (error) {
//                 console.error('Error submitting form:', error);
//             } else {
//                 console.log('Form submitted successfully:', data);
//             }
//         });
// }

// // Adding event listener to the form
// document.querySelector('form').addEventListener('submit', handleFormSubmission);




// ===== ===== ===== ===== ===== DOMCONTENT INITIALIZATION ===== ===== ===== ===== ===== //
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await fillCategoryDropdown();
    await fetchAndSaveAllProducts();
});