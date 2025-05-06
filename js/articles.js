/**
 * articles.js - Article-related functionality
 * Lamp Times Newspaper Website
 */

// Initialize articles when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await initArticles();
});

// Initialize articles
async function initArticles() {
    try {
        // Get articles from Supabase
        const articles = await getArticles();

        // Initialize page-specific functionality
        if (isHomePage()) {
            await initHomePage(articles);
        } else if (isArticlePage()) {
            await initArticlePage();
        } else if (isCategoryPage()) {
            // Category page is handled by category.js
        }
    } catch (error) {
        console.error('Error initializing articles:', error);
        // Clear all skeleton loaders even if there's an error
        clearAllSkeletonLoaders();
    }
}

// Clear all skeleton loaders in case of error
function clearAllSkeletonLoaders() {
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

// Check if current page is homepage
function isHomePage() {
    return window.location.pathname.endsWith('index.html') ||
           window.location.pathname.endsWith('/') ||
           window.location.pathname === '';
}

// Check if current page is article page
function isArticlePage() {
    return window.location.pathname.endsWith('article.html');
}

// Check if current page is category page
function isCategoryPage() {
    return window.location.pathname.endsWith('category.html');
}

// Initialize homepage
async function initHomePage(articles) {
    // Get the most recent article for the featured spot
    let featuredArticleId = 1; // Default fallback

    if (articles && articles.length > 0) {
        // Sort articles by created_at date (most recent first)
        const sortedArticles = [...articles].sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        // Use the most recent article as the featured article
        const featuredArticle = sortedArticles[0];
        featuredArticleId = featuredArticle.id;

        // Render the featured article
        renderFeaturedArticle(featuredArticle);
    }

    // Render main articles (excluding the featured one)
    renderMainArticles(articles, featuredArticleId);

    // Render popular articles
    renderPopularArticles(articles);

    // Render opinion articles
    renderOpinionArticles(articles);
}

// Initialize article page
async function initArticlePage() {
    // Render full article
    await renderFullArticle();
}

// Render featured article on homepage
function renderFeaturedArticle(article) {
    const container = document.getElementById('featured-article-container');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create article content
    const content = createElement('div', 'article-content');

    // Create title with link
    const title = createElement('h2', 'article-title');
    const titleLink = createElement('a', '', article.title);
    titleLink.href = `article.html?id=${article.id}`;
    title.appendChild(titleLink);

    // Create meta information
    const meta = createElement('p', 'article-meta', `By ${article.author} | ${formatDate(article.created_at)}`);

    // Create excerpt
    const excerpt = createElement('p', 'article-excerpt', article.excerpt);

    // Create read more link
    const readMore = createElement('a', 'read-more', 'Continue Reading');
    readMore.href = `article.html?id=${article.id}`;

    // Add image if available
    if (article.image) {
        const imageContainer = createElement('div', 'article-image');
        const image = document.createElement('img');
        image.src = article.image;
        image.width = 800;
        image.height = 450;
        image.alt = article.title;
        imageContainer.appendChild(image);
        container.appendChild(imageContainer);
        container.classList.add('with-image');
    }

    // Append all elements
    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(excerpt);
    content.appendChild(readMore);
    container.appendChild(content);
}

// Render main articles on homepage
function renderMainArticles(articles, featuredArticleId) {
    const container = document.getElementById('main-articles-container');
    if (!container) return;

    // Clear skeleton loaders
    container.innerHTML = '';

    const mainArticles = getMainArticles(articles, featuredArticleId);

    if (mainArticles.length === 0) {
        container.innerHTML = '<div class="empty-state">No articles available.</div>';
        return;
    }

    mainArticles.forEach(article => {
        const articleCard = createArticleCard(article);
        container.appendChild(articleCard);
    });
}

// Render popular articles in sidebar
function renderPopularArticles(articles) {
    const container = document.getElementById('popular-articles-container');
    if (!container) return;

    // Clear skeleton loaders
    container.innerHTML = '';

    const popularArticles = getPopularArticles(articles);

    if (popularArticles.length === 0) {
        container.innerHTML = '<div class="empty-state">No popular articles available.</div>';
        return;
    }

    popularArticles.forEach(article => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `article.html?id=${article.id}`;
        link.textContent = article.title;
        listItem.appendChild(link);
        container.appendChild(listItem);
    });
}

// Render opinion articles in sidebar
function renderOpinionArticles(articles) {
    const container = document.getElementById('opinion-articles-container');
    if (!container) return;

    // Clear skeleton loaders
    container.innerHTML = '';

    const opinionArticles = getOpinionArticles(articles);

    if (opinionArticles.length === 0) {
        container.innerHTML = '<div class="empty-state">No opinion articles available.</div>';
        return;
    }

    opinionArticles.forEach(article => {
        const opinionCard = createOpinionCard(article);
        container.appendChild(opinionCard);
    });
}

