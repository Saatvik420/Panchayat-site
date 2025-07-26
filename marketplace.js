const mockCrops = [
    { id: 1, name: "Wheat", price: 2450, unit: "Quintal", image: "https://images.unsplash.com/photo-1501436516688-48b8d3e27d55", description: "Premium wheat from local farms.", farmer: "Ramesh Patel" },
    { id: 2, name: "Rice", price: 7200, unit: "Quintal", image: "https://images.unsplash.com/photo-1598033125338-31e73047d06e", description: "Fragrant basmati rice.", farmer: "Suresh Kumar" },
    { id: 3, name: "Maize", price: 2100, unit: "Quintal", image: "https://images.unsplash.com/photo-1603049283652-324d3e6d9f49", description: "Fresh yellow maize.", farmer: "Anil Sharma" },
    { id: 4, name: "Millet", price: 4500, unit: "Quintal", image: "https://images.unsplash.com/photo-1606143385562-c288a6899fd0", description: "Nutritious pearl millet.", farmer: "Vikram Singh" }
];

const mockFertilizers = [
    { id: 1, name: "Urea", price: 300, unit: "Kg", image: "https://images.unsplash.com/photo-1596890331082-13b2e2eb07cb", description: "High-nitrogen fertilizer." },
    { id: 2, name: "DAP", price: 1200, unit: "Kg", image: "https://images.unsplash.com/photo-1581889470140-42c4b6b77d0f", description: "Diammonium phosphate." }
];

const mockOrders = [
    { id: 1, buyerId: 1, buyerName: "Amit Sharma", items: [{ name: "Wheat", quantity: 2, unit: "Quintal", farmer: "Ramesh Patel" }, { name: "Rice", quantity: 1, unit: "Quintal", farmer: "Suresh Kumar" }], total: 9700, status: "Completed", timestamp: "7/26/2025, 10:00 AM" },
    { id: 2, buyerId: 2, buyerName: "Priya Patel", items: [{ name: "Maize", quantity: 3, unit: "Quintal", farmer: "Anil Sharma" }], total: 6300, status: "Pending", timestamp: "7/26/2025, 11:00 AM" }
];

let cropSalesChart = null;

// Initialize localStorage
const initStorage = () => {
    try {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        if (!localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(null));
        }
        if (!localStorage.getItem('crops')) {
            localStorage.setItem('crops', JSON.stringify(mockCrops));
        }
        if (!localStorage.getItem('fertilizers')) {
            localStorage.setItem('fertilizers', JSON.stringify(mockFertilizers));
        }
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify(mockOrders));
        }
    } catch (error) {
        console.error('Failed to initialize storage:', error);
        alert('Storage initialization failed. Please enable cookies.');
    }
};

// Render crops
const renderCrops = (crops) => {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    grid.innerHTML = '';
    crops.forEach(crop => {
        const card = document.createElement('div');
        card.classList.add('crop-card');
        card.innerHTML = `
            <img src="${crop.image}" alt="${crop.name}" class="crop-image">
            <h4>${crop.name}</h4>
            <p>₹ ${crop.price} / ${crop.unit}</p>
            <p>${crop.description}</p>
            <p>Farmer: ${crop.farmer}</p>
            <button class="btn btn-secondary add-to-cart-btn" data-id="${crop.id}">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
};

// Filter crops
const filterCrops = () => {
    const searchInput = document.getElementById('crop-search')?.value.toLowerCase();
    if (!searchInput) return;
    const crops = JSON.parse(localStorage.getItem('crops')) || mockCrops;
    const filteredCrops = crops.filter(crop => crop.name.toLowerCase().includes(searchInput));
    renderCrops(filteredCrops);
};

// Update cart count
const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const count = cart.reduce((sum, item) => sum + (item.userId === currentUser?.id ? item.quantity : 0), 0);
    const cartCounts = document.querySelectorAll('#cart-count, #mobile-cart-count');
    cartCounts.forEach(countElement => countElement.textContent = count);
};

// Render cart
const renderCart = () => {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userCart = cart.filter(item => item.userId === currentUser?.id);
    cartItems.innerHTML = userCart.length === 0 ? '<p>Your cart is empty.</p>' : '';
    let total = 0;
    userCart.forEach(item => {
        const crop = JSON.parse(localStorage.getItem('crops')).find(c => c.id === item.cropId);
        if (crop) {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="${crop.image}" alt="${crop.name}">
                <span>${crop.name} (${item.quantity} ${crop.unit})</span>
                <span>₹ ${crop.price * item.quantity}</span>
            `;
            cartItems.appendChild(itemElement);
            total += crop.price * item.quantity;
        }
    });
    document.getElementById('cart-total').textContent = total;
};

