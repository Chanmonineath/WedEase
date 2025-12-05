// ===============================================
// BUDGET MANAGER WITH REAL API CURRENCY CONVERTER
// ===============================================

class BudgetManager {
    constructor() {
        this.categories = JSON.parse(localStorage.getItem('wedease_categories')) || [
            { name: "Venue", icon: "location_city" },
            { name: "Catering", icon: "restaurant" },
            { name: "Entertainment", icon: "music_note" },
            { name: "Photography", icon: "photo_camera" },
            { name: "Floral and Decor", icon: "local_florist" },
            { name: "Gift Favor", icon: "card_giftcard" }
        ];
        this.vendors = JSON.parse(localStorage.getItem('wedease_vendors')) || {};
        this.initialBudget = parseInt(localStorage.getItem('wedease_initial_budget')) || 0;
        this.currentCategory = null;
        this.editVendorId = null;
        this.editingCategoryIndex = null;
        
        // Currency settings with API integration
        this.selectedCurrency = 'USD';
        this.apiKey = 'd78fa077cf41fe15f31b2333'; 
        this.baseCurrency = 'USD';
        this.exchangeRates = {};
        this.availableCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'SGD', 'CHF', 'CNY', 'KHR'];
        
        this.init();
    }

    async init() {
        console.log("Budget Manager initialized");
        await this.loadExchangeRates(); // Load rates first
        this.bindEvents();
        this.renderCategories();
        this.loadCurrencySettings();
        this.loadInitialBudget();
        this.updateBudgetProgress();
        this.populateCurrencyDropdown();
    }

    async loadExchangeRates() {
        try {
            console.log("Fetching exchange rates from API...");
            
            // Try to get cached rates first
            const cachedRates = this.getCachedRates();
            if (cachedRates && this.isCacheValid(cachedRates.timestamp)) {
                console.log("Using cached exchange rates");
                this.exchangeRates = cachedRates.rates;
                return;
            }

            // Fetch fresh rates from API
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/USD`);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.result === "success") {
                this.exchangeRates = data.conversion_rates;
                console.log("Exchange rates loaded successfully:", this.exchangeRates);
                
                // Cache the rates
                this.cacheRates(this.exchangeRates);
                
                // Update available currencies based on API response
                this.availableCurrencies = Object.keys(this.exchangeRates);
            } else {
                throw new Error(data["error-type"] || "Failed to fetch exchange rates");
            }
            
        } catch (error) {
            console.error("Failed to load exchange rates:", error);
            
            // Try to use cached rates even if expired
            const cachedRates = this.getCachedRates();
            if (cachedRates) {
                console.log("Using expired cached rates as fallback");
                this.exchangeRates = cachedRates.rates;
            } else {
                // Fallback to hardcoded rates if API and cache both fail
                console.log("Using fallback exchange rates");
                this.exchangeRates = {
                    USD: 1,
                    EUR: 0.92,
                    GBP: 0.79,
                    JPY: 149.50,
                    CAD: 1.37,
                    AUD: 1.53,
                    INR: 83.21,
                    SGD: 1.34,
                    CHF: 0.88,
                    CNY: 7.23,
                    KHR: 4100
                };
            }
        }
    }

    getCachedRates() {
        try {
            const cached = localStorage.getItem('wedease_exchange_rates');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error("Error reading cached rates:", error);
            return null;
        }
    }

    cacheRates(rates) {
        try {
            const cacheData = {
                rates: rates,
                timestamp: Date.now()
            };
            localStorage.setItem('wedease_exchange_rates', JSON.stringify(cacheData));
        } catch (error) {
            console.error("Error caching rates:", error);
        }
    }

    isCacheValid(timestamp) {
        // Cache is valid for 1 hour (3600000 ms)
        const oneHour = 3600000;
        return (Date.now() - timestamp) < oneHour;
    }

    populateCurrencyDropdown() {
        const currencySelect = document.getElementById('currencySelect');
        if (!currencySelect) return;

        // Clear existing options
        currencySelect.innerHTML = '';
        
        // Add options for available currencies
        this.availableCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = `${currency} ${this.getCurrencySymbol(currency)}`;
            
            // Add country flags for common currencies
            const flags = {
                'USD': '🇺🇸',
                'EUR': '🇪🇺', 
                'GBP': '🇬🇧',
                'JPY': '🇯🇵',
                'CAD': '🇨🇦',
                'AUD': '🇦🇺',
                'INR': '🇮🇳',
                'SGD': '🇸🇬',
                'CHF': '🇨🇭',
                'CNY': '🇨🇳',
                'KHR': '🇰🇭'
            };
            
            if (flags[currency]) {
                option.textContent = `${flags[currency]} ${currency} ${this.getCurrencySymbol(currency)}`;
            }
            
            currencySelect.appendChild(option);
        });
        
        // Set the selected value
        currencySelect.value = this.selectedCurrency;
    }

    bindEvents() {
        // Budget progress events
        const initialBudgetInput = document.getElementById('initialBudget');
        const viewFinalSelection = document.getElementById('viewFinalSelection');
        const backFromFinal = document.getElementById('backFromFinal');

        // Category events
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        const closeCategoryForm = document.getElementById('closeCategoryForm');
        
        const saveEditCategoryBtn = document.getElementById('saveEditCategoryBtn');
        const cancelEditCategoryBtn = document.getElementById('cancelEditCategoryBtn');
        const closeEditCategoryForm = document.getElementById('closeEditCategoryForm');

        // Vendor events
        const addVendorBtn = document.getElementById('addVendorBtn');
        const saveVendorBtn = document.getElementById('saveVendorBtn');
        const cancelVendorBtn = document.getElementById('cancelVendorBtn');
        const closeVendorForm = document.getElementById('closeVendorForm');

        // Currency events
        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.addEventListener('change', (e) => this.changeCurrency(e.target.value));
        }

        // PDF export event
        const generatePdfBtn = document.getElementById('generatePdfBtn');
        if (generatePdfBtn) generatePdfBtn.addEventListener('click', () => this.generatePDF());

        // Refresh rates button
        const refreshRatesBtn = document.getElementById('refreshRatesBtn');
        if (refreshRatesBtn) {
            refreshRatesBtn.addEventListener('click', () => this.refreshExchangeRates());
        }

        if (initialBudgetInput) {
            initialBudgetInput.addEventListener('change', (e) => this.updateInitialBudget(e.target.value));
            initialBudgetInput.addEventListener('blur', (e) => {
                if (!e.target.value) {
                    e.target.value = '';
                    this.updateInitialBudget(0);
                }
            });
        }
        if (viewFinalSelection) viewFinalSelection.addEventListener('click', () => this.showFinalSelection());
        if (backFromFinal) backFromFinal.addEventListener('click', () => this.hideFinalSelection());
        
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => this.showCategoryForm());
        if (saveCategoryBtn) saveCategoryBtn.addEventListener('click', () => this.saveCategory());
        if (cancelCategoryBtn) cancelCategoryBtn.addEventListener('click', () => this.hideCategoryForm());
        if (closeCategoryForm) closeCategoryForm.addEventListener('click', () => this.hideCategoryForm());
        
        if (saveEditCategoryBtn) saveEditCategoryBtn.addEventListener('click', () => this.saveEditCategory());
        if (cancelEditCategoryBtn) cancelEditCategoryBtn.addEventListener('click', () => this.hideEditCategoryForm());
        if (closeEditCategoryForm) closeEditCategoryForm.addEventListener('click', () => this.hideEditCategoryForm());
        
        if (addVendorBtn) addVendorBtn.addEventListener('click', () => this.showVendorForm());
        if (saveVendorBtn) saveVendorBtn.addEventListener('click', () => this.saveVendor());
        if (cancelVendorBtn) cancelVendorBtn.addEventListener('click', () => this.hideVendorForm());
        if (closeVendorForm) closeVendorForm.addEventListener('click', () => this.hideVendorForm());

        console.log("All events bound successfully");
    }

    // ===============================================
    // CURRENCY METHODS WITH API INTEGRATION
    // ===============================================

    async refreshExchangeRates() {
        const statusElement = document.getElementById('ratesStatus');
        const refreshBtn = document.getElementById('refreshRatesBtn');
        
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="material-icons">refresh</i> Updating...';
        }
        
        if (statusElement) {
            statusElement.textContent = 'Updating exchange rates...';
            statusElement.className = 'rates-status updating';
        }
        
        try {
            await this.loadExchangeRates();
            this.populateCurrencyDropdown();
            
            if (statusElement) {
                statusElement.textContent = `Rates updated at ${new Date().toLocaleTimeString()}`;
                statusElement.className = 'rates-status success';
            }
            
            // If currency changed, update all displays
            this.updateAllCurrencyDisplays();
            
        } catch (error) {
            console.error("Failed to refresh rates:", error);
            
            if (statusElement) {
                statusElement.textContent = 'Failed to update rates. Using cached data.';
                statusElement.className = 'rates-status error';
            }
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="material-icons">refresh</i> Refresh Rates';
            }
        }
    }

    loadCurrencySettings() {
        const savedCurrency = localStorage.getItem('wedease_currency');
        if (savedCurrency && this.availableCurrencies.includes(savedCurrency)) {
            this.selectedCurrency = savedCurrency;
            const currencySelect = document.getElementById('currencySelect');
            if (currencySelect) {
                currencySelect.value = savedCurrency;
            }
        }
        
        // Show last update time
        const cachedRates = this.getCachedRates();
        const statusElement = document.getElementById('ratesStatus');
        if (statusElement && cachedRates) {
            const lastUpdate = new Date(cachedRates.timestamp).toLocaleTimeString();
            statusElement.textContent = `Rates last updated: ${lastUpdate}`;
            statusElement.className = 'rates-status success';
        }
        
        this.updateBudgetInputDisplay();
        this.updateAllCurrencyDisplays();
    }

    async changeCurrency(newCurrency) {
        if (newCurrency === this.selectedCurrency) return;
        
        const oldCurrency = this.selectedCurrency;
        this.selectedCurrency = newCurrency;
        localStorage.setItem('wedease_currency', newCurrency);
        
        // Convert all existing data when switching currencies
        await this.convertAllData(oldCurrency, newCurrency);
        
        this.updateBudgetInputDisplay();
        this.updateAllCurrencyDisplays();
        
        // Show notification
        this.showNotification(`Currency changed to ${newCurrency}`);
    }

    async convertAllData(oldCurrency, newCurrency) {
        if (oldCurrency === newCurrency) return;
        
        // Get exchange rates
        const oldRate = this.exchangeRates[oldCurrency];
        const newRate = this.exchangeRates[newCurrency];
        
        if (!oldRate || !newRate) {
            console.error("Missing exchange rates for conversion");
            this.showNotification("Unable to convert: missing exchange rates", true);
            return;
        }
        
        // Calculate conversion factor
        const conversionFactor = newRate / oldRate;
        
        // Convert initial budget
        if (this.initialBudget > 0) {
            this.initialBudget = Math.round(this.initialBudget * conversionFactor * 100) / 100;
            localStorage.setItem('wedease_initial_budget', this.initialBudget.toString());
        }
        
        // Convert all vendor costs
        Object.keys(this.vendors).forEach(category => {
            this.vendors[category].forEach(vendor => {
                vendor.cost = Math.round(vendor.cost * conversionFactor * 100) / 100;
            });
        });
        
        this.saveVendors();
        
        console.log(`Converted all data from ${oldCurrency} to ${newCurrency} using factor ${conversionFactor}`);
    }

    updateBudgetInputDisplay() {
        const budgetInput = document.getElementById('initialBudget');
        if (budgetInput) {
            // Update placeholder based on currency
            budgetInput.placeholder = `Enter budget in ${this.selectedCurrency}`;
            
            // Update existing value for display
            if (this.initialBudget > 0) {
                budgetInput.value = this.initialBudget;
            }
        }
    }

    updateAllCurrencyDisplays() {
        this.updateBudgetProgress();
        if (this.currentCategory) {
            this.renderActiveVendorTable();
        }
        this.updateFinalSelection();
        
        // Update currency info display
        const currencyInfo = document.getElementById('currencyInfo');
        if (currencyInfo) {
            currencyInfo.innerHTML = `
                <div>Current currency: <strong>${this.selectedCurrency} ${this.getCurrencySymbol(this.selectedCurrency)}</strong></div>
                <div><small>1 USD = ${this.exchangeRates[this.selectedCurrency]?.toFixed(2) || '?'} ${this.selectedCurrency}</small></div>
            `;
        }
    }

    formatCurrency(amount) {
        if (!amount && amount !== 0) return '';
        
        const currency = this.selectedCurrency;
        const symbol = this.getCurrencySymbol(currency);
        
        // Format number with commas
        const formattedAmount = amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return `${symbol}${formattedAmount}`;
    }

    getCurrencySymbol(currency) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'CAD': 'CA$',
            'AUD': 'A$',
            'INR': '₹',
            'SGD': 'S$',
            'CHF': 'CHF',
            'CNY': '¥',
            'KHR': '៛'
        };
        
        return symbols[currency] || currency;
    }

    showNotification(message, isError = false) {
        // Remove existing notification
        const existingNotification = document.querySelector('.currency-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `currency-notification ${isError ? 'error' : 'success'}`;
        notification.innerHTML = `<p>${message}</p>`;
        
        // Add to page
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ===============================================
    // BUDGET METHODS
    // ===============================================

    loadInitialBudget() {
        const budgetInput = document.getElementById('initialBudget');
        if (budgetInput && this.initialBudget > 0) {
            budgetInput.value = this.initialBudget;
        }
        this.updateBudgetInputDisplay();
    }

    updateInitialBudget(newBudget) {
        let budgetValue = parseFloat(newBudget) || 0;
        
        // Store the value directly in the current currency
        this.initialBudget = budgetValue;
        localStorage.setItem('wedease_initial_budget', this.initialBudget.toString());
        this.updateBudgetProgress();
    }

    updateBudgetProgress() {
        const moneySpentElement = document.getElementById('moneySpent');
        const progressFill = document.getElementById('budgetProgressFill');
        const progressText = document.getElementById('progressText');
        const progressPercentage = document.getElementById('progressPercentage');
        
        // Calculate total spent from selected vendors
        const totalSpent = this.getTotalSpent();

        if (moneySpentElement) {
            moneySpentElement.textContent = this.formatCurrency(totalSpent);
        }

        // Update progress bar
        if (progressFill && progressText && progressPercentage) {
            if (this.initialBudget > 0) {
                const percentage = (totalSpent / this.initialBudget) * 100;
                const displayPercentage = Math.min(percentage, 100);
                
                progressFill.style.width = `${displayPercentage}%`;
                progressText.textContent = `${this.formatCurrency(totalSpent)} of ${this.formatCurrency(this.initialBudget)} used`;
                progressPercentage.textContent = `${Math.round(percentage)}%`;
                
                // Color coding
                if (percentage > 100) {
                    progressFill.classList.add('over-budget');
                    progressPercentage.classList.add('over-budget');
                    progressText.style.color = '#e53e3e';
                } else if (percentage > 80) {
                    progressFill.classList.remove('over-budget');
                    progressPercentage.classList.remove('over-budget');
                    progressText.style.color = '#d69e2e';
                } else {
                    progressFill.classList.remove('over-budget');
                    progressPercentage.classList.remove('over-budget');
                    progressText.style.color = 'var(--wed-text)';
                }
            } else {
                progressFill.style.width = '0%';
                progressText.textContent = 'Set initial budget to track progress';
                progressPercentage.textContent = '0%';
                progressFill.classList.remove('over-budget');
                progressPercentage.classList.remove('over-budget');
                progressText.style.color = 'var(--wed-text)';
            }
        }
    }

    getTotalSpent() {
        return Object.keys(this.vendors).reduce((total, category) => {
            const selectedVendors = this.vendors[category].filter(v => v.status === 'selected');
            return total + selectedVendors.reduce((sum, vendor) => sum + vendor.cost, 0);
        }, 0);
    }

    // ===============================================
    // CATEGORY METHODS
    // ===============================================

    showCategoryForm() {
        document.getElementById('newCategoryName').value = "";
        document.getElementById('categoryForm').classList.remove('hidden');
        this.addFormOverlay();
        
        // Focus on input field
        setTimeout(() => {
            document.getElementById('newCategoryName').focus();
        }, 100);
    }

    hideCategoryForm() {
        document.getElementById('categoryForm').classList.add('hidden');
        this.removeFormOverlay();
    }

    saveCategory() {
        const categoryName = document.getElementById('newCategoryName').value.trim();
        
        if (!categoryName) {
            alert("Please enter a category name");
            return;
        }

        // Check if category already exists
        if (this.categories.some(cat => cat.name.toLowerCase() === categoryName.toLowerCase())) {
            alert("Category already exists");
            return;
        }

        const newCategory = {
            name: categoryName,
            icon: this.getCategoryIcon(categoryName)
        };

        this.categories.push(newCategory);
        this.saveCategories();
        this.renderCategories();
        this.hideCategoryForm();
        
        // Show the new category table automatically
        this.showCategoryTable(categoryName);
    }

    editCategory(index) {
        this.editingCategoryIndex = index;
        const category = this.categories[index];
        
        document.getElementById('editCategoryName').value = category.name;
        document.getElementById('editCategoryForm').classList.remove('hidden');
        this.addFormOverlay();
        
        // Focus on input field
        setTimeout(() => {
            document.getElementById('editCategoryName').focus();
        }, 100);
    }

    hideEditCategoryForm() {
        document.getElementById('editCategoryForm').classList.add('hidden');
        this.editingCategoryIndex = null;
        this.removeFormOverlay();
    }

    saveEditCategory() {
        if (this.editingCategoryIndex === null) return;
        
        const newName = document.getElementById('editCategoryName').value.trim();
        
        if (!newName) {
            alert("Please enter a category name");
            return;
        }

        // Check if category name already exists (excluding current category)
        const existingCategory = this.categories.find((cat, i) => 
            i !== this.editingCategoryIndex && cat.name.toLowerCase() === newName.toLowerCase()
        );
        
        if (existingCategory) {
            alert("Category name already exists");
            return;
        }

        const oldName = this.categories[this.editingCategoryIndex].name;
        
        // Update category
        this.categories[this.editingCategoryIndex].name = newName;
        this.categories[this.editingCategoryIndex].icon = this.getCategoryIcon(newName);
        
        this.saveCategories();
        this.renderCategories();
        this.hideEditCategoryForm();
        
        // If this was the current category, update the table title and vendors key
        if (this.currentCategory === oldName) {
            // Update vendors key if category name changed
            if (this.vendors[oldName]) {
                this.vendors[newName] = this.vendors[oldName];
                delete this.vendors[oldName];
                this.saveVendors();
            }
            
            // Update current category reference
            this.currentCategory = newName;
            this.showCategoryTable(newName);
        }
    }

    deleteCategory(index) {
        const category = this.categories[index];
        if (confirm(`Are you sure you want to delete the "${category.name}" category? This will also remove all vendors in this category.`)) {
            // Remove category
            this.categories.splice(index, 1);
            
            // Remove vendors for this category
            if (this.vendors[category.name]) {
                delete this.vendors[category.name];
            }
            
            this.saveCategories();
            this.saveVendors();
            this.renderCategories();
            this.updateBudgetProgress();
            this.updateFinalSelection();
            
            // Hide active table if it was showing the deleted category
            if (this.currentCategory === category.name) {
                this.hideCategoryTable();
            }
        }
    }

    // Icon mapping using Material Icons
    getCategoryIcon(categoryName) {
        const iconMap = {
            'venue': 'location_city',
            'catering': 'restaurant',
            'entertainment': 'music_note',
            'photography': 'photo_camera',
            'floral and decor': 'local_florist',
            'gift favor': 'card_giftcard',
            'transportation': 'directions_car',
            'attire': 'checkroom',
            'beauty': 'spa',
            'invitations': 'mail',
            'planner': 'event_available',
            'officiant': 'person',
            'rentals': 'weekend',
            'lighting': 'wb_incandescent',
            'audio': 'surround_sound',
            'cake': 'cake',
            'bartending': 'local_bar',
            'security': 'security',
            'valet': 'directions_car'
        };

        const lowerName = categoryName.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (lowerName.includes(key)) {
                return icon;
            }
        }
        return 'category'; // Default icon
    }

    renderCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = '';

        this.categories.forEach((category, index) => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <div class="category-actions">
                    <button class="category-edit-btn" onclick="budgetManager.editCategory(${index})" title="Edit Category">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="category-delete-btn" onclick="budgetManager.deleteCategory(${index})" title="Delete Category">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
                <div class="category-icon">
                    <i class="material-icons">${category.icon}</i>
                </div>
                <div class="category-name">${category.name}</div>
            `;

            categoryCard.addEventListener('click', (e) => {
                // Don't trigger category click if clicking edit/delete buttons
                if (!e.target.closest('.category-actions')) {
                    this.showCategoryTable(category.name);
                }
            });

            categoriesGrid.appendChild(categoryCard);
        });
    }

    // ===============================================
    // VENDOR METHODS
    // ===============================================

    showCategoryTable(categoryName) {
        this.currentCategory = categoryName;
        
        // Show the active category table
        const activeTable = document.getElementById('activeCategoryTable');
        activeTable.classList.remove('hidden');
        
        // Update category title
        document.getElementById('activeCategoryTitle').innerHTML = `
            <i class="material-icons">${this.getCategoryIcon(categoryName)}</i>
            ${categoryName}
        `;
        
        // Render vendors for this category
        this.renderActiveVendorTable();
        
        // Scroll to the table
        activeTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    hideCategoryTable() {
        document.getElementById('activeCategoryTable').classList.add('hidden');
        this.currentCategory = null;
        this.hideVendorForm();
    }

    renderActiveVendorTable() {
        const tableBody = document.getElementById('activeVendorTableBody');
        if (!tableBody || !this.currentCategory) return;

        tableBody.innerHTML = '';
        const categoryVendors = this.vendors[this.currentCategory] || [];

        if (categoryVendors.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--wed-text);">
                        No vendors added yet. Click "Add Vendor" to get started.
                    </td>
                </tr>
            `;
            return;
        }

        categoryVendors.forEach(vendor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vendor.name}</td>
                <td>${vendor.contact || '-'}</td>
                <td>${this.formatCurrency(vendor.cost)}</td>
                <td>
                    <span class="status-badge status-${vendor.status}" 
                          onclick="budgetManager.changeVendorStatus('${vendor.id}')">
                        ${vendor.status}
                    </span>
                </td>
                <td>${vendor.notes || '-'}</td>
                <td>
                    <div class="vendor-actions">
                        <button class="edit-btn" onclick="budgetManager.editVendor('${vendor.id}')" title="Edit Vendor">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="delete-btn" onclick="budgetManager.deleteVendor('${vendor.id}')" title="Delete Vendor">
                            <i class="material-icons">delete</i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    changeVendorStatus(vendorId) {
        if (!this.currentCategory) return;
        
        const vendor = this.vendors[this.currentCategory].find(v => v.id === vendorId);
        if (!vendor) return;

        const statusOrder = ['considering', 'inprogress', 'selected', 'notselected'];
        const currentIndex = statusOrder.indexOf(vendor.status);
        const nextIndex = (currentIndex + 1) % statusOrder.length;
        vendor.status = statusOrder[nextIndex];

        this.saveVendors();
        this.renderActiveVendorTable();
        this.updateBudgetProgress();
        this.updateFinalSelection();
    }

    showVendorForm() {
        if (!this.currentCategory) {
            alert("Please select a category first");
            return;
        }
        
        this.editVendorId = null;
        document.getElementById('vendorFormTitle').textContent = 'Add Vendor';
        document.getElementById('vendorName').value = "";
        document.getElementById('vendorContact').value = "";
        document.getElementById('vendorCost').value = "";
        document.getElementById('vendorStatus').value = "considering";
        document.getElementById('vendorNotes').value = "";
        document.getElementById('inlineVendorForm').classList.remove('hidden');
    }

    hideVendorForm() {
        document.getElementById('inlineVendorForm').classList.add('hidden');
        this.editVendorId = null;
    }

    saveVendor() {
        if (!this.currentCategory) return;

        const name = document.getElementById('vendorName').value.trim();
        const contact = document.getElementById('vendorContact').value.trim();
        const cost = parseFloat(document.getElementById('vendorCost').value);
        const status = document.getElementById('vendorStatus').value;
        const notes = document.getElementById('vendorNotes').value.trim();

        if (!name || isNaN(cost)) {
            alert("Please fill in vendor name and cost");
            return;
        }

        if (!this.vendors[this.currentCategory]) {
            this.vendors[this.currentCategory] = [];
        }

        const vendorData = {
            id: this.editVendorId || Date.now().toString(),
            name,
            contact,
            cost, // Store in current currency
            status,
            notes,
            category: this.currentCategory
        };

        if (this.editVendorId) {
            const index = this.vendors[this.currentCategory].findIndex(v => v.id === this.editVendorId);
            if (index !== -1) {
                this.vendors[this.currentCategory][index] = vendorData;
            }
        } else {
            this.vendors[this.currentCategory].push(vendorData);
        }

        this.saveVendors();
        this.hideVendorForm();
        this.renderActiveVendorTable();
        this.updateBudgetProgress();
        this.updateFinalSelection();
    }

    editVendor(vendorId) {
        if (!this.currentCategory) return;
        
        const vendor = this.vendors[this.currentCategory].find(v => v.id === vendorId);
        if (vendor) {
            this.editVendorId = vendorId;
            document.getElementById('vendorFormTitle').textContent = 'Edit Vendor';
            document.getElementById('vendorName').value = vendor.name;
            document.getElementById('vendorContact').value = vendor.contact;
            document.getElementById('vendorCost').value = vendor.cost;
            document.getElementById('vendorStatus').value = vendor.status;
            document.getElementById('vendorNotes').value = vendor.notes;
            document.getElementById('inlineVendorForm').classList.remove('hidden');
        }
    }

    deleteVendor(vendorId) {
        if (!this.currentCategory) return;
        
        if (confirm('Are you sure you want to delete this vendor?')) {
            this.vendors[this.currentCategory] = this.vendors[this.currentCategory].filter(v => v.id !== vendorId);
            this.saveVendors();
            this.renderActiveVendorTable();
            this.updateBudgetProgress();
            this.updateFinalSelection();
        }
    }

    // ===============================================
    // FINAL SELECTION METHODS
    // ===============================================

    showFinalSelection() {
        document.querySelector('.page-wrapper').classList.add('hidden');
        document.getElementById('finalSelectionView').classList.remove('hidden');
        this.updateFinalSelection();
    }

    hideFinalSelection() {
        document.querySelector('.page-wrapper').classList.remove('hidden');
        document.getElementById('finalSelectionView').classList.add('hidden');
    }

    updateFinalSelection() {
        const tableBody = document.getElementById('finalSelectionBody');
        const totalCostElement = document.getElementById('totalFinalCost');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        let totalCost = 0;

        Object.keys(this.vendors).forEach(category => {
            const selectedVendors = this.vendors[category].filter(v => v.status === 'selected');
            
            selectedVendors.forEach(vendor => {
                totalCost += vendor.cost;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${category}</td>
                    <td>${vendor.name}</td>
                    <td>${vendor.contact || '-'}</td>
                    <td>${this.formatCurrency(vendor.cost)}</td>
                    <td>
                        <span class="status-badge status-selected">selected</span>
                    </td>
                    <td>${vendor.notes || '-'}</td>
                    <td>
                        <button class="delete-btn" onclick="budgetManager.cancelVendor('${vendor.id}', '${category}')" title="Cancel Selection">
                            <i class="material-icons">cancel</i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });

        if (totalCostElement) {
            totalCostElement.textContent = this.formatCurrency(totalCost);
        }

        if (tableBody.children.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2rem; color: var(--wed-text);">
                        No vendors selected yet. Mark vendors as "Selected" in their respective categories.
                    </td>
                </tr>
            `;
        }
    }

    cancelVendor(vendorId, categoryName) {
        const vendor = this.vendors[categoryName].find(v => v.id === vendorId);
        if (vendor) {
            vendor.status = 'notselected';
            this.saveVendors();
            
            // If we're currently viewing that category, update the table
            if (this.currentCategory === categoryName) {
                this.renderActiveVendorTable();
            }
            
            this.updateBudgetProgress();
            this.updateFinalSelection();
        }
    }

    // ===============================================
    // PDF EXPORT METHODS - CLEAN & SIMPLE
    // ===============================================

    async generatePDF() {
        const statusElement = document.getElementById('pdfStatus');
        
        try {
            statusElement.textContent = 'Generating PDF...';
            statusElement.className = 'pdf-status generating';

            await this.loadJsPdfLibrary();

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const primaryColor = [162, 67, 124]; // Wedding theme color
            const darkColor = [74, 68, 83];      // Dark text
            
            // ===== HEADER =====
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');
            
            // Title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Wedding Budget Summary', 20, 25);
            
            // ===== BUDGET INFO =====
            doc.setTextColor(...darkColor);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 55);
            doc.text(`Currency: ${this.selectedCurrency} (${this.getCurrencySymbol(this.selectedCurrency)})`, 20, 65);
            
            // Show exchange rate info if not USD
            if (this.selectedCurrency !== 'USD') {
                const usdRate = this.exchangeRates[this.selectedCurrency];
                if (usdRate) {
                    doc.text(`Exchange rate: 1 USD = ${usdRate.toFixed(4)} ${this.selectedCurrency}`, 20, 75);
                }
            }
            
            // Divider line
            doc.setDrawColor(200, 200, 200);
            const dividerY = this.selectedCurrency !== 'USD' ? 85 : 75;
            doc.line(20, dividerY, 190, dividerY);
            
            // ===== TABLE TITLE =====
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            const tableTitleY = dividerY + 15;
            doc.text('Final Vendor Selections & Costs', 20, tableTitleY);
            
            // ===== TABLE HEADERS =====
            let yPosition = tableTitleY + 20;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            // Headers
            doc.text('Vendor Category', 20, yPosition);
            doc.text('Vendor Name', 60, yPosition);
            doc.text('Contact', 110, yPosition);
            doc.text(`Cost (${this.selectedCurrency})`, 140, yPosition);
            doc.text('Status', 170, yPosition);
            
            // Header underline
            doc.setDrawColor(200, 200, 200);
            doc.line(20, yPosition + 2, 190, yPosition + 2);
            
            yPosition += 10;
            
            // ===== VENDOR ROWS =====
            doc.setFont('helvetica', 'normal');
            let totalCost = 0;
            let hasVendors = false;
            
            Object.keys(this.vendors).forEach(category => {
                const selectedVendors = this.vendors[category].filter(v => v.status === 'selected');
                
                selectedVendors.forEach(vendor => {
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 30;
                        
                        // Table headers on new page
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text('Vendor Category', 20, yPosition);
                        doc.text('Vendor Name', 60, yPosition);
                        doc.text('Contact', 110, yPosition);
                        doc.text(`Cost (${this.selectedCurrency})`, 140, yPosition);
                        doc.text('Status', 170, yPosition);
                        doc.line(20, yPosition + 2, 190, yPosition + 2);
                        yPosition += 10;
                        doc.setFont('helvetica', 'normal');
                    }
                    
                    hasVendors = true;
                    totalCost += vendor.cost;
                    
                    // Category
                    doc.text(category, 20, yPosition);
                    
                    // Vendor Name
                    const vendorName = vendor.name.length > 25 ? vendor.name.substring(0, 25) + '...' : vendor.name;
                    doc.text(vendorName, 60, yPosition);
                    
                    // Contact
                    const contact = vendor.contact || '-';
                    const contactDisplay = contact.length > 15 ? contact.substring(0, 15) + '...' : contact;
                    doc.text(contactDisplay, 110, yPosition);
                    
                    // Cost
                    const costText = this.formatCurrencyForPDF(vendor.cost);
                    doc.text(costText, 140, yPosition);
                    
                    // Status
                    const status = vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1);
                    doc.text(status, 170, yPosition);
                    
                    yPosition += 8;
                });
            });
            
            // ===== TOTAL ROW =====
            if (hasVendors) {
                yPosition += 5;
                
                // Divider line before total
                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPosition, 190, yPosition);
                yPosition += 8;
                
                // Total row
                doc.setFont('helvetica', 'bold');
                doc.text('TOTAL COST', 20, yPosition);
                const totalCostText = this.formatCurrencyForPDF(totalCost);
                doc.text(totalCostText, 140, yPosition);
                
                // Budget summary
                yPosition += 15;
                doc.setFontSize(10);
                doc.text('Budget Summary:', 20, yPosition);
                yPosition += 8;
                
                doc.setFont('helvetica', 'normal');
                const remaining = this.initialBudget - totalCost;
                const budgetInfo = [
                    `Initial Budget: ${this.formatCurrencyForPDF(this.initialBudget)}`,
                    `Total Selected: ${this.formatCurrencyForPDF(totalCost)}`,
                    `Remaining: ${this.formatCurrencyForPDF(remaining)}`
                ];
                
                budgetInfo.forEach((info, index) => {
                    doc.text(info, 25, yPosition + (index * 6));
                });
            } else {
                doc.setFontSize(11);
                doc.text('No vendors selected yet.', 20, yPosition);
            }
            
            // ===== FOOTER =====
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text('WedEASE Budget Tracker', 105, 290, { align: 'center' });
                doc.text(`Currency: ${this.selectedCurrency} • Powered by ExchangeRate-API`, 105, 295, { align: 'center' });
            }

            // Save the PDF
            const fileName = `Wedding-Budget-${this.selectedCurrency}-${new Date().getTime()}.pdf`;
            doc.save(fileName);

            statusElement.textContent = 'PDF generated successfully!';
            statusElement.className = 'pdf-status success';

        } catch (error) {
            console.error('PDF generation error:', error);
            statusElement.textContent = 'PDF generation failed. Please try again.';
            statusElement.className = 'pdf-status error';
        }
    }

    formatCurrencyForPDF(amount) {
        // Format without currency symbols, just numbers with commas
        return amount.toLocaleString();
    }

    async loadJsPdfLibrary() {
        if (window.jspdf) return;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // ===============================================
    // UTILITY METHODS
    // ===============================================

    addFormOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'form-overlay';
        overlay.id = 'formOverlay';
        overlay.addEventListener('click', () => {
            this.hideVendorForm();
            this.hideCategoryForm();
            this.hideEditCategoryForm();
        });
        document.body.appendChild(overlay);
    }

    removeFormOverlay() {
        const overlay = document.getElementById('formOverlay');
        if (overlay) overlay.remove();
    }

    saveCategories() {
        localStorage.setItem('wedease_categories', JSON.stringify(this.categories));
    }

    saveVendors() {
        localStorage.setItem('wedease_vendors', JSON.stringify(this.vendors));
    }
}

// ===============================================
// INITIALIZE BUDGET MANAGER
// ===============================================

let budgetManager;

document.addEventListener("DOMContentLoaded", () => {
    budgetManager = new BudgetManager();
    console.log("Budget page fully loaded and initialized");
});

// Make budgetManager available globally
window.budgetManager = budgetManager;