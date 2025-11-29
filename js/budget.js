// ===============================================
// COMPLETE BUDGET MANAGER WITH POPUP FORMS
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
        this.init();
    }

    init() {
        console.log("Budget Manager initialized");
        this.bindEvents();
        this.renderCategories();
        this.updateBudgetProgress();
        this.loadInitialBudget();
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

    loadInitialBudget() {
        const budgetInput = document.getElementById('initialBudget');
        if (budgetInput) {
            budgetInput.value = this.initialBudget || '';
        }
    }

    updateInitialBudget(newBudget) {
        const budgetValue = parseInt(newBudget) || 0;
        this.initialBudget = budgetValue;
        localStorage.setItem('wedease_initial_budget', budgetValue.toString());
        this.updateBudgetProgress();
    }

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
                <td>$${vendor.cost.toLocaleString()}</td>
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
            cost,
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
                    <td>$${vendor.cost.toLocaleString()}</td>
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
            totalCostElement.textContent = `$${totalCost.toLocaleString()}`;
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

    updateBudgetProgress() {
        const moneySpentElement = document.getElementById('moneySpent');
        const progressFill = document.getElementById('budgetProgressFill');
        const progressText = document.getElementById('progressText');
        const progressPercentage = document.getElementById('progressPercentage');
        
        // Calculate total spent from selected vendors
        const totalSpent = Object.keys(this.vendors).reduce((total, category) => {
            const selectedVendors = this.vendors[category].filter(v => v.status === 'selected');
            return total + selectedVendors.reduce((sum, vendor) => sum + vendor.cost, 0);
        }, 0);

        if (moneySpentElement) {
            moneySpentElement.textContent = `$${totalSpent.toLocaleString()}`;
        }

        // Update progress bar
        if (progressFill && progressText && progressPercentage) {
            if (this.initialBudget > 0) {
                const percentage = (totalSpent / this.initialBudget) * 100;
                const displayPercentage = Math.min(percentage, 100);
                
                progressFill.style.width = `${displayPercentage}%`;
                progressText.textContent = `$${totalSpent.toLocaleString()} of $${this.initialBudget.toLocaleString()} used`;
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
        
        // Color coding for money spent
        if (moneySpentElement) {
            if (this.initialBudget > 0 && totalSpent > this.initialBudget) {
                moneySpentElement.style.color = '#e53e3e';
            } else if (this.initialBudget > 0 && totalSpent > this.initialBudget * 0.8) {
                moneySpentElement.style.color = '#d69e2e';
            } else {
                moneySpentElement.style.color = 'var(--wed-primary)';
            }
        }
    }

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