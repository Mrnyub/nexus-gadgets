/* =========================================
   NEXUS GADGETS | MASTER ADMIN LOGIC
   ========================================= */
const CORRECT_PIN = "2026";
let targetTab = "inventory"; 

// 1. INITIALIZE ON LOAD
window.onload = function() {
    // Hide the PIN overlay initially
    document.getElementById("loginOverlay").style.display = "none";

    // Set default tab to Active Orders
    switchTab('orders'); 

    // Enable "Enter" key submission
    const pinInput = document.getElementById("adminPin");
    if(pinInput) {
        pinInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                checkPin();
            }
        });
    }

    // BULLETPROOF BUTTON CLICK FIX
    // Forcefully grabs the login button and tells it to run checkPin()
    const loginBtn = document.getElementById("loginBtn");
    if(loginBtn) {
        loginBtn.addEventListener("click", function(event) {
            event.preventDefault(); // Stops the button from accidentally submitting a form
            checkPin();
        });
    }

    // Allow clicking background to close PIN prompt
    const overlay = document.getElementById("loginOverlay");
    if(overlay) {
        overlay.addEventListener("click", function(e) {
            if(e.target === this) {
                this.style.display = "none";
            }
        });
    }

    // Load table data silently
    loadInventory();
    loadOrders();
};

// 2. TAB SWITCHING LOGIC (With Security Gate!)
function switchTab(tabName) {
    if (tabName === 'inventory' && localStorage.getItem("nexusAdminAccess") !== "granted") {
        targetTab = tabName; 
        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("adminPin").focus(); 
        return; 
    }

    // Hide all views
    document.getElementById('view-inventory').style.display = 'none';
    document.getElementById('view-orders').style.display = 'none';
    document.getElementById('view-analytics').style.display = 'none';

    // Remove active highlights
    document.getElementById('nav-inventory').classList.remove('active');
    document.getElementById('nav-orders').classList.remove('active');
    document.getElementById('nav-analytics').classList.remove('active');

    // Show selected view
    document.getElementById('view-' + tabName).style.display = 'block';
    document.getElementById('nav-' + tabName).classList.add('active');

    // Update Header
    const titleMap = {
        'inventory': 'Inventory Management',
        'orders': 'Active Order Fulfillment',
        'analytics': 'Store Performance Analytics'
    };
    document.getElementById('dashboardTitle').innerText = titleMap[tabName];
}

// 3. VERIFY THE PIN 
// 3. VERIFY THE PIN (BULLETPROOF VERSION)
window.checkPin = function() {
    const pinInput = document.getElementById("adminPin");
    
    // Safety check: if the input doesn't exist on the screen, stop here
    if (!pinInput) return; 
    
    const enteredPin = pinInput.value.trim();
    
    if (enteredPin === CORRECT_PIN) {
        alert("Login Successful! Welcome back, Admin.");
        
        localStorage.setItem("nexusAdminAccess", "granted");
        
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("loginError").style.display = "none";
        pinInput.value = ""; 
        
        // Push user to their target tab
        switchTab(targetTab); 
    } else {
        // Show error and clear input
        const errorMsg = document.getElementById("loginError");
        if (errorMsg) errorMsg.style.display = "block";
        
        pinInput.value = ""; 
        pinInput.focus();
    }
};

// 4. LOGOUT FUNCTION
function logout() {
    localStorage.removeItem("nexusAdminAccess");
    alert("Portal Locked. You will need a PIN to access Inventory.");
    switchTab('orders'); 
}

// 5. INVENTORY SYSTEM LOGIC
let inventoryData = [
    { id: "nexus-omni-pro", name: "Nexus Omni Pro", price: "₱45,990", stock: 24 },
    { id: "nexus-omni-core", name: "Nexus Omni Core", price: "₱34,500", stock: 8 },
    { id: "nexus-omni-mini", name: "Nexus Omni Mini", price: "₱20,990", stock: 0 }
];

if (localStorage.getItem("nexusInventory")) {
    inventoryData = JSON.parse(localStorage.getItem("nexusInventory"));
}

function loadInventory() {
    const tableBody = document.getElementById("inventoryTableBody");
    if (!tableBody) return; 

    tableBody.innerHTML = ""; 
    let lowStockCount = 0;

    inventoryData.forEach((item, index) => {
        let badgeHTML = '';
        if (item.stock > 10) {
            badgeHTML = '<span class="status-badge in-stock">In Stock</span>';
        } else if (item.stock > 0) {
            badgeHTML = '<span class="status-badge low-stock">Low Stock</span>';
            lowStockCount++;
        } else {
            badgeHTML = '<span class="status-badge out-stock">Out of Stock</span>';
            lowStockCount++;
        }

        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.stock}</td>
                <td>${badgeHTML}</td>
                <td><button class="action-btn" onclick="deleteProduct(${index})" style="color: #F44336;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("totalProductsStat").innerText = inventoryData.length;
    document.getElementById("lowStockStat").innerText = lowStockCount;
}

function addNewProduct() {
    const name = prompt("Enter Product Name:");
    if (!name) return; 
    const price = prompt("Enter Price (e.g., ₱10,000):");
    let stock = parseInt(prompt("Enter Starting Stock Quantity:"));
    if (isNaN(stock)) stock = 0; 

    const id = name.toLowerCase().replace(/ /g, '-'); 
    inventoryData.push({ id: id, name: name, price: price, stock: stock });
    localStorage.setItem("nexusInventory", JSON.stringify(inventoryData));
    loadInventory();
}

function deleteProduct(index) {
    if (confirm("Are you sure you want to delete this product?")) {
        inventoryData.splice(index, 1); 
        localStorage.setItem("nexusInventory", JSON.stringify(inventoryData));
        loadInventory();
    }
}

// 6. ORDER MANAGEMENT LOGIC
let ordersData = [
    { orderId: "NEX-987654", customer: "Mark D.", date: "Today, 10:42 AM", total: "₱45,990", status: "Pending" },
    { orderId: "NEX-987653", customer: "Sarah L.", date: "Yesterday", total: "₱12,999", status: "Pending" },
    { orderId: "NEX-987650", customer: "John R.", date: "Mar 25, 2026", total: "₱4,500", status: "Shipped" }
];

function loadOrders() {
    const tableBody = document.getElementById("ordersTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    let pendingCount = 0;

    ordersData.forEach((order, index) => {
        let badgeClass = order.status === 'Pending' ? 'low-stock' : 'in-stock';
        let actionBtn = order.status === 'Pending' 
            ? `<button class="btn primary-btn" onclick="shipOrder(${index})" style="padding: 5px 10px; font-size: 12px;">Mark Shipped</button>` 
            : `<span style="color: #888; font-size: 12px;">Completed</span>`;

        if(order.status === "Pending") pendingCount++;

        const row = `
            <tr>
                <td style="color: #FFD700; font-weight: bold;">${order.orderId}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>${order.total}</td>
                <td><span class="status-badge ${badgeClass}">${order.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    document.getElementById("pendingOrdersStat").innerText = pendingCount;
}

function shipOrder(index) {
    ordersData[index].status = "Shipped";
    loadOrders();
    alert(`Order ${ordersData[index].orderId} has been successfully marked as shipped! The customer will be notified.`);
}