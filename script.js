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

    // --- Data Initialization ---
    // Existing data initialization
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
            { id: 2, browserId: 'user-dummy-2', name: 'Anonymous', contact: '', category: 'agriculture', subject: 'Pest issue in paddy fields', description: 'Some unknown pest is affecting paddy crops. Need advice/solution from agriculture department.', status: 'In Progress', reply: 'Panchayat is coordinating with agriculture experts. Expect a visit next week.', submittedAt: '2025-07-10' },
            { id: 3, browserId: 'user-dummy-1', name: 'Sunita Devi', contact: '9988776655', category: 'social', subject: 'Drinking water scarcity', description: 'The public handpump has been dry for a week. Villagers are facing severe water shortage.', status: 'New', reply: '', submittedAt: '2025-07-17' }
        ]);
    }

    if (!localStorage.getItem('announcements')) {
        setStoredData('announcements', [
            { id: 1, title: 'Village Meeting on Water Supply', content: 'A special village meeting will be held on 2025-07-25 at 10 AM in the Panchayat Bhawan to discuss water supply issues.', publishedOn: '2025-07-18' },
            { id: 2, title: 'New Government Scheme for Farmers', content: 'Details about the new central government scheme for small and marginal farmers will be shared next week. Stay tuned for more updates.', publishedOn: '2025-07-15' }
        ]);
    }

    // NEW: Panchayat Projects Data Initialization
    if (!localStorage.getItem('panchayatProjects')) {
        setStoredData('panchayatProjects', [
            {
                id: 1,
                category: 'Infrastructure',
                projectName: 'Road Construction - Main Village Road',
                budgetAllocated: 5000000,
                moneySpent: 3500000,
                startDate: '2025-01-10',
                endDate: '2025-09-30',
                progressPercentage: 70,
                status: 'In Progress',
                description: 'Construction of 2.5 km main village road using concrete. 70% completed, focusing on drainage now.'
            },
            {
                id: 2,
                category: 'Education',
                projectName: 'Primary School Classroom Renovation',
                budgetAllocated: 800000,
                moneySpent: 800000,
                startDate: '2024-11-15',
                endDate: '2025-03-31',
                progressPercentage: 100,
                status: 'Completed',
                description: 'Renovation of 3 classrooms, new desks, and whiteboards. Project completed and handed over.'
            },
            {
                id: 3,
                category: 'Healthcare',
                projectName: 'Village Health Clinic Expansion',
                budgetAllocated: 1200000,
                moneySpent: 200000,
                startDate: '2025-06-01',
                endDate: '2026-01-31',
                progressPercentage: 15,
                status: 'In Progress',
                description: 'Adding two new consultation rooms and a small dispensary. Foundation work initiated.'
            },
            {
                id: 4,
                category: 'Sanitation',
                projectName: 'Community Toilet Block Construction',
                budgetAllocated: 600000,
                moneySpent: 0,
                startDate: '2025-08-01',
                endDate: '2025-11-30',
                progressPercentage: 0,
                status: 'Planned',
                description: 'New community toilet block with separate facilities for men and women.'
            },
            {
                id: 5,
                category: 'Livelihood',
                projectName: 'Skill Development Workshop - Weaving',
                budgetAllocated: 300000,
                moneySpent: 150000,
                startDate: '2025-04-01',
                endDate: '2025-07-31',
                progressPercentage: 80,
                status: 'In Progress',
                description: 'Workshop providing weaving skills to local women. Training material provided, nearing completion.'
            }
        ]);
    }

    // --- Homepage Logic ---
    if (document.getElementById('crop-snapshot')) {
        const crops = getStoredData('crops');
        const snapshotDiv = document.getElementById('crop-snapshot');
        snapshotDiv.innerHTML = '';

        const topCrops = crops.filter(crop => crop.topCrop).sort((a,b) => b.id - a.id);

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

    if (document.getElementById('announcements-list')) {
        const announcementsListUl = document.getElementById('announcements-list');
        function renderHomepageAnnouncements() {
            const announcements = getStoredData('announcements');
            announcementsListUl.innerHTML = '';

            if (announcements.length === 0) {
                announcementsListUl.innerHTML = '<p>No announcements available yet. Please check back later.</p>';
                return;
            }
            const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.publishedOn) - new Date(a.publishedOn));

            sortedAnnouncements.forEach(announcement => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <p><strong>${announcement.title}</strong> (${announcement.publishedOn})</p>
                    <p>${announcement.content}</p>
                `;
                announcementsListUl.appendChild(listItem);
            });
        }
        renderHomepageAnnouncements();
    }


    // --- Crop Prices Page Logic ---
    if (document.getElementById('crop-prices-body')) {
        const cropPricesBody = document.getElementById('crop-prices-body');
        const cropSearchInput = document.getElementById('crop-search');

        function renderCropPrices(filter = '') {
            const crops = getStoredData('crops');
            cropPricesBody.innerHTML = '';

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

        renderCropPrices();
        if (cropSearchInput) {
            cropSearchInput.addEventListener('input', (e) => renderCropPrices(e.target.value));
        }
    }

    // --- Fertilizers Page Logic ---
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
        if (fertilizerSearchInput) {
            fertilizerSearchInput.addEventListener('input', (e) => renderFertilizerPrices(e.target.value));
        }
    }

    // --- Feedback Page Logic ---
    if (document.getElementById('feedbackForm')) {
        const feedbackForm = document.getElementById('feedbackForm');
        const userFeedbackListBody = document.getElementById('user-feedback-list-body');

        function renderUserFeedbackList() {
            const allFeedbacks = getStoredData('feedbacks');
            const userFeedbacks = allFeedbacks.filter(f => f.browserId === currentBrowserId);

            const sortedUserFeedbacks = userFeedbacks.sort((a, b) => {
                const dateA = new Date(a.submittedAt);
                const dateB = new Date(b.submittedAt);
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
                return b.id - a.id;
            });

            userFeedbackListBody.innerHTML = '';

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
                    <td><span class="status-badge ${feedback.status.replace(/\s/g, '-')}">${feedback.status}</span></td>
                    <td>${feedback.submittedAt}</td>
                    <td>${feedback.reply || 'No reply yet'}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm delete-user-feedback-btn btn-secondary" data-id="${feedback.id}">Delete Local Record</button>
                    </td>
                `;
                userFeedbackListBody.appendChild(row);
            });

            document.querySelectorAll('.delete-user-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const idToDelete = parseInt(e.target.dataset.id);
                    if (confirm('Are you sure you want to delete this record from YOUR page? This action will also remove it from Panchayat records as it is a client-side only application.')) {
                        let allFeedbacks = getStoredData('feedbacks');
                        const originalLength = allFeedbacks.length;
                        allFeedbacks = allFeedbacks.filter(f => f.id !== idToDelete);
                        setStoredData('feedbacks', allFeedbacks);

                        if (allFeedbacks.length < originalLength) {
                            alert('Your request has been removed from the system.');
                        } else {
                            alert('Failed to remove request. It might have already been processed or removed.');
                        }
                        renderUserFeedbackList();
                    }
                });
            });
        }

        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

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
                browserId: currentBrowserId,
                name: name || 'Anonymous',
                contact: contact,
                category: category,
                subject: subject,
                description: description,
                status: 'New',
                reply: '',
                submittedAt: new Date().toISOString().slice(0, 10)
            };

            feedbacks.push(newFeedback);
            setStoredData('feedbacks', feedbacks);

            alert('Your feedback has been submitted successfully!');
            feedbackForm.reset();
            renderUserFeedbackList();
        });

        renderUserFeedbackList();
    }

    // --- Panchayat Authentication and Common Functions for Panchayat Pages ---
    const PANCHAYAT_USERNAME = "Saatvik";
    const PANCHAYAT_PASSWORD = "12345"; // INSECURE for production!

    function authenticatePanchayat(dashboardElementId) {
        const bodyElement = document.body;
        const dashboardElement = document.getElementById(dashboardElementId);

        if (sessionStorage.getItem('isAuthenticated') === 'true') {
            bodyElement.classList.remove('hidden-content');
            if (dashboardElement) dashboardElement.style.display = 'block';
            return true;
        }

        const username = prompt("Enter Panchayat Username:");
        const password = prompt("Enter Password:");

        if (username === PANCHAYAT_USERNAME && password === PANCHAYAT_PASSWORD) {
            alert("Login Successful!");
            sessionStorage.setItem('isAuthenticated', 'true');
            bodyElement.classList.remove('hidden-content');
            if (dashboardElement) dashboardElement.style.display = 'block';
            return true;
        } else {
            alert("Access denied. Incorrect username or password.");
            window.location.href = 'index.html';
            return false;
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                sessionStorage.removeItem('isAuthenticated');
                window.location.href = 'index.html';
            }
        });
    }

    // --- Feedback Detail Modal Logic ---
    const feedbackDetailModal = document.getElementById('feedback-detail-modal');
    const closeModalBtn = feedbackDetailModal ? feedbackDetailModal.querySelector('.close-button') : null;
    const saveFeedbackChangesBtn = document.getElementById('save-feedback-changes');
    let currentFeedbackId = null;

    function openFeedbackDetailModal(id) {
        const feedbacks = getStoredData('feedbacks');
        const feedback = feedbacks.find(f => f.id === id);

        if (feedback) {
            currentFeedbackId = id;
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
                if (document.getElementById('panchayat-dashboard')) {
                    loadPanchayatDashboardData();
                }
                if (document.getElementById('user-feedback-list-body')) {
                    renderUserFeedbackList();
                }
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeFeedbackDetailModal);
    }
    window.addEventListener('click', (event) => {
        if (feedbackDetailModal && event.target === feedbackDetailModal) {
            closeFeedbackDetailModal();
        }
    });

    // --- Panchayat Chief Dashboard Logic ---
    if (document.getElementById('panchayat-dashboard')) {
        const totalFeedbackElem = document.getElementById('total-feedback');
        const unresolvedIssuesElem = document.getElementById('unresolved-issues');
        const lastPriceUpdateElem = document.getElementById('last-price-update');
        const totalAnnouncementsElem = document.getElementById('total-announcements');
        const feedbackListBody = document.getElementById('feedback-list-body');

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

        const announcementTitleInput = document.getElementById('announcement-title');
        const announcementContentTextarea = document.getElementById('announcement-content');
        const addAnnouncementBtn = document.getElementById('add-announcement-btn');
        const announcementsChiefListBody = document.getElementById('announcements-chief-list-body');

        // NEW: Project management elements for Panchayat Chief
        const editableProjectListBody = document.getElementById('editable-project-list-body');
        const newProjectNameInput = document.getElementById('new-project-name');
        const newProjectCategorySelect = document.getElementById('new-project-category');
        const newProjectBudgetInput = document.getElementById('new-project-budget');
        const newProjectStartDateInput = document.getElementById('new-project-start-date');
        const newProjectEndDateInput = document.getElementById('new-project-end-date');
        const newProjectDescriptionTextarea = document.getElementById('new-project-description');
        const addProjectBtn = document.getElementById('add-project-btn');


        function loadPanchayatDashboardData() {
            // Load Feedback Summary
            const feedbacks = getStoredData('feedbacks');
            totalFeedbackElem.textContent = feedbacks.length;
            unresolvedIssuesElem.textContent = feedbacks.filter(f => f.status !== 'Resolved').length;

            // Load Announcement Summary
            const announcements = getStoredData('announcements');
            totalAnnouncementsElem.textContent = announcements.length;

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

            // NEW: Render Panchayat Projects for Chief Management
            renderEditablePanchayatProjects();

            // Update last price update timestamp
            const crops = getStoredData('crops');
            const fertilizers = getStoredData('fertilizers');
            let latestDate = 'N/A';
            if (crops.length > 0 || fertilizers.length > 0) {
                const allDates = [
                    ...crops.map(c => c.lastUpdated),
                    ...fertilizers.map(f => f.lastUpdated)
                ].filter(Boolean);

                allDates.sort((a, b) => new Date(b) - new Date(a));

                latestDate = allDates.length > 0 ? allDates[0] : 'N/A';
            }
            lastPriceUpdateElem.textContent = latestDate;
        }

        // --- Render ALL Feedback for Panchayat Chief ---
        function renderAllFeedbackListForPanchayat() {
            const feedbacks = getStoredData('feedbacks');
            const sortedFeedbacks = feedbacks.sort((a, b) => {
                const dateA = new Date(a.submittedAt);
                const dateB = new Date(b.submittedAt);
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
                return b.id - a.id;
            });

            feedbackListBody.innerHTML = '';

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
                    <td><span class="status-badge ${feedback.status.replace(/\s/g, '-')}">${feedback.status}</span></td>
                    <td>${feedback.submittedAt}</td>
                    <td class="actions-cell">
                        <button class="btn btn-sm view-feedback-btn" data-id="${feedback.id}">View/Reply</button>
                        <button class="btn btn-sm delete-feedback-btn btn-secondary" data-id="${feedback.id}">Delete</button>
                    </td>
                `;
                feedbackListBody.appendChild(row);
            });

            document.querySelectorAll('#feedback-list-body .view-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    openFeedbackDetailModal(id);
                });
            });

            document.querySelectorAll('#feedback-list-body .delete-feedback-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    if (confirm('Are you sure you want to delete this feedback from the system? This action is permanent.')) {
                        let feedbacks = getStoredData('feedbacks');
                        feedbacks = feedbacks.filter(f => f.id !== id);
                        setStoredData('feedbacks', feedbacks);
                        alert('Feedback deleted permanently!');
                        loadPanchayatDashboardData();
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
                        loadPanchayatDashboardData();
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
                        crops[cropIndex].topCrop = isTopCrop;
                        crops[cropIndex].lastUpdated = new Date().toISOString().slice(0, 10);
                        setStoredData('crops', crops);
                        alert('Crop price updated!');
                        loadPanchayatDashboardData();
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
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const isTopCrop = e.target.checked;

                    let crops = getStoredData('crops');
                    const cropIndex = crops.findIndex(c => c.id === id);
                    if (cropIndex > -1) {
                        crops[cropIndex].topCrop = isTopCrop;
                        setStoredData('crops', crops);
                        loadPanchayatDashboardData();
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
                unit: 'Quintal',
                trend: trend,
                lastUpdated: new Date().toISOString().slice(0, 10),
                topCrop: false
            };
            crops.push(newCrop);
            setStoredData('crops', crops);
            alert('New crop added!');
            newCropNameInput.value = '';
            newCropPriceInput.value = '';
            newCropTrendSelect.value = 'Stable';
            loadPanchayatDashboardData();
        });


        // --- Fertilizer Prices Management Functions ---
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
                        announcements[announcementIndex].publishedOn = new Date().toISOString().slice(0, 10);
                        setStoredData('announcements', announcements);
                        alert('Announcement updated successfully!');
                        loadPanchayatDashboardData();
                        renderHomepageAnnouncements();
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
                        loadPanchayatDashboardData();
                        renderHomepageAnnouncements();
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
                publishedOn: new Date().toISOString().slice(0, 10)
            };
            announcements.push(newAnnouncement);
            setStoredData('announcements', announcements);
            alert('New announcement added!');
            announcementTitleInput.value = '';
            announcementContentTextarea.value = '';
            loadPanchayatDashboardData();
            renderHomepageAnnouncements();
        });


        // --- NEW: Panchayat Projects Management (for Panchayat Chief) ---
        function renderEditablePanchayatProjects() {
            const projects = getStoredData('panchayatProjects');
            editableProjectListBody.innerHTML = '';

            if (projects.length === 0) {
                editableProjectListBody.innerHTML = '<tr><td colspan="10">No projects to display.</td></tr>';
                return;
            }

            projects.forEach(project => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', project.id);
                row.innerHTML = `
                    <td>${project.id}</td>
                    <td><input type="text" class="edit-project-name" value="${project.projectName}"></td>
                    <td>
                        <select class="edit-project-category">
                            <option value="Infrastructure" ${project.category === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
                            <option value="Education" ${project.category === 'Education' ? 'selected' : ''}>Education</option>
                            <option value="Healthcare" ${project.category === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
                            <option value="Sanitation" ${project.category === 'Sanitation' ? 'selected' : ''}>Sanitation</option>
                            <option value="Livelihood" ${project.category === 'Livelihood' ? 'selected' : ''}>Livelihood</option>
                            <option value="Other" ${project.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </td>
                    <td><input type="number" class="edit-project-budget" value="${project.budgetAllocated}" step="1"></td>
                    <td><input type="number" class="edit-money-spent" value="${project.moneySpent}" step="1"></td>
                    <td><input type="number" class="edit-progress" value="${project.progressPercentage}" min="0" max="100"></td>
                    <td>
                        <select class="edit-status">
                            <option value="Planned" ${project.status === 'Planned' ? 'selected' : ''}>Planned</option>
                            <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Delayed" ${project.status === 'Delayed' ? 'selected' : ''}>Delayed</option>
                            <option value="On Hold" ${project.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        </select>
                    </td>
                    <td><input type="date" class="edit-start-date" value="${project.startDate}"></td>
                    <td><input type="date" class="edit-end-date" value="${project.endDate}"></td>
                    <td class="actions-cell">
                        <button class="btn btn-sm save-project-btn">Save</button>
                        <button class="btn btn-sm delete-project-btn btn-secondary">Delete</button>
                    </td>
                `;
                editableProjectListBody.appendChild(row);
            });

            editableProjectListBody.querySelectorAll('.save-project-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const row = e.target.closest('tr');
                    const id = parseInt(row.dataset.id);
                    const newName = row.querySelector('.edit-project-name').value.trim();
                    const newCategory = row.querySelector('.edit-project-category').value;
                    const newBudget = parseFloat(row.querySelector('.edit-project-budget').value);
                    const newSpent = parseFloat(row.querySelector('.edit-money-spent').value);
                    const newProgress = parseInt(row.querySelector('.edit-progress').value);
                    const newStatus = row.querySelector('.edit-status').value;
                    const newStartDate = row.querySelector('.edit-start-date').value;
                    const newEndDate = row.querySelector('.edit-end-date').value;

                    if (!newName || !newCategory || isNaN(newBudget) || newBudget < 0 || isNaN(newSpent) || newSpent < 0 || isNaN(newProgress) || newProgress < 0 || newProgress > 100 || !newStartDate || !newEndDate) {
                        alert('Please fill all project fields correctly with valid numbers.');
                        return;
                    }

                    if (newSpent > newBudget) {
                        alert('Money spent cannot exceed budget allocated.');
                        return;
                    }
                    if (newStartDate > newEndDate) {
                        alert('Start date cannot be after end date.');
                        return;
                    }

                    let projects = getStoredData('panchayatProjects');
                    const projectIndex = projects.findIndex(p => p.id === id);
                    if (projectIndex > -1) {
                        projects[projectIndex].projectName = newName;
                        projects[projectIndex].category = newCategory;
                        projects[projectIndex].budgetAllocated = newBudget;
                        projects[projectIndex].moneySpent = newSpent;
                        projects[projectIndex].progressPercentage = newProgress;
                        projects[projectIndex].status = newStatus;
                        projects[projectIndex].startDate = newStartDate;
                        projects[projectIndex].endDate = newEndDate;
                        setStoredData('panchayatProjects', projects);
                        alert('Project updated successfully!');
                        loadPanchayatDashboardData();
                        renderDevelopmentProgressChartsAndTable();
                    }
                });
            });

            editableProjectListBody.querySelectorAll('.delete-project-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    if (confirm('Are you sure you want to delete this project? This action is permanent.')) {
                        const row = e.target.closest('tr');
                        const id = parseInt(row.dataset.id);
                        let projects = getStoredData('panchayatProjects');
                        projects = projects.filter(p => p.id !== id);
                        setStoredData('panchayatProjects', projects);
                        alert('Project deleted permanently!');
                        loadPanchayatDashboardData();
                        renderDevelopmentProgressChartsAndTable();
                    }
                });
            });
        }

        addProjectBtn.addEventListener('click', () => {
            const name = newProjectNameInput.value.trim();
            const category = newProjectCategorySelect.value;
            const budget = parseFloat(newProjectBudgetInput.value);
            const startDate = newProjectStartDateInput.value;
            const endDate = newProjectEndDateInput.value;
            const description = newProjectDescriptionTextarea.value.trim();

            if (!name || !category || isNaN(budget) || budget <= 0 || !startDate || !endDate || !description) {
                alert('Please fill all fields for the new project.');
                return;
            }

            if (startDate > endDate) {
                alert('Start date cannot be after end date.');
                return;
            }

            const projects = getStoredData('panchayatProjects');
            const newProject = {
                id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
                category: category,
                projectName: name,
                budgetAllocated: budget,
                moneySpent: 0,
                startDate: startDate,
                endDate: endDate,
                progressPercentage: 0,
                status: 'Planned',
                description: description
            };
            projects.push(newProject);
            setStoredData('panchayatProjects', projects);
            alert('New project added!');
            newProjectNameInput.value = '';
            newProjectCategorySelect.value = '';
            newProjectBudgetInput.value = '';
            newProjectStartDateInput.value = '';
            newProjectEndDateInput.value = '';
            newProjectDescriptionTextarea.value = '';
            loadPanchayatDashboardData();
            renderDevelopmentProgressChartsAndTable();
        });


        // Initial authentication check for Panchayat Chief page
        if (authenticatePanchayat('panchayat-dashboard')) {
            loadPanchayatDashboardData();
        }
    }

    // --- NEW SECTION: Development Progress Page Logic (`development-progress.html`) ---
    if (document.getElementById('project-list-body')) {
        const projectListBody = document.getElementById('project-list-body');
        const projectSearchInput = document.getElementById('project-search');

        // Chart instances, globally accessible within this scope to destroy them on re-render
        let projectStatusChartInstance;
        let budgetAllocationChartInstance;
        let categoryProgressChartInstance;

        // Toggle logic for chart sections
        document.querySelectorAll('.chart-toggle-header').forEach(header => {
            header.addEventListener('click', () => {
                const chartContent = header.nextElementSibling; // The .chart-content div
                const toggleIcon = header.querySelector('.toggle-icon');

                if (chartContent.classList.contains('hidden')) {
                    chartContent.classList.remove('hidden');
                    toggleIcon.classList.add('rotate');
                    // Important: Call Chart.js update/resize if charts were created while hidden
                    // or recreate them. For simplicity, we'll ensure renderDevelopmentProgressChartsAndTable is always called
                    renderDevelopmentProgressChartsAndTable(projectSearchInput ? projectSearchInput.value : '');
                } else {
                    chartContent.classList.add('hidden');
                    toggleIcon.classList.remove('rotate');
                }
            });
        });

        function renderDevelopmentProgressChartsAndTable(filter = '') {
            const projects = getStoredData('panchayatProjects');
            const filteredProjects = projects.filter(project =>
                project.projectName.toLowerCase().includes(filter.toLowerCase()) ||
                project.category.toLowerCase().includes(filter.toLowerCase()) ||
                project.description.toLowerCase().includes(filter.toLowerCase())
            );

            // --- Render Project Table ---
            projectListBody.innerHTML = '';
            if (filteredProjects.length === 0) {
                projectListBody.innerHTML = '<tr><td colspan="10">No projects found matching your search.</td></tr>';
            } else {
                filteredProjects.forEach(project => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${project.id}</td>
                        <td>${project.category}</td>
                        <td>${project.projectName}</td>
                        <td>₹ ${project.budgetAllocated.toLocaleString('en-IN')}</td>
                        <td>₹ ${project.moneySpent.toLocaleString('en-IN')}</td>
                        <td>${project.progressPercentage}%</td>
                        <td><span class="status-badge ${project.status.replace(/\s/g, '-')}">${project.status}</span></td>
                        <td>${project.startDate}</td>
                        <td>${project.endDate}</td>
                        <td>${project.description}</td>
                    `;
                    projectListBody.appendChild(row);
                });
            }

            // --- Prepare Data for Charts ---
            const statusCounts = {};
            const budgetByCategory = {};
            const spentByCategory = {};
            const progressByCategory = {};
            const projectCategories = new Set();

            projects.forEach(project => {
                // For Status Chart
                statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;

                // For Budget Allocation Chart and Category Progress
                projectCategories.add(project.category);
                budgetByCategory[project.category] = (budgetByCategory[project.category] || 0) + project.budgetAllocated;
                spentByCategory[project.category] = (spentByCategory[project.category] || 0) + project.moneySpent;
                
                // For average progress by category
                if (!progressByCategory[project.category]) {
                    progressByCategory[project.category] = { totalProgress: 0, count: 0 };
                }
                progressByCategory[project.category].totalProgress += project.progressPercentage;
                progressByCategory[project.category].count++;
            });

            // Calculate average progress
            const avgProgressByCat = {};
            for (const cat in progressByCategory) {
                avgProgressByCat[cat] = progressByCategory[cat].totalProgress / progressByCategory[cat].count;
            }

            // Chart Colors (can be customized) - Reusing values from CSS :root or defining specific ones
            const chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)',
                indigo: 'rgb(75, 0, 130)',
                teal: 'rgb(0, 128, 128)'
            };
            const backgroundColors = [
                chartColors.blue, chartColors.green, chartColors.orange, chartColors.red, chartColors.purple, chartColors.grey, chartColors.indigo, chartColors.teal
            ];
            const borderColors = backgroundColors.map(color => color.replace('rgb', 'rgba').replace(')', ', 1)'));


            // --- Render Project Status Chart (Pie/Doughnut) ---
            const statusLabels = Object.keys(statusCounts);
            const statusData = Object.values(statusCounts);

            // Destroy previous instance to prevent duplicates on re-render
            if (projectStatusChartInstance) projectStatusChartInstance.destroy();
            const ctxStatus = document.getElementById('projectStatusChart');
            if (ctxStatus) {
                // Only render if the chart's container is visible
                if (!ctxStatus.closest('.chart-content').classList.contains('hidden')) {
                    projectStatusChartInstance = new Chart(ctxStatus, {
                        type: 'doughnut',
                        data: {
                            labels: statusLabels,
                            datasets: [{
                                label: 'Number of Projects',
                                data: statusData,
                                backgroundColor: statusLabels.map((label, index) => {
                                    if (label === 'Completed') return chartColors.green;
                                    if (label === 'In Progress') return chartColors.blue;
                                    if (label === 'Planned') return chartColors.yellow;
                                    if (label === 'Delayed') return chartColors.orange;
                                    if (label === 'On Hold') return chartColors.grey;
                                    return backgroundColors[index % backgroundColors.length];
                                }),
                                borderColor: '#fff',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false, // Allows flexible sizing
                            plugins: {
                                legend: {
                                    position: 'top',
                                    labels: {
                                        boxWidth: 20
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Project Status Distribution'
                                }
                            }
                        }
                    });
                }
            }


            // --- Render Budget Allocation Chart (Bar Chart - Budget vs Spent) ---
            const categoryLabels = Array.from(projectCategories).sort();
            const allocatedData = categoryLabels.map(cat => budgetByCategory[cat] || 0);
            const spentData = categoryLabels.map(cat => spentByCategory[cat] || 0);

            if (budgetAllocationChartInstance) budgetAllocationChartInstance.destroy();
            const ctxBudget = document.getElementById('budgetAllocationChart');
            if (ctxBudget) {
                if (!ctxBudget.closest('.chart-content').classList.contains('hidden')) {
                    budgetAllocationChartInstance = new Chart(ctxBudget, {
                        type: 'bar',
                        data: {
                            labels: categoryLabels,
                            datasets: [
                                {
                                    label: 'Budget Allocated (₹)',
                                    data: allocatedData,
                                    backgroundColor: chartColors.blue,
                                    borderColor: chartColors.blue,
                                    borderWidth: 1
                                },
                                {
                                    label: 'Money Spent (₹)',
                                    data: spentData,
                                    backgroundColor: chartColors.green,
                                    borderColor: chartColors.green,
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Budget Allocation vs Money Spent by Category'
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            label += '₹ ' + context.raw.toLocaleString('en-IN');
                                            return label;
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Amount (₹)'
                                    },
                                    ticks: {
                                        callback: function(value) {
                                            return '₹ ' + value.toLocaleString('en-IN');
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }

            // --- Render Progress by Category Chart (Bar Chart - Average Progress) ---
            const avgProgressLabels = Object.keys(avgProgressByCat).sort();
            const avgProgressData = avgProgressLabels.map(cat => avgProgressByCat[cat]);

            if (categoryProgressChartInstance) categoryProgressChartInstance.destroy();
            const ctxCategoryProgress = document.getElementById('categoryProgressChart');
            if (ctxCategoryProgress) {
                if (!ctxCategoryProgress.closest('.chart-content').classList.contains('hidden')) {
                    categoryProgressChartInstance = new Chart(ctxCategoryProgress, {
                        type: 'bar',
                        data: {
                            labels: avgProgressLabels,
                            datasets: [{
                                label: 'Average Progress (%)',
                                data: avgProgressData,
                                backgroundColor: backgroundColors.slice(0, avgProgressLabels.length),
                                borderColor: borderColors.slice(0, avgProgressLabels.length),
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                                title: {
                                    display: true,
                                    text: 'Average Project Progress by Category'
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return context.raw + '%';
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    max: 100,
                                    title: {
                                        display: true,
                                        text: 'Progress (%)'
                                    },
                                    ticks: {
                                        callback: function(value) {
                                            return value + '%';
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
            }
        }

        // Initial render for Development Progress page
        // Only render charts if their containers are not hidden initially (or call on toggle)
        // This initial call will render charts IF their parent containers are not hidden by default.
        // With `hidden` class by default, charts will render only when toggled.
        renderDevelopmentProgressChartsAndTable();

        // Add search functionality
        if (projectSearchInput) {
            projectSearchInput.addEventListener('input', (e) => {
                renderDevelopmentProgressChartsAndTable(e.target.value);
            });
        }
    }
    
});