// Add to cart
const addToCart = (cropId) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign in to add items to the cart.');
        openModal('sign-in-modal');
        return;
    }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.cropId === cropId && item.userId === currentUser.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ cropId, userId: currentUser.id, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
};

// Clear cart
const clearCart = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.userId !== currentUser.id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
};

// Checkout
const handleCheckout = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign in to checkout.');
        openModal('sign-in-modal');
        return;
    }
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const userCart = cart.filter(item => item.userId === currentUser.id);
    if (userCart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    const crops = JSON.parse(localStorage.getItem('crops')) || mockCrops;
    let total = 0;
    const items = userCart.map(item => {
        const crop = crops.find(c => c.id === item.cropId);
        total += crop.price * item.quantity;
        return { name: crop.name, quantity: item.quantity, unit: crop.unit, farmer: crop.farmer };
    });
    const order = {
        id: Date.now(),
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        items,
        total,
        status: 'Pending',
        timestamp: new Date().toLocaleString()
    };
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    clearCart();
    closeModal('cart-modal');
    alert('Order placed successfully!');
    renderOrders();
    renderCropSalesChart();
};

// Toggle navigation
const updateNav = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const signUpLinks = document.querySelectorAll('#sign-up-nav-link, #mobile-sign-up-nav-link');
    const signInLinks = document.querySelectorAll('#sign-in-nav-link, #mobile-sign-in-nav-link');
    const logoutLinks = document.querySelectorAll('#logout-nav-link, #mobile-logout-nav-link');
    const authHidden = document.querySelectorAll('.auth-hidden');
    if (currentUser) {
        signUpLinks.forEach(link => link.style.display = 'none');
        signInLinks.forEach(link => link.style.display = 'none');
        logoutLinks.forEach(link => link.style.display = 'block');
        authHidden.forEach(link => link.style.display = 'block');
    } else {
        signUpLinks.forEach(link => link.style.display = 'block');
        signInLinks.forEach(link => link.style.display = 'block');
        logoutLinks.forEach(link => link.style.display = 'none');
        authHidden.forEach(link => link.style.display = 'none');
    }
};

// Modal handling
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

// Sign-up
const handleSignUp = (e) => {
    e.preventDefault();
    try {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        if (!nameInput || !emailInput || !passwordInput) {
            alert('Signup form is not properly loaded. Please try again.');
            return false;
        }
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!name || !email || !password) {
            document.querySelector('#sign-up-form .error-message')?.remove();
            const error = document.createElement('p');
            error.classList.add('error-message');
            error.textContent = 'Please fill in all fields.';
            document.getElementById('sign-up-form').appendChild(error);
            return false;
        }
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(user => user.email === email)) {
            document.querySelector('#sign-up-form .error-message')?.remove();
            const error = document.createElement('p');
            error.classList.add('error-message');
            error.textContent = 'Email already exists.';
            document.getElementById('sign-up-form').appendChild(error);
            return false;
        }
        const user = { id: users.length + 1, name, email, password };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('sign-up-form').reset();
        closeModal('sign-up-modal');
        updateNav();
        alert('Sign-up successful! You are now logged in.');
    } catch (error) {
        console.error('Sign-up error:', error);
        document.querySelector('#sign-up-form .error-message')?.remove();
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error-message');
        errorMsg.textContent = 'An error occurred during sign-up. Please try again.';
        document.getElementById('sign-up-form')?.appendChild(errorMsg);
    }
    return false;
};

// Sign-in
const handleSignIn = (e) => {
    e.preventDefault();
    try {
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value.trim();
        if (!email || !password) {
            document.querySelector('#sign-in-form .error-message')?.remove();
            const error = document.createElement('p');
            error.classList.add('error-message');
            error.textContent = 'Please fill in all fields.';
            document.getElementById('sign-in-form').appendChild(error);
            return false;
        }
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(user => user.email === email && user.password === password);
        if (!user) {
            document.querySelector('#sign-in-form .error-message')?.remove();
            const error = document.createElement('p');
            error.classList.add('error-message');
            error.textContent = 'Invalid email or password.';
            document.getElementById('sign-in-form').appendChild(error);
            return false;
        }
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('sign-in-form').reset();
        closeModal('sign-in-modal');
        updateNav();
        updateCartCount();
        renderCart();
        alert('Sign-in successful!');
    } catch (error) {
        console.error('Sign-in error:', error);
        document.querySelector('#sign-in-form .error-message')?.remove();
        const errorMsg = document.createElement('p');
        errorMsg.classList.add('error-message');
        errorMsg.textContent = 'An error occurred during sign-in. Please try again.';
        document.getElementById('sign-in-form')?.appendChild(errorMsg);
    }
    return false;
};

