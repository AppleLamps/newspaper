/**
 * category.js - Category page functionality
 * Lamp Timess Newspaper Website
 */

// Initialize the category page
document.addEventListener('DOMContentLoaded', async function() {
    if (isCategoryPage()) {
        await initCategoryPage();
    }
});

// Check if current page is category page
function isCategoryPage() {
    return window.location.pathname.endsWith('category.html');
}

// Initialize category page
async function initCategoryPage() {
    const category = getUrlParameter('category');
    if (!category) {
        showCategoryError("Category not specified");
        return;
    }

    // Update page title
    document.title = `${category} - Lamp Times`;

    // Update category title
    const categoryTitle = document.getElementById('category-title');
    if (categoryTitle) {
        categoryTitle.textContent = category;
    }

    // Set active nav link
    setActiveCategoryNav(category);

    // Render category articles
    await renderCategoryArticles(category);
}

// Set the active navigation link based on current category
function setActiveCategoryNav(category) {
    // Remove any existing active class
    const activeLinks = document.querySelectorAll('.main-nav a.active');
    activeLinks.forEach(link => link.classList.remove('active'));

    // Add active class to current category link
    const categoryLinks = document.querySelectorAll('.main-nav a');
    categoryLinks.forEach(link => {
        if (link.href.includes(`category=${category}`)) {
            link.classList.add('active');
        }
    });
}

// Render articles for the selected category
async function renderCategoryArticles(category) {
    const container = document.getElementById('category-articles-container');
    if (!container) return;

    // Clear loading message
    container.innerHTML = '';

    try {
        // Get articles from Supabase
        const categoryArticles = await getArticlesByCategory(category);

        if (categoryArticles.length === 0) {
            container.innerHTML = `<div class="error-message">No articles found in the ${category} category</div>`;
            return;
        }

        // Render each article
        categoryArticles.forEach(article => {
            const articleCard = createArticleCard(article);
            container.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error loading category articles:', error);
        container.innerHTML = `<div class="error-message">Error loading articles. Please try again.</div>`;
    }
}

// Show error message when category loading fails
function showCategoryError(message) {
    const container = document.getElementById('category-articles-container');
    if (container) {
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    const categoryTitle = document.getElementById('category-title');
    if (categoryTitle) {
        categoryTitle.textContent = 'Category Error';
    }
}
