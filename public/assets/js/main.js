/**
 * Beanis Main JavaScript
 * Handles app fetching, rendering, search, and filtering for the homepage
 */

// State
let allApps = [];
let filteredApps = [];
let currentCategory = 'all';

// DOM Elements
const elements = {
    appsGrid: null,
    searchInput: null,
    loadingState: null,
    emptyState: null,
    categoryFilter: null
};

// Categories for filtering
const categories = ['all', 'Productivity', 'Communication', 'Social', 'Entertainment',
                   'Tools', 'Shopping', 'Games', 'Finance', 'Health', 'Education', 'Other'];

/**
 * Initialize the application
 */
async function init() {
    // Cache DOM elements
    elements.appsGrid = document.getElementById('appsGrid');
    elements.searchInput = document.getElementById('searchInput');
    elements.loadingState = document.getElementById('loadingState');
    elements.emptyState = document.getElementById('emptyState');
    elements.categoryFilter = document.querySelector('.category-filter');

    // Setup event listeners
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Create category filter
    createCategoryFilter();

    // Fetch and render apps
    await fetchApps();
    renderApps();
}

/**
 * Fetch apps from the API
 */
async function fetchApps() {
    showLoading(true);

    try {
        const response = await fetch('/data/apps.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allApps = await response.json();
        filteredApps = [...allApps];
    } catch (error) {
        console.error('Failed to fetch apps:', error);
        showError('Failed to load apps. Please refresh the page.');
        allApps = [];
        filteredApps = [];
    } finally {
        showLoading(false);
    }
}

/**
 * Render app cards to the grid
 */
function renderApps() {
    if (!elements.appsGrid) return;

    // Clear existing content
    elements.appsGrid.innerHTML = '';

    // Show empty state if no apps
    if (filteredApps.length === 0) {
        showEmpty(true);
        return;
    }

    showEmpty(false);

    // Create and append app cards
    filteredApps.forEach(app => {
        const card = createAppCard(app);
        elements.appsGrid.appendChild(card);
    });
}

/**
 * Create an app card element
 */
function createAppCard(app) {
    const card = document.createElement('a');
    card.href = app.url || `/apps/${app.slug}/`;
    card.className = 'app-card';
    card.setAttribute('data-category', app.category || 'Other');

    // Icon with fallback
    const iconUrl = app.icon && app.icon !== 'icon.png'
        ? `${app.url}${app.icon}`
        : `/apps/${app.slug}/icon.png`;

    card.innerHTML = `
        <img src="${iconUrl}" alt="${escapeHtml(app.name)}" class="app-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 128 128%22%3E%3Crect width=%22128%22 height=%22128%22 fill=%22%231a1a1a%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%236366f1%22 font-size=%2248%22 font-weight=%22bold%22%3E${escapeHtml(app.name.charAt(0))}%3C/text%3E%3C/svg%3E'">
        <div class="app-info">
            <div class="app-name">${escapeHtml(app.name)}</div>
            <div class="app-desc">${escapeHtml(app.short_desc)}</div>
            <div class="app-meta">
                <span class="app-category">${escapeHtml(app.category || 'Other')}</span>
                ${app.last_updated ? `<span>Updated: ${escapeHtml(app.last_updated)}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

/**
 * Create category filter buttons
 */
function createCategoryFilter() {
    if (!elements.appsGrid) return;

    // Find or create filter container
    let filterContainer = document.querySelector('.category-filter');
    if (!filterContainer) {
        filterContainer = document.createElement('div');
        filterContainer.className = 'category-filter';

        // Insert before apps grid
        const appsSection = document.getElementById('apps');
        if (appsSection) {
            const container = appsSection.querySelector('.container');
            if (container) {
                container.insertBefore(filterContainer, elements.appsGrid);
            }
        }
    }

    // Create buttons
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category === 'all' ? 'All Apps' : category;
        button.dataset.category = category;

        if (category === currentCategory) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => handleCategoryFilter(category));
        filterContainer.appendChild(button);
    });
}

/**
 * Handle search input
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();

    if (query === '') {
        filteredApps = [...allApps];
    } else {
        filteredApps = allApps.filter(app => {
            const name = app.name.toLowerCase();
            const desc = app.short_desc.toLowerCase();
            const packageId = app.package_id.toLowerCase();
            const category = (app.category || '').toLowerCase();

            return name.includes(query) ||
                   desc.includes(query) ||
                   packageId.includes(query) ||
                   category.includes(query);
        });
    }

    renderApps();
}

/**
 * Handle category filter
 */
function handleCategoryFilter(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Filter apps
    if (category === 'all') {
        filteredApps = [...allApps];
    } else {
        filteredApps = allApps.filter(app => app.category === category);
    }

    // Re-apply search if there's a query
    if (elements.searchInput && elements.searchInput.value) {
        const event = { target: elements.searchInput };
        handleSearch(event);
    } else {
        renderApps();
    }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
    if (elements.loadingState) {
        elements.loadingState.style.display = show ? 'block' : 'none';
    }
}

/**
 * Show/hide empty state
 */
function showEmpty(show) {
    if (elements.emptyState) {
        elements.emptyState.style.display = show ? 'block' : 'none';
        if (show && elements.searchInput && elements.searchInput.value) {
            elements.emptyState.querySelector('.empty-state-text').textContent =
                'No apps found matching your search.';
        } else if (show) {
            elements.emptyState.querySelector('.empty-state-text').textContent =
                'No apps available yet.';
        }
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (elements.emptyState) {
        elements.emptyState.style.display = 'block';
        const textEl = elements.emptyState.querySelector('.empty-state-text');
        if (textEl) {
            textEl.textContent = message;
        }
    }
}

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Smooth scroll to section
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Expose useful functions globally
window.Beanis = {
    scrollToSection,
    refreshApps: fetchApps
};
