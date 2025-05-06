/**
 * article-ui.js - Enhanced UI for article pages
 * Lamp Times Newspaper Website
 */

// Initialize article UI enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (isArticlePage()) {
        initArticleUI();
    }
});

// Check if current page is article page
function isArticlePage() {
    return window.location.pathname.endsWith('article.html');
}

// Initialize article UI enhancements
function initArticleUI() {
    // Initialize reading progress bar
    initReadingProgress();
    
    // Initialize back to top button
    initBackToTop();
    
    // Initialize article navigation
    initArticleNavigation();
    
    // Initialize image loading effects
    initImageLoadingEffects();
}

// Initialize reading progress bar
function initReadingProgress() {
    const progressBar = document.getElementById('reading-progress');
    if (!progressBar) return;
    
    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
        // Calculate how far down the page the user has scrolled
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        // Update progress bar width
        progressBar.style.width = scrollPercent + '%';
    });
}

// Initialize back to top button
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;
    
    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', function() {
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize article navigation
async function initArticleNavigation() {
    const prevButton = document.getElementById('prev-article');
    const nextButton = document.getElementById('next-article');
    
    if (!prevButton || !nextButton) return;
    
    try {
        // Get current article ID
        const currentArticleId = parseInt(getUrlParameter('id'));
        if (!currentArticleId) {
            hideArticleNavigation();
            return;
        }
        
        // Get all articles
        const articles = await getArticles();
        if (!articles || articles.length === 0) {
            hideArticleNavigation();
            return;
        }
        
        // Sort articles by ID
        const sortedArticles = [...articles].sort((a, b) => a.id - b.id);
        
        // Find current article index
        const currentIndex = sortedArticles.findIndex(article => article.id === currentArticleId);
        if (currentIndex === -1) {
            hideArticleNavigation();
            return;
        }
        
        // Set up previous article button
        if (currentIndex > 0) {
            const prevArticle = sortedArticles[currentIndex - 1];
            prevButton.href = `article.html?id=${prevArticle.id}`;
            prevButton.title = prevArticle.title;
        } else {
            prevButton.classList.add('hidden');
        }
        
        // Set up next article button
        if (currentIndex < sortedArticles.length - 1) {
            const nextArticle = sortedArticles[currentIndex + 1];
            nextButton.href = `article.html?id=${nextArticle.id}`;
            nextButton.title = nextArticle.title;
        } else {
            nextButton.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error initializing article navigation:', error);
        hideArticleNavigation();
    }
}

// Hide article navigation
function hideArticleNavigation() {
    const navigation = document.getElementById('article-navigation');
    if (navigation) {
        navigation.style.display = 'none';
    }
}

// Initialize image loading effects
function initImageLoadingEffects() {
    // Add loading class to all images
    const images = document.querySelectorAll('.article-image img');
    
    images.forEach(img => {
        // Add loading class
        img.classList.add('image-loading');
        
        // Remove loading class when image is loaded
        img.addEventListener('load', function() {
            // Use setTimeout to create a slight delay for visual effect
            setTimeout(() => {
                img.classList.remove('image-loading');
                img.classList.add('image-loaded');
            }, 100);
        });
    });
}

// Apply transition classes to article elements
function applyArticleTransitions() {
    // Get article elements
    const title = document.querySelector('.full-article .article-title');
    const meta = document.querySelector('.full-article .article-meta');
    const image = document.querySelector('.full-article .article-image');
    const lead = document.querySelector('.full-article .article-lead');
    const paragraphs = document.querySelectorAll('.full-article .article-content p:not(.article-lead)');
    
    // Add transition classes
    if (title) {
        title.classList.add('article-content-transition', 'article-title-transition');
    }
    
    if (meta) {
        meta.classList.add('article-content-transition', 'article-meta-transition');
    }
    
    if (image) {
        image.classList.add('article-content-transition', 'article-image-transition');
    }
    
    if (lead) {
        lead.classList.add('article-content-transition', 'article-lead-transition');
    }
    
    // Add transition to paragraphs with increasing delay
    paragraphs.forEach((p, index) => {
        p.classList.add('article-content-transition');
        p.style.animationDelay = `${0.5 + (index * 0.1)}s`;
    });
}

// Get URL parameter by name
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
