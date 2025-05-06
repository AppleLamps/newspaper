/**
 * main.js - Core JavaScript functionality
 * Lamp Times Newspaper Website
 */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initApp().catch(error => console.error('Error initializing app:', error));

    // Set a timeout to clear skeleton loaders if content doesn't load
    setTimeout(function() {
        // Check if any skeleton loaders are still visible
        const skeletonLoaders = document.querySelectorAll('.skeleton-loader');
        if (skeletonLoaders.length > 0) {
            console.warn('Content loading timeout - clearing skeleton loaders');
            if (typeof clearAllSkeletonLoaders === 'function') {
                clearAllSkeletonLoaders();
            } else {
                // Fallback if clearAllSkeletonLoaders is not available
                const containers = [
                    'main-articles-container',
                    'popular-articles-container',
                    'opinion-articles-container',
                    'article-content',
                    'related-articles-container'
                ];

                containers.forEach(containerId => {
                    const container = document.getElementById(containerId);
                    if (container) {
                        container.innerHTML = '<div class="error-message">Unable to load content. Please check your connection.</div>';
                    }
                });
            }
        }
    }, 5000); // 5 second timeout
});

// Main initialization function
async function initApp() {
    // Set current date in header
    updateCurrentDate();

    // Update navigation links based on authentication status
    if (typeof updateNavLinks === 'function') {
        await updateNavLinks();
    }
}

// Update current date in header
function updateCurrentDate() {
    const dateElement = document.querySelector('.header-top .date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}
