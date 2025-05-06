/**
 * utils.js - Utility functions
 * Lamp Times Newspaper Website
 */

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Truncate text to a specific length
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

// Create element with classes
function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

// Shuffle array (for random article selection)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Get related articles by category
function getRelatedArticles(articles, currentArticleId, category, count = 3) {
    return articles
        .filter(article => article.id !== currentArticleId && article.category === category)
        .slice(0, count);
}

// Get popular articles (mock implementation)
function getPopularArticles(articles, count = 5) {
    // In a real implementation, this would be based on view counts or other metrics
    // For now, we'll just shuffle and take the first few
    return shuffleArray(articles).slice(0, count);
}

// Get opinion articles
function getOpinionArticles(articles, count = 2) {
    return articles
        .filter(article => article.category === 'Opinion')
        .slice(0, count);
}

// Get main articles (excluding featured and opinion)
function getMainArticles(articles, featuredArticleId, count = 6) {
    return articles
        .filter(article => article.id !== featuredArticleId && article.category !== 'Opinion')
        .slice(0, count);
}