// Render full article on article page
async function renderFullArticle() {
    const container = document.getElementById('article-content');
    if (!container) return;

    // Clear container but maintain its height
    const containerHeight = container.offsetHeight;
    container.style.minHeight = `${containerHeight}px`;

    const articleId = parseInt(getUrlParameter('id'));
    if (!articleId) {
        container.innerHTML = '<div class="error-message">Article not found</div>';
        return;
    }

    try {
        // Get article from Supabase
        const article = await getArticleById(articleId);

        if (!article) {
            container.innerHTML = '<div class="error-message">Article not found</div>';
            return;
        }

        // Clear container
        container.innerHTML = '';

        // Create article elements
        const title = createElement('h1', 'article-title', article.title);
        const meta = createElement('p', 'article-meta', `By ${article.author} | ${formatDate(article.created_at)}`);

        // CLS Fix: Create bookmark container with fixed dimensions
        const bookmarkContainer = createElement('div', 'bookmark-container');

        const content = createElement('div', 'article-content');

        // CLS Fix: If article has an image, add it with fixed dimensions
        if (article.image) {
            const imageContainer = createElement('div', 'article-image');
            const image = document.createElement('img');
            image.src = article.image;
            image.width = 800;
            image.height = 450;
            image.alt = article.title;
            imageContainer.appendChild(image);
            content.appendChild(imageContainer);
        }

        // Add lead paragraph
        const lead = createElement('p', 'article-lead', article.excerpt);
        content.appendChild(lead);

        // Add full content
        article.content.forEach(paragraph => {
            const p = createElement('p', '', paragraph);
            content.appendChild(p);
        });

        // Add elements to container
        container.appendChild(title);
        container.appendChild(meta);
        container.appendChild(bookmarkContainer);
        container.appendChild(content);

        // Reset container height
        container.style.minHeight = '';

        // Render related articles
        await renderRelatedArticles(articleId, article.category);

        // Update page title
        document.title = `${article.title} - Lamp Times`;

        // Apply transition effects to article elements
        if (typeof applyArticleTransitions === 'function') {
            applyArticleTransitions();
        }
    } catch (error) {
        console.error('Error rendering article:', error);
        container.innerHTML = '<div class="error-message">Error loading article. Please try again.</div>';
    }
}

// Render related articles on article page
async function renderRelatedArticles(currentArticleId, category) {
    const container = document.getElementById('related-articles-container');
    if (!container) return;

    // Clear skeleton loaders
    container.innerHTML = '';

    try {
        // Get related articles from Supabase
        const articles = await getArticlesByCategory(category);
        const relatedArticles = articles
            .filter(article => article.id !== currentArticleId)
            .slice(0, 3);

        if (relatedArticles.length === 0) {
            container.innerHTML = '<div class="empty-state">No related articles found.</div>';
            return;
        }

        relatedArticles.forEach(article => {
            const relatedCard = createRelatedCard(article);
            container.appendChild(relatedCard);
        });
    } catch (error) {
        console.error('Error rendering related articles:', error);
        container.innerHTML = '<div class="error-message">Error loading related articles.</div>';
    }
}

// Create article card element
function createArticleCard(article) {
    const card = createElement('article', 'article-card');

    // CLS Fix: If there's an image, create it with proper dimensions
    if (article.image) {
        const imageContainer = createElement('div', 'article-image');
        const image = document.createElement('img');
        image.src = article.image;
        // CLS Fix: Add width and height attributes
        image.width = 640;
        image.height = 360;
        image.alt = article.title;
        image.loading = 'lazy'; // Use lazy loading for non-critical images
        imageContainer.appendChild(image);
        card.appendChild(imageContainer);
        card.classList.add('with-image');
    }

    const content = createElement('div', 'article-content');

    const title = createElement('h3', 'article-title');
    const titleLink = createElement('a', '', article.title);
    titleLink.href = `article.html?id=${article.id}`;
    title.appendChild(titleLink);

    const meta = createElement('p', 'article-meta', `By ${article.author} | ${formatDate(article.created_at)}`);
    const excerpt = createElement('p', 'article-excerpt', article.excerpt);

    const readMore = createElement('a', 'read-more', 'Continue Reading');
    readMore.href = `article.html?id=${article.id}`;

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(excerpt);
    content.appendChild(readMore);

    card.appendChild(content);

    return card;
}

// Create opinion card element
function createOpinionCard(article) {
    const card = createElement('div', 'opinion-card');

    const title = createElement('h4', 'article-title');
    const titleLink = createElement('a', '', article.title);
    titleLink.href = `article.html?id=${article.id}`;
    title.appendChild(titleLink);

    const meta = createElement('p', 'article-meta', `By ${article.author}`);
    const excerpt = createElement('p', 'article-excerpt', truncateText(article.excerpt, 100));

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(excerpt);

    return card;
}

// Create related article card element
function createRelatedCard(article) {
    const card = createElement('div', 'related-card');

    // CLS Fix: Add image with fixed dimensions
    if (article.image) {
        const imageContainer = createElement('div', 'article-image');
        const image = document.createElement('img');
        image.src = article.image;
        // CLS Fix: Add width and height attributes
        image.width = 100;
        image.height = 75;
        image.alt = article.title;
        image.loading = 'lazy';
        imageContainer.appendChild(image);
        card.appendChild(imageContainer);
    }

    const content = createElement('div', 'article-content');

    const title = createElement('h4', 'article-title');
    const titleLink = createElement('a', '', article.title);
    titleLink.href = `article.html?id=${article.id}`;
    title.appendChild(titleLink);

    const meta = createElement('p', 'article-meta', `By ${article.author}`);

    content.appendChild(title);
    content.appendChild(meta);

    card.appendChild(content);

    return card;
}
