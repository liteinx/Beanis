/**
 * Beanis App Detail JavaScript
 * Handles token-based variant loading for app download pages
 */

(function() {
    'use strict';

    // Configuration - set by template
    const APP_SLUG = window.BEANIS_APP_SLUG || '';

    // State
    let matchedVariant = null;

    /**
     * Initialize the app detail page
     */
    async function init() {
        // Parse URL token
        const token = parseUrlToken();

        if (!token) {
            // No token, show default variant
            return;
        }

        // Fetch and apply variant
        await loadVariant(token);
    }

    /**
     * Parse token from URL query parameter
     */
    function parseUrlToken() {
        const params = new URLSearchParams(window.location.search);
        return params.get('r');
    }

    /**
     * Load variant data and update page
     */
    async function loadVariant(token) {
        try {
            const data = await fetchApkVariants();
            matchedVariant = findVariantByToken(data.variants, token);

            if (matchedVariant) {
                applyVariant(matchedVariant);
                showTokenNotice(true);
            } else {
                handleInvalidToken();
            }
        } catch (error) {
            console.error('Failed to load variant:', error);
            showError('Failed to load app information');
        }
    }

    /**
     * Fetch APK variants JSON
     */
    async function fetchApkVariants() {
        const response = await fetch(`/apps/${APP_SLUG}/apks.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    /**
     * Find variant by token
     */
    function findVariantByToken(variants, token) {
        return variants.find(v => v.token === token);
    }

    /**
     * Apply variant to the page
     */
    function applyVariant(variant) {
        // Update download button
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn && variant.apk_file) {
            downloadBtn.href = `/apps/${APP_SLUG}/apks/${variant.apk_file}`;
        }

        // Update version
        updateElement('.download-meta-value', variant.version, 0);

        // Update size
        if (variant.size_mb !== undefined) {
            const sizeText = `${variant.size_mb} MB`;
            updateElement('.download-meta-value', sizeText, 1);
        }

        // Update date
        if (variant.update_date) {
            updateElement('.download-meta-value', variant.update_date, 2);
        }

        // Update version badge
        const versionBadge = document.querySelector('.app-version-badge');
        if (versionBadge && variant.version) {
            versionBadge.textContent = `Version ${variant.version}`;
        }

        // Update changelog if present
        if (variant.changelog) {
            const changelogText = document.querySelector('.changelog-text');
            if (changelogText) {
                changelogText.textContent = variant.changelog;
            }
        }
    }

    /**
     * Update element at index
     */
    function updateElement(selector, value, index) {
        const elements = document.querySelectorAll(selector);
        if (elements[index]) {
            elements[index].textContent = value;
        }
    }

    /**
     * Show token-specific notice
     */
    function showTokenNotice(show) {
        const notice = document.querySelector('.token-notice');
        if (notice) {
            notice.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Handle invalid token
     */
    function handleInvalidToken() {
        // Could show a warning or fallback to default
        const downloadBtn = document.querySelector('.download-btn');
        if (downloadBtn) {
            downloadBtn.href = '#';
            downloadBtn.textContent = 'Invalid Download Link';
            downloadBtn.style.opacity = '0.5';
            downloadBtn.style.pointerEvents = 'none';
        }

        // Show error message
        const downloadCard = document.querySelector('.download-card');
        if (downloadCard) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-token';
            errorDiv.innerHTML = `
                <div class="invalid-token-icon">⚠️</div>
                <div class="invalid-token-title">Invalid Download Link</div>
                <div class="invalid-token-text">
                    The download link you're using is not valid.
                    Please contact support for a new link.
                </div>
            `;
            downloadCard.insertBefore(errorDiv, downloadCard.firstChild);
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const downloadCard = document.querySelector('.download-card');
        if (downloadCard) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-token';
            errorDiv.innerHTML = `
                <div class="invalid-token-icon">❌</div>
                <div class="invalid-token-title">Error</div>
                <div class="invalid-token-text">${escapeHtml(message)}</div>
            `;
            downloadCard.insertBefore(errorDiv, downloadCard.firstChild);
        }
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
     * Copy download link to clipboard
     */
    function copyDownloadLink() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            // Show feedback
            const btn = document.querySelector('[data-action="copy-link"]');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    /**
     * Share download link
     */
    async function shareDownloadLink() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share canceled or failed');
            }
        } else {
            copyDownloadLink();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally
    window.BeanisAppDetail = {
        copyDownloadLink,
        shareDownloadLink,
        refresh: loadVariant
    };
})();