// Logout
const handleLogout = () => {
    localStorage.setItem('currentUser', JSON.stringify(null));
    updateNav();
    updateCartCount();
    renderCart();
    alert('Logged out successfully.');
};

// Add crop
const addCrop = (e) => {
    e.preventDefault();
    try {
        const name = document.getElementById('crop-name').value.trim();
        const price = parseFloat(document.getElementById('crop-price').value);
        const unit = document.getElementById('crop-unit').value.trim();
        const image = document.getElementById('crop-image').value || 'https://via.placeholder.com/150';
        const description = document.getElementById('crop-description').value.trim();
        const farmer = document.getElementById('crop-farmer').value.trim();
        if (!name || !price || !unit || !farmer) {
            alert('Please fill in all required fields.');
            return false;
        }
        let crops = JSON.parse(localStorage.getItem('crops')) || [];
        const newCrop = { id: crops.length + 1, name, price, unit, image, description, farmer };
        crops.push(newCrop);
        localStorage.setItem('crops', JSON.stringify(crops));
        document.getElementById('add-crop-form').reset();
        renderCropPrices();
        renderCrops(JSON.parse(localStorage.getItem('crops')));
        alert('Crop added successfully!');
    } catch (error) {
        console.error('Add crop error:', error);
        alert('Failed to add crop. Please try again.');
    }
    return false;
};

// Add fertilizer
const addFertilizer = (e) => {
    e.preventDefault();
    try {
        const name = document.getElementById('fertilizer-name').value.trim();
        const price = parseFloat(document.getElementById('fertilizer-price').value);
        const unit = document.getElementById('fertilizer-unit').value.trim();
        const image = document.getElementById('fertilizer-image').value || 'https://via.placeholder.com/150';
        const description = document.getElementById('fertilizer-description').value.trim();
        if (!name || !price || !unit) {
            alert('Please fill in all required fields.');
            return false;
        }
        let fertilizers = JSON.parse(localStorage.getItem('fertilizers')) || [];
        const newFertilizer = { id: fertilizers.length + 1, name, price, unit, image, description };
        fertilizers.push(newFertilizer);
        localStorage.setItem('fertilizers', JSON.stringify(fertilizers));
        document.getElementById('add-fertilizer-form').reset();
        renderFertilizerPrices();
        alert('Fertilizer added successfully!');
    } catch (error) {
        console.error('Add fertilizer error:', error);
        alert('Failed to add fertilizer. Please try again.');
    }
    return false;
};

// Render crop prices
const renderCropPrices = () => {
    const tbody = document.getElementById('crop-prices-body');
    if (!tbody) return;
    const crops = JSON.parse(localStorage.getItem('crops')) || mockCrops;
    tbody.innerHTML = '';
    crops.forEach(crop => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crop.name}</td>
            <td><input type="number" value="${crop.price}" data-id="${crop.id}" class="crop-price-input"></td>
            <td>${crop.farmer}</td>
            <td><button class="btn btn-secondary update-crop-btn" data-id="${crop.id}">Update</button></td>
        `;
        tbody.appendChild(row);
    });
};

// Render fertilizer prices
const renderFertilizerPrices = () => {
    const tbody = document.getElementById('fertilizer-prices-body');
    if (!tbody) return;
    const fertilizers = JSON.parse(localStorage.getItem('fertilizers')) || mockFertilizers;
    tbody.innerHTML = '';
    fertilizers.forEach(fertilizer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fertilizer.name}</td>
            <td><input type="number" value="${fertilizer.price}" data-id="${fertilizer.id}" class="fertilizer-price-input"></td>
            <td><button class="btn btn-secondary update-fertilizer-btn" data-id="${fertilizer.id}">Update</button></td>
        `;
        tbody.appendChild(row);
    });
};

