document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions for Local Storage ---
    function getStoredData(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error parsing data from localStorage for key "${key}":`, e);
            return defaultValue;
        }
    }

    function setStoredData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // --- Generate a unique browser ID (for simulating user-specific data without login) ---
    function getBrowserId() {
        let browserId = localStorage.getItem('browserId');
        if (!browserId) {
            browserId = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('browserId', browserId);
        }
        return browserId;
    }

    const currentBrowserId = getBrowserId(); // Get or create browser ID on load

    // --- Data Initialization (for demonstration) ---
    // Initialize with some dummy data if not present
    if (!localStorage.getItem('crops')) {
        setStoredData('crops', [
            { id: 1, name: 'Wheat', price: 2450, unit: 'Quintal', trend: 'Stable', lastUpdated: '2025-07-16', topCrop: true },
            { id: 2, name: 'Rice (Basmati)', price: 7200, unit: 'Quintal', trend: 'Up', lastUpdated: '2025-07-16', topCrop: true },
            { id: 3, name: 'Maize', price: 2100, unit: 'Quintal', trend: 'Down', lastUpdated: '2025-07-16', topCrop: false },
            { id: 4, name: 'Potato', price: 1800, unit: 'Quintal', trend: 'Stable', lastUpdated: '2025-07-15', topCrop: true },
            { id: 5, name: 'Onion', price: 2500, unit: 'Quintal', trend: 'Up', lastUpdated: '2025-07-16', topCrop: false }
        ]);
    }

    if (!localStorage.getItem('fertilizers')) {
        setStoredData('fertilizers', [
            { id: 1, name: 'Urea', unit: '50kg bag', price: 300, lastUpdated: '2025-07-10' },
            { id: 2, name: 'DAP', unit: '50kg bag', price: 1350, lastUpdated: '2025-07-12' },
            { id: 3, name: 'Potash (MOP)', unit: '50kg bag', price: 900, lastUpdated: '2025-07-08' },
            { id: 4, name: 'Pesticide (Brand X)', unit: '1 Litre', price: 750, lastUpdated: '2025-07-05' }
        ]);
    }

    if (!localStorage.getItem('feedbacks')) {
        setStoredData('feedbacks', [
            { id: 1, browserId: 'user-dummy-1', name: 'Ramesh Singh', contact: '9876543210', category: 'infrastructure', subject: 'Road condition near school', description: 'The road leading to the village school is severely damaged and causes issues during monsoon.', status: 'New', reply: '', submittedAt: '2025-07-14' },
            { id: 2, browserId: 'user-dummy-2', name: 'Anonymous', contact: '', category: 'crop', subject: 'Pest issue in paddy fields', description: 'Some unknown pest is affecting paddy crops. Need advice/solution from agriculture department.', status: 'In Progress', reply: 'Panchayat is coordinating with agriculture experts. Expect a visit next week.', submittedAt: '2025-07-10' },
            { id: 3, browserId: 'user-dummy-1', name: 'Sunita Devi', contact: '9988776655', category: 'social', subject: 'Drinking water scarcity', description: 'The public handpump has been dry for a week. Villagers are facing severe water shortage.', status: 'New', reply: '', submittedAt: '2025-07-17' }
        ]);
    }

    // New: Announcements data
    if (!localStorage.getItem('announcements')) {
        setStoredData('announcements', [
            { id: 1, title: 'Village Meeting on Water Supply', content: 'A special village meeting will be held on 2025-07-25 at 10 AM in the Panchayat Bhawan to discuss water supply issues.', publishedOn: '2025-07-18' },
            { id: 2, title: 'New Government Scheme for Farmers', content: 'Details about the new central government scheme for small and marginal farmers will be shared next week. Stay tuned for more updates.', publishedOn: '2025-07-15' }
        ]);
    }

    // --- Homepage Logic (`index.html`) ---
    if (document.getElementById('crop-snapshot')) {
        const crops = getStoredData('crops');
        const snapshotDiv = document.getElementById('crop-snapshot');
        snapshotDiv.innerHTML = ''; // Clear loading message

        const topCrops = crops.filter(crop => crop.topCrop).sort((a,b) => b.id - a.id); // Show top crops, newest first

        if (topCrops.length > 0) {
            topCrops.forEach(crop => {
                const item = document.createElement('div');
                item.classList.add('crop-item');
                item.innerHTML = `
                    <h4>${crop.name}</h4>
                    <p>₹ ${crop.price} / ${crop.unit}</p>
                    <span class="trend">Trend: ${crop.trend}</span>
                `;
                snapshotDiv.appendChild(item);
            });
        } else {
            snapshotDiv.innerHTML = '<p>No top crop prices available yet. Please check back later.</p>';
        }
    }

    // Corrected: Display Announcements on Homepage as <li> items within a <ul>
    if (document.getElementById('announcements-list')) {
        const announcementsListUl = document.getElementById('announcements-list'); // This is now a UL
        function renderHomepageAnnouncements() {
            const announcements = getStoredData('announcements');
            announcementsListUl.innerHTML = ''; // Clear existing list

            if (announcements.length === 0) {
                announcementsListUl.innerHTML = '<p>No announcements available yet. Please check back later.</p>';
                return;
            }
            // Sort by most recent publishedOn date
            const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn));

            sortedAnnouncements.forEach(announcement => {
                const listItem = document.createElement('li'); // Create LI
                // Using template literals to keep the structure close to your original static list
                listItem.innerHTML = `
                    <p><strong>${announcement.title}</strong> (${announcement.publishedOn})</p>
                    <p>${announcement.content}</p>
                `;
                announcementsListUl.appendChild(listItem);
            });
        }
        renderHomepageAnnouncements(); // Initial render
    }


    // --- Crop Prices Page Logic (`crop-prices.html`) ---
    if (document.getElementById('crop-prices-body')) {
        const cropPricesBody = document.getElementById('crop-prices-body');
        const cropSearchInput = document.getElementById('crop-search');

        function renderCropPrices(filter = '') {
            const crops = getStoredData('crops');
            cropPricesBody.innerHTML = ''; // Clear previous entries

            const filteredCrops = crops.filter(crop =>
                crop.name.toLowerCase().includes(filter.toLowerCase())
            );

            if (filteredCrops.length > 0) {
                filteredCrops.forEach(crop => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${crop.name}</td>
                        <td>₹ ${crop.price} / ${crop.unit}</td>
                        <td>${crop.trend}</td>
                        <td>${crop.lastUpdated}</td>
                    `;
                    cropPricesBody.appendChild(row);
                });
            } else {
                cropPricesBody.innerHTML = '<tr><td colspan="4">No crops found matching your search.</td></tr>';
            }
        }

        renderCropPrices(); // Initial render
        if (cropSearchInput) { // Check if element exists before adding listener
            cropSearchInput.addEventListener('input', (e) => renderCropPrices(e.target.value));
        }
    }

    // --- Fertilizers Page Logic (`fertilizers.html`) ---
    if (document.getElementById('fertilizer-prices-body')) {
        const fertilizerPricesBody = document.getElementById('fertilizer-prices-body');
        const fertilizerSearchInput = document.getElementById('fertilizer-search');

        function renderFertilizerPrices(filter = '') {
            const fertilizers = getStoredData('fertilizers');
            fertilizerPricesBody.innerHTML = '';

            const filteredFertilizers = fertilizers.filter(item =>
                item.name.toLowerCase().includes(filter.toLowerCase())
            );

            if (filteredFertilizers.length > 0) {
                filteredFertilizers.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.unit}</td>
                        <td>₹ ${item.price}</td>
                        <td>${item.lastUpdated}</td>
                    `;
                    fertilizerPricesBody.appendChild(row);
                });
            } else {
                fertilizerPricesBody.innerHTML = '<tr><td colspan="4">No products found matching your search.</td></tr>';
            }
        }

        renderFertilizerPrices();
        if (fertilizerSearchInput) { // Check if element exists before adding listener
            fertilizerSearchInput.addEventListener('input', (e) => renderFertilizerPrices(e.target.value));
        }
    }

    // --- Feedback Page Logic (`feedback.html`) ---
    if (document.getElementById('feedbackForm')) {
        const feedbackForm = document.getElementById('feedbackForm');
        const userFeedbackListBody = document.getElementById('user-feedback-list-body');

        // Function to render user-specific feedback
        function renderUserFeedbackList() {
            const allFeedbacks = getStoredData('feedbacks');
            // Filter feedbacks to show only those submitted by the current browser/user
            const userFeedbacks = allFeedbacks.filter(f => f.browserId === currentBrowserId);

            // Sort by submittedAt (most recent first), then by ID (for consistent tie-breaking)
            const sortedUserFeedbacks = userFeedbacks.sort((a, b) => {
                const dateA = new Date(a.submittedAt);
                const dateB = new Date(b.submittedAt);
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
                return b.id - a.id; // Latest ID if dates are same
            });

            userFeedbackListBody.innerHTML = ''; // Clear existing list

            if (sortedUserFeedbacks.length === 0) {
                userFeedbackListBody.innerHTML = '<tr><td colspan="7">No requests submitted from this browser yet.</td></tr>';
                return;
            }

            sortedUserFeedbacks.forEach(feedback => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${feedback.id}</td>
                    <td>${feedback.subject}</td>
                    <td>${feedback.category}</td>
                    <td>${feedback.status}</td>
                    <td>${feedback.submittedAt}</td>
                    <td>${feedback.reply || 'No reply yet'}</td> <td class="actions-cell">
                        <button class="btn btn-sm delete-user-feedback-btn btn-secondary" data-id="${feedback.id}">Delete Local Record</button>
                    </td>
                `;
                userFeedbackListBody.appendChild(row);
            });

            // Attach event listeners for "Delete Local Record" buttons
            document.querySelectorAll('.delete-user-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idToDelete = parseInt(e.target.dataset.id);
                    if (confirm('Are you sure you want to delete this record from YOUR page? This action will also remove it from Panchayat records as it is a client-side only application.')) {
                        let allFeedbacks = getStoredData('feedbacks');
                        const originalLength = allFeedbacks.length;
                        allFeedbacks = allFeedbacks.filter(f => f.id !== idToDelete); // Remove the feedback
                        setStoredData('feedbacks', allFeedbacks); // Update Local Storage

                        if (allFeedbacks.length < originalLength) {
                            alert('Your request has been removed from the system.');
                        } else {
                            alert('Failed to remove request. It might have already been processed or removed.');
                        }
                        renderUserFeedbackList(); // Re-render the user's list
                    }
                });
            });
        }

        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const name = document.getElementById('name').value;
            const contact = document.getElementById('contact').value;
            const category = document.getElementById('category').value;
            const subject = document.getElementById('subject').value;
            const description = document.getElementById('description').value;

            if (!category || !subject || !description) {
                alert('Please fill in all required fields (Category, Subject, Description).');
                return;
            }

            const feedbacks = getStoredData('feedbacks');
            const newFeedback = {
                id: feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1,
                browserId: currentBrowserId, // Associate feedback with the current browser
                name: name || 'Anonymous',
                contact: contact,
                category: category,
                subject: subject,
                description: description,
                status: 'New', // Default status
                reply: '', // Initialize reply as empty
                submittedAt: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
            };

            feedbacks.push(newFeedback);
            setStoredData('feedbacks', feedbacks);

            alert('Your feedback has been submitted successfully!');
            feedbackForm.reset(); // Clear the form
            renderUserFeedbackList(); // Re-render the user's feedback list
        });

        renderUserFeedbackList(); // Initial render of user's feedback
    }

    // --- Panchayat Authentication and Common Functions for Panchayat Pages ---
    const PANCHAYAT_USERNAME = "Saatvik";
    const PANCHAYAT_PASSWORD = "12345"; // INSECURE for production!

    function authenticatePanchayat(dashboardElementId) {
        const bodyElement = document.body;
        const dashboardElement = document.getElementById(dashboardElementId);
        const logoutBtn = document.getElementById('logout-btn');

        // Check if already authenticated via session storage (for simple persistence across refreshes)
        if (sessionStorage.getItem('isAuthenticated') === 'true') {
            bodyElement.classList.remove('hidden-content');
            if (dashboardElement) dashboardElement.style.display = 'block'; // Ensure dashboard is visible
            return true;
        }

        const username = prompt("Enter Panchayat Username:");
        const password = prompt("Enter Password:");

        if (username === PANCHAYAT_USERNAME && password === PANCHAYAT_PASSWORD) {
            alert("Login Successful!");
            sessionStorage.setItem('isAuthenticated', 'true'); // Mark as authenticated
            bodyElement.classList.remove('hidden-content');
            if (dashboardElement) dashboardElement.style.display = 'block';
            return true;
        } else {
            alert("Access denied. Incorrect username or password.");
            window.location.href = 'index.html'; // Redirect if authentication fails
            return false;
        }
    }

    // Logout functionality (common for all Panchayat pages)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                sessionStorage.removeItem('isAuthenticated'); // Clear authentication status
                window.location.href = 'index.html'; // Redirect to homepage
            }
        });
    }

    // --- Feedback Detail Modal Logic (For Panchayat Chief Page) ---
    const feedbackDetailModal = document.getElementById('feedback-detail-modal');
    const closeModalBtn = feedbackDetailModal ? feedbackDetailModal.querySelector('.close-button') : null;
    const saveFeedbackChangesBtn = document.getElementById('save-feedback-changes');
    let currentFeedbackId = null; // To store the ID of the feedback being viewed/edited

    function openFeedbackDetailModal(id) {
        const feedbacks = getStoredData('feedbacks');
        const feedback = feedbacks.find(f => f.id === id);

        if (feedback) {
            currentFeedbackId = id; // Store for saving changes
            document.getElementById('detail-id').textContent = feedback.id;
            document.getElementById('detail-name').textContent = feedback.name;
            document.getElementById('detail-contact').textContent = feedback.contact || 'N/A';
            document.getElementById('detail-category').textContent = feedback.category;
            document.getElementById('detail-subject').textContent = feedback.subject;
            document.getElementById('detail-description').textContent = feedback.description;
            document.getElementById('detail-status').textContent = feedback.status;
            document.getElementById('detail-reply').textContent = feedback.reply || 'No reply yet.';

            document.getElementById('reply-textarea').value = feedback.reply;
            document.getElementById('status-select').value = feedback.status;

            feedbackDetailModal.style.display = 'block';
        }
    }

    function closeFeedbackDetailModal() {
        if (feedbackDetailModal) {
            feedbackDetailModal.style.display = 'none';
            currentFeedbackId = null;
        }
    }

    if (saveFeedbackChangesBtn) {
        saveFeedbackChangesBtn.addEventListener('click', () => {
            if (!currentFeedbackId) return;

            const feedbacks = getStoredData('feedbacks');
            const feedbackIndex = feedbacks.findIndex(f => f.id === currentFeedbackId);

            if (feedbackIndex > -1) {
                feedbacks[feedbackIndex].reply = document.getElementById('reply-textarea').value;
                feedbacks[feedbackIndex].status = document.getElementById('status-select').value;
                setStoredData('feedbacks', feedbacks);
                alert('Feedback updated successfully!');
                closeFeedbackDetailModal();
                // Re-render relevant data after update
                if (document.getElementById('panchayat-dashboard')) {
                    loadPanchayatDashboardData(); // Reload for the chief's view
                }
                // Important: Re-render the user's feedback list on their page if they are viewing it
                if (document.getElementById('user-feedback-list-body')) {
                    renderUserFeedbackList();
                }
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFeedbackDetailModal);
    }
    window.addEventListener('click', (event) => { // Close modal if clicked outside
        if (feedbackDetailModal && event.target === feedbackDetailModal) {
            closeFeedbackDetailModal();
        }
    });

    // --- Panchayat Chief Dashboard Logic (`panchayat-chief.html`) ---
    if (document.getElementById('panchayat-dashboard')) {
        const totalFeedbackElem = document.getElementById('total-feedback');
        const unresolvedIssuesElem = document.getElementById('unresolved-issues');
        const lastPriceUpdateElem = document.getElementById('last-price-update');
        const totalAnnouncementsElem = document.getElementById('total-announcements'); // New element
        const feedbackListBody = document.getElementById('feedback-list-body'); // For all feedback

        const editableCropPricesBody = document.getElementById('editable-crop-prices-body');
        const newCropNameInput = document.getElementById('new-crop-name');
        const newCropPriceInput = document.getElementById('new-crop-price');
        const newCropTrendSelect = document.getElementById('new-crop-trend');
        const addCropBtn = document.getElementById('add-crop-btn');

        const editableFertilizerPricesBody = document.getElementById('editable-fertilizer-prices-body');
        const newFertilizerNameInput = document.getElementById('new-fertilizer-name');
        const newFertilizerUnitInput = document.getElementById('new-fertilizer-unit');
        const newFertilizerPriceInput = document.getElementById('new-fertilizer-price');
        const addFertilizerBtn = document.getElementById('add-fertilizer-btn');

        const topCropPricesBody = document.getElementById('top-crop-prices-body');

        // New announcement elements
        const announcementTitleInput = document.getElementById('announcement-title');
        const announcementContentTextarea = document.getElementById('announcement-content');
        const addAnnouncementBtn = document.getElementById('add-announcement-btn');
        const announcementsChiefListBody = document.getElementById('announcements-chief-list-body');


        function loadPanchayatDashboardData() {
            // Load Feedback Summary
            const feedbacks = getStoredData('feedbacks');
            totalFeedbackElem.textContent = feedbacks.length;
            unresolvedIssuesElem.textContent = feedbacks.filter(f => f.status !== 'Resolved').length;

            // Load Announcement Summary
            const announcements = getStoredData('announcements');
            totalAnnouncementsElem.textContent = announcements.length; // Update total announcements count

            // Render ALL feedback for Panchayat Chief
            renderAllFeedbackListForPanchayat();

            // Load Crop Prices for editing
            renderEditableCropPrices();

            // Load Fertilizer Prices for editing
            renderEditableFertilizerPrices();

            // Load Today's Top Crop Prices
            renderTopCropPrices();

            // Render Announcements for Chief Management
            renderChiefAnnouncementsList();


            // Update last price update timestamp
            const crops = getStoredData('crops');
            const fertilizers = getStoredData('fertilizers');
            let latestDate = 'N/A';
            if (crops.length > 0 || fertilizers.length > 0) {
                // Get the latest update date from all crops and fertilizers
                const allDates = [
                    ...crops.map(c => c.lastUpdated),
                    ...fertilizers.map(f => f.lastUpdated)
                ].filter(Boolean); // Filter out any undefined/null dates
                
                // Sort dates in descending order to find the latest
                allDates.sort((a, b) => new Date(b) - new Date(a));
                
                latestDate = allDates.length > 0 ? allDates[0] : 'N/A';
            }
            lastPriceUpdateElem.textContent = latestDate;
        }

        // --- Render ALL Feedback for Panchayat Chief ---
        function renderAllFeedbackListForPanchayat() {
            const feedbacks = getStoredData('feedbacks');
            // Sort by submittedAt (most recent first), then by ID
            const sortedFeedbacks = feedbacks.sort((a, b) => {
                const dateA = new Date(a.submittedAt);
                const dateB = new Date(b.submittedAt);
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
                return b.id - a.id;
            });

            feedbackListBody.innerHTML = ''; // Clear existing list

            if (sortedFeedbacks.length === 0) {
                feedbackListBody.innerHTML = '<tr><td colspan="7">No feedback available.</td></tr>';
                return;
            }

            sortedFeedbacks.forEach(feedback => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${feedback.id}</td>
                    <td>${feedback.name}</td>
                    <td>${feedback.subject}</td>
                    <td>${feedback.category}</td>
                    <td>${feedback.status}</td>
                    <td>${feedback.submittedAt}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm view-feedback-btn" data-id="${feedback.id}">View/Reply</button>
                        <button class="btn btn-sm delete-feedback-btn btn-secondary" data-id="${feedback.id}">Delete</button>
                    </td>
                `;
                feedbackListBody.appendChild(row);
            });

            // Attach event listeners to "View/Reply" buttons (for Panchayat Chief)
            document.querySelectorAll('#feedback-list-body .view-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    openFeedbackDetailModal(id);
                });
            });

            // Attach event listeners to "Delete" buttons (for Panchayat Chief)
            document.querySelectorAll('#feedback-list-body .delete-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    if (confirm('Are you sure you want to delete this feedback from the system? This action is permanent.')) {
                        let feedbacks = getStoredData('feedbacks');
                        feedbacks = feedbacks.filter(f => f.id !== id);
                        setStoredData('feedbacks', feedbacks);
                        alert('Feedback deleted permanently!');
                        loadPanchayatDashboardData(); // Re-render the list and summary
                    }
                });
            });
        }

        // --- Today's Top Crop Prices Management ---
        function renderTopCropPrices() {
            const crops = getStoredData('crops');
            const topCrops = crops.filter(crop => crop.topCrop);
            topCropPricesBody.innerHTML = '';

            if (topCrops.length === 0) {
                topCropPricesBody.innerHTML = '<tr><td colspan="4">No top crops selected. Please set "topCrop" flag in "All Crop Prices" table.</td></tr>';
                return;
            }

            topCrops.forEach(crop => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', crop.id);
                row.innerHTML = `
                    <td>${crop.name}</td>
                    <td><input type="number" class="edit-price" value="${crop.price}" step="0.01"></td>
                    <td>
                        <select class="edit-trend">
                            <option value="Stable" ${crop.trend === 'Stable' ? 'selected' : ''}>Stable</option>
                            <option value="Up" ${crop.trend === 'Up' ? 'selected' : ''}>Up</option>
                            <option value="Down" ${crop.trend === 'Down' ? 'selected' : ''}>Down</option>
                        </select>
                    </td>
                    <td class="actions-cell">
                        <button class="btn btn-sm save-top-crop-btn">Save</button>
                    </td>
                `;
                topCropPricesBody.appendChild(row);
            });

            topCropPricesBody.querySelectorAll('.save-top-crop-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const newPrice = parseFloat(row.querySelector('.edit-price').value);
                    const newTrend = row.querySelector('.edit-trend').value;

                    if (isNaN(newPrice) || newPrice <= 0) {
                        alert('Please enter a valid positive price.');
                        return;
                    }

                    let crops = getStoredData('crops');
                    const cropIndex = crops.findIndex(c => c.id === id);
                    if (cropIndex > -1) {
                        crops[cropIndex].price = newPrice;
                        crops[cropIndex].trend = newTrend;
                        crops[cropIndex].lastUpdated = new Date().toISOString().slice(0, 10);
                        setStoredData('crops', crops);
                        alert('Top crop price updated!');
                        loadPanchayatDashboardData(); // Re-render all data
                    }
                });
            });
        }


        // --- All Crop Prices Management Functions ---
        function renderEditableCropPrices() {
            const crops = getStoredData('crops');
            editableCropPricesBody.innerHTML = '';

            if (crops.length === 0) {
                editableCropPricesBody.innerHTML = '<tr><td colspan="5">No crop prices to display.</td></tr>';
                return;
            }

            crops.forEach(crop => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', crop.id); // Store ID for easy access
                row.innerHTML = `
                    <td>${crop.name}</td>
                    <td><input type="number" class="edit-price" value="${crop.price}" step="0.01"></td>
                    <td>
                        <select class="edit-trend">
                            <option value="Stable" ${crop.trend === 'Stable' ? 'selected' : ''}>Stable</option>
                            <option value="Up" ${crop.trend === 'Up' ? 'selected' : ''}>Up</option>
                            <option value="Down" ${crop.trend === 'Down' ? 'selected' : ''}>Down</option>
                        </select>
                    </td>
                    <td>${crop.lastUpdated}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm save-crop-btn">Save</button>
                        <button class="btn btn-sm delete-crop-btn btn-secondary">Delete</button>
                        <label>
                            <input type="checkbox" class="toggle-top-crop" ${crop.topCrop ? 'checked' : ''}> Top
                        </label>
                    </td>
                `;
                editableCropPricesBody.appendChild(row);
            });

            // Attach event listeners for Save and Delete buttons
            editableCropPricesBody.querySelectorAll('.save-crop-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const newPrice = parseFloat(row.querySelector('.edit-price').value);
                    const newTrend = row.querySelector('.edit-trend').value;
                    const isTopCrop = row.querySelector('.toggle-top-crop').checked;


                    if (isNaN(newPrice) || newPrice <= 0) {
                        alert('Please enter a valid positive price.');
                        return;
                    }

                    let crops = getStoredData('crops');
                    const cropIndex = crops.findIndex(c => c.id === id);
                    if (cropIndex > -1) {
                        crops[cropIndex].price = newPrice;
                        crops[cropIndex].trend = newTrend;
                        crops[cropIndex].topCrop = isTopCrop; // Update topCrop flag
                        crops[cropIndex].lastUpdated = new Date().toISOString().slice(0, 10);
                        setStoredData('crops', crops);
                        alert('Crop price updated!');
                        loadPanchayatDashboardData(); // Re-render to show updated date and top crops
                    }
                });
            });

            editableCropPricesBody.querySelectorAll('.delete-crop-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this crop?')) {
                        const row = e.target.closest('tr');
                        const id = parseInt(row.dataset.id);
                        let crops = getStoredData('crops');
                        crops = crops.filter(c => c.id !== id);
                        setStoredData('crops', crops);
                        alert('Crop deleted!');
                        loadPanchayatDashboardData();
                    }
                });
            });

            editableCropPricesBody.querySelectorAll('.toggle-top-crop').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    // Save changes immediately when checkbox is toggled
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const isTopCrop = e.target.checked;

                    let crops = getStoredData('crops');
                    const cropIndex = crops.findIndex(c => c.id === id);
                    if (cropIndex > -1) {
                        crops[cropIndex].topCrop = isTopCrop;
                        setStoredData('crops', crops);
                        // Re-render only if necessary, or let the next full load handle it
                        // For simplicity, we just save and the next full refresh will pick it up
                        loadPanchayatDashboardData(); // Refresh to update top crops section
                    }
                });
            });
        }

        addCropBtn.addEventListener('click', () => {
            const name = newCropNameInput.value.trim();
            const price = parseFloat(newCropPriceInput.value);
            const trend = newCropTrendSelect.value;

            if (!name || isNaN(price) || price <= 0) {
                alert('Please enter a valid crop name and price.');
                return;
            }

            const crops = getStoredData('crops');
            const newCrop = {
                id: crops.length > 0 ? Math.max(...crops.map(c => c.id)) + 1 : 1,
                name: name,
                price: price,
                unit: 'Quintal', // Default unit, could add input for this
                trend: trend,
                lastUpdated: new Date().toISOString().slice(0, 10),
                topCrop: false // New crops are not top crops by default
            };
            crops.push(newCrop);
            setStoredData('crops', crops);
            alert('New crop added!');
            newCropNameInput.value = '';
            newCropPriceInput.value = '';
            newCropTrendSelect.value = 'Stable';
            loadPanchayatDashboardData();
        });


        function renderEditableFertilizerPrices() {
            const fertilizers = getStoredData('fertilizers');
            editableFertilizerPricesBody.innerHTML = '';

            if (fertilizers.length === 0) {
                editableFertilizerPricesBody.innerHTML = '<tr><td colspan="5">No fertilizer prices to display.</td></tr>';
                return;
            }

            fertilizers.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', item.id);
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td><input type="text" class="edit-unit" value="${item.unit}"></td>
                    <td><input type="number" class="edit-price" value="${item.price}" step="0.01"></td>
                    <td>${item.lastUpdated}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm save-fertilizer-btn">Save</button>
                        <button class="btn btn-sm delete-fertilizer-btn btn-secondary">Delete</button>
                    </td>
                `;
                editableFertilizerPricesBody.appendChild(row);
            });

            // Attach event listeners for Save and Delete buttons
            editableFertilizerPricesBody.querySelectorAll('.save-fertilizer-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const newUnit = row.querySelector('.edit-unit').value.trim();
                    const newPrice = parseFloat(row.querySelector('.edit-price').value);

                    if (!newUnit || isNaN(newPrice) || newPrice <= 0) {
                        alert('Please enter a valid unit and positive price.');
                        return;
                    }

                    let fertilizers = getStoredData('fertilizers');
                    const fertilizerIndex = fertilizers.findIndex(f => f.id === id);
                    if (fertilizerIndex > -1) {
                        fertilizers[fertilizerIndex].unit = newUnit;
                        fertilizers[fertilizerIndex].price = newPrice;
                        fertilizers[fertilizerIndex].lastUpdated = new Date().toISOString().slice(0, 10);
                        setStoredData('fertilizers', fertilizers);
                        alert('Fertilizer price updated!');
                        loadPanchayatDashboardData();
                    }
                });
            });

            editableFertilizerPricesBody.querySelectorAll('.delete-fertilizer-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this product?')) {
                        const row = e.target.closest('tr');
                        const id = parseInt(row.dataset.id);
                        let fertilizers = getStoredData('fertilizers');
                        fertilizers = fertilizers.filter(f => f.id !== id);
                        setStoredData('fertilizers', fertilizers);
                        alert('Product deleted!');
                        loadPanchayatDashboardData();
                    }
                });
            });
        }

        addFertilizerBtn.addEventListener('click', () => {
            const name = newFertilizerNameInput.value.trim();
            const unit = newFertilizerUnitInput.value.trim();
            const price = parseFloat(newFertilizerPriceInput.value);

            if (!name || !unit || isNaN(price) || price <= 0) {
                alert('Please enter a valid product name, unit, and price.');
                return;
            }

            const fertilizers = getStoredData('fertilizers');
            const newFertilizer = {
                id: fertilizers.length > 0 ? Math.max(...fertilizers.map(f => f.id)) + 1 : 1,
                name: name,
                unit: unit,
                price: price,
                lastUpdated: new Date().toISOString().slice(0, 10)
            };
            fertilizers.push(newFertilizer);
            setStoredData('fertilizers', fertilizers);
            alert('New product added!');
            newFertilizerNameInput.value = '';
            newFertilizerUnitInput.value = '';
            newFertilizerPriceInput.value = '';
            loadPanchayatDashboardData();
        });

        // --- Announcement Management Functions ---
        function renderChiefAnnouncementsList() {
            const announcements = getStoredData('announcements');
            announcementsChiefListBody.innerHTML = '';

            if (announcements.length === 0) {
                announcementsChiefListBody.innerHTML = '<tr><td colspan="5">No announcements available.</td></tr>';
                return;
            }

            // Sort by most recent publishedOn date
            const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn));

            sortedAnnouncements.forEach(announcement => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', announcement.id);
                row.innerHTML = `
                    <td>${announcement.id}</td>
                    <td><input type="text" class="edit-announcement-title" value="${announcement.title}"></td>
                    <td><textarea class="edit-announcement-content" rows="2">${announcement.content}</textarea></td>
                    <td>${announcement.publishedOn}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm save-announcement-btn">Save</button>
                        <button class="btn btn-sm delete-announcement-btn btn-secondary">Delete</button>
                    </td>
                `;
                announcementsChiefListBody.appendChild(row);
            });

            // Attach event listeners for Save and Delete buttons
            announcementsChiefListBody.querySelectorAll('.save-announcement-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const newTitle = row.querySelector('.edit-announcement-title').value.trim();
                    const newContent = row.querySelector('.edit-announcement-content').value.trim();

                    if (!newTitle || !newContent) {
                        alert('Announcement title and content cannot be empty.');
                        return;
                    }

                    let announcements = getStoredData('announcements');
                    const announcementIndex = announcements.findIndex(a => a.id === id);
                    if (announcementIndex > -1) {
                        announcements[announcementIndex].title = newTitle;
                        announcements[announcementIndex].content = newContent;
                        announcements[announcementIndex].publishedOn = new Date().toISOString().slice(0, 10); // Update publish date on edit
                        setStoredData('announcements', announcements);
                        alert('Announcement updated successfully!');
                        loadPanchayatDashboardData(); // Re-render to show updated date and count
                        renderHomepageAnnouncements(); // Update homepage announcements immediately
                    }
                });
            });

            announcementsChiefListBody.querySelectorAll('.delete-announcement-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this announcement? This action is permanent.')) {
                        const row = e.target.closest('tr');
                        const id = parseInt(row.dataset.id);
                        let announcements = getStoredData('announcements');
                        announcements = announcements.filter(a => a.id !== id);
                        setStoredData('announcements', announcements);
                        alert('Announcement deleted permanently!');
                        loadPanchayatDashboardData(); // Re-render to update count
                        renderHomepageAnnouncements(); // Update homepage announcements immediately
                    }
                });
            });
        }

        addAnnouncementBtn.addEventListener('click', () => {
            const title = announcementTitleInput.value.trim();
            const content = announcementContentTextarea.value.trim();

            if (!title || !content) {
                alert('Please enter both title and content for the announcement.');
                return;
            }

            const announcements = getStoredData('announcements');
            const newAnnouncement = {
                id: announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1,
                title: title,
                content: content,
                publishedOn: new Date().toISOString().slice(0, 10) // Current date
            };
            announcements.push(newAnnouncement);
            setStoredData('announcements', announcements);
            alert('New announcement added!');
            announcementTitleInput.value = '';
            announcementContentTextarea.value = '';
            loadPanchayatDashboardData(); // Re-render lists and update count
            renderHomepageAnnouncements(); // Update homepage announcements immediately
        });


        if (authenticatePanchayat('panchayat-dashboard')) {
            loadPanchayatDashboardData();
        }
    }
});