// Render orders
const renderOrders = () => {
    const tbody = document.getElementById('orders-body');
    if (!tbody) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const crops = JSON.parse(localStorage.getItem('crops')) || mockCrops;
    tbody.innerHTML = '';
    orders.forEach(order => {
        const items = order.items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
        const farmers = order.items.map(item => item.farmer).filter((v, i, a) => a.indexOf(v) === i).join(', ');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.buyerName}</td>
            <td>${items}</td>
            <td>₹ ${order.total}</td>
            <td>${farmers}</td>
            <td>
                <select class="order-status" data-id="${order.id}">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td><button class="btn btn-secondary update-order-btn" data-id="${order.id}">Update</button></td>
        `;
        tbody.appendChild(row);
    });
};

// Render crop sales chart
const renderCropSalesChart = () => {
    const canvas = document.getElementById('crop-sales-chart');
    if (!canvas) return;
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const cropSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (cropSales[item.name]) {
                cropSales[item.name] += item.quantity;
            } else {
                cropSales[item.name] = item.quantity;
            }
        });
    });
    const labels = Object.keys(cropSales);
    const data = Object.values(cropSales);
    if (cropSalesChart) {
        cropSalesChart.destroy();
    }
    cropSalesChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity Sold',
                data: data,
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Quantity (Quintal/Kg)' }
                },
                x: {
                    title: { display: true, text: 'Crop Type' }
                }
            },
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Crop Sales by Type' },
                tooltip: {
                    animation: {
                        duration: 300,
                        easing: 'easeOutQuart'
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutBounce',
                y: {
                    from: 0
                }
            }
        }
    });
};

// Update crop price
const updateCropPrice = (cropId, newPrice) => {
    let crops = JSON.parse(localStorage.getItem('crops')) || [];
    crops = crops.map(crop => crop.id === cropId ? { ...crop, price: newPrice } : crop);
    localStorage.setItem('crops', JSON.stringify(crops));
    renderCropPrices();
    renderCrops(JSON.parse(localStorage.getItem('crops')));
    alert('Crop price updated!');
};

// Update fertilizer price
const updateFertilizerPrice = (fertilizerId, newPrice) => {
    let fertilizers = JSON.parse(localStorage.getItem('fertilizers')) || [];
    fertilizers = fertilizers.map(fertilizer => fertilizer.id === fertilizerId ? { ...fertilizer, price: newPrice } : fertilizer);
    localStorage.setItem('fertilizers', JSON.stringify(fertilizers));
    renderFertilizerPrices();
    alert('Fertilizer price updated!');
};

// Update order status
const updateOrderStatus = (orderId, newStatus) => {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order);
    localStorage.setItem('orders', JSON.stringify(orders));
    renderOrders();
    renderCropSalesChart();
    alert('Order status updated!');
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    renderCrops(JSON.parse(localStorage.getItem('crops')) || mockCrops);
    renderCropPrices();
    renderFertilizerPrices();
    renderOrders();
    renderCropSalesChart();
    updateNav();
    updateCartCount();
    renderCart();

    // Event listeners
    document.getElementById('crop-search')?.addEventListener('input', filterCrops);
    document.getElementById('sign-up-nav-link')?.addEventListener('click', () => openModal('sign-up-modal'));
    document.getElementById('mobile-sign-up-nav-link')?.addEventListener('click', () => openModal('sign-up-modal'));
    document.getElementById('sign-in-nav-link')?.addEventListener('click', () => openModal('sign-in-modal'));
    document.getElementById('mobile-sign-in-nav-link')?.addEventListener('click', () => openModal('sign-in-modal'));
    document.getElementById('cart-nav-link')?.addEventListener('click', () => openModal('cart-modal'));
    document.getElementById('mobile-cart-nav-link')?.addEventListener('click', () => openModal('cart-modal'));
    document.getElementById('logout-nav-link')?.addEventListener('click', handleLogout);
    document.getElementById('mobile-logout-nav-link')?.addEventListener('click', handleLogout);
    document.getElementById('sign-up-form')?.addEventListener('submit', handleSignUp);
    document.getElementById('sign-in-form')?.addEventListener('submit', handleSignIn);
    document.getElementById('add-crop-form')?.addEventListener('submit', addCrop);
    document.getElementById('add-fertilizer-form')?.addEventListener('submit', addFertilizer);
    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
    document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
    document.querySelectorAll('.close-button').forEach(btn => btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
    }));
    document.getElementById('marketplace-grid')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const cropId = parseInt(e.target.dataset.id);
            addToCart(cropId);
        }
    });
    document.getElementById('crop-prices-body')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-crop-btn')) {
            const cropId = parseInt(e.target.dataset.id);
            const input = e.target.closest('tr').querySelector('.crop-price-input');
            const newPrice = parseFloat(input.value);
            if (newPrice > 0) updateCropPrice(cropId, newPrice);
        }
    });
    document.getElementById('fertilizer-prices-body')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-fertilizer-btn')) {
            const fertilizerId = parseInt(e.target.dataset.id);
            const input = e.target.closest('tr').querySelector('.fertilizer-price-input');
            const newPrice = parseFloat(input.value);
            if (newPrice > 0) updateFertilizerPrice(fertilizerId, newPrice);
        }
    });
    document.getElementById('orders-body')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('update-order-btn')) {
            const orderId = parseInt(e.target.dataset.id);
            const select = e.target.closest('tr').querySelector('.order-status');
            const newStatus = select.value;
            updateOrderStatus(orderId, newStatus);
        }
    });
    document.querySelector('.profile-toggle')?.addEventListener('click', () => {
        document.querySelector('.mobile-nav-list').classList.toggle('active');
    });
});