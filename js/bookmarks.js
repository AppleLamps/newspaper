/**
 * bookmarks.js - Bookmarking functionality
 * Lamp Times Newspaper Website
 */

// Initialize bookmarking functionality
document.addEventListener('DOMContentLoaded', function() {
    initBookmarks();
});

// Initialize bookmarks
async function initBookmarks() {
    // Check if on article page
    if (isArticlePage()) {
        await setupBookmarkButton();
    }

    // Update auth/profile links in navigation
    await updateNavLinks();
}

// Check if current page is article page
function isArticlePage() {
    return window.location.pathname.endsWith('article.html');
}

// Set up bookmark button on article page
async function setupBookmarkButton() {
    const articleId = parseInt(getUrlParameter('id'));
    if (!articleId) return;

    // Get article container
    const articleContent = document.getElementById('article-content');
    if (!articleContent) return;

    // CLS Fix: Look for an existing bookmark container instead of creating one
    let bookmarkContainer = articleContent.querySelector('.bookmark-container');

    // If no container exists, the article hasn't loaded yet
    if (!bookmarkContainer) return;

    // Check if user is logged in
    const user = await checkUser();

    // Create bookmark button
    const bookmarkButton = document.createElement('button');
    bookmarkButton.className = 'btn bookmark-btn';
    bookmarkButton.dataset.id = articleId;

    // CLS Fix: Set a fixed width to prevent layout shifts when text changes
    bookmarkButton.style.minWidth = '150px';

    // Check if article is already bookmarked
    if (user) {
        const isBookmarked = await isArticleBookmarked(articleId);

        if (isBookmarked) {
            bookmarkButton.textContent = 'Remove Bookmark';
            bookmarkButton.classList.add('bookmarked');
        } else {
            bookmarkButton.textContent = 'Bookmark Article';
        }

        // Add event listener
        bookmarkButton.addEventListener('click', handleBookmarkClick);
    } else {
        // If not logged in, show sign in prompt
        bookmarkButton.textContent = 'Sign in to Bookmark';
        bookmarkButton.addEventListener('click', function() {
            window.location.href = 'auth.html';
        });
    }

    // Clear existing content and add button to container
    bookmarkContainer.innerHTML = '';
    bookmarkContainer.appendChild(bookmarkButton);
}

// Handle bookmark button click
async function handleBookmarkClick(e) {
    const button = e.target;
    const articleId = parseInt(button.dataset.id);

    // Check if already bookmarked
    const isBookmarked = button.classList.contains('bookmarked');

    try {
        if (isBookmarked) {
            // Remove bookmark
            const { error } = await removeBookmark(articleId);

            if (error) {
                console.error('Error removing bookmark:', error);
                return;
            }

            // Update button
            button.textContent = 'Bookmark Article';
            button.classList.remove('bookmarked');
        } else {
            // Add bookmark
            const { error } = await bookmarkArticle(articleId);

            if (error) {
                console.error('Error adding bookmark:', error);
                return;
            }

            // Update button
            button.textContent = 'Remove Bookmark';
            button.classList.add('bookmarked');
        }

        // CLS Fix: Prevent layout shifts by not changing the button size
        // Force the button to maintain its width
        const currentWidth = button.offsetWidth;
        button.style.minWidth = currentWidth + 'px';
    } catch (error) {
        console.error('Bookmark error:', error);
    }
}

// Update navigation links based on auth status
async function updateNavLinks() {
    const profileLink = document.getElementById('profile-link');
    const authLink = document.getElementById('auth-link');

    if (!profileLink || !authLink) return;

    // Check if user is logged in
    const user = await checkUser();

    if (user) {
        // Show profile link, hide auth link
        profileLink.classList.remove('hidden');
        authLink.classList.add('hidden');

        // Add sign out link if not already present
        if (!document.getElementById('signout-link')) {
            const navList = authLink.parentNode.parentNode;

            const signoutItem = document.createElement('li');
            const signoutLink = document.createElement('a');
            signoutLink.href = '#';
            signoutLink.id = 'signout-link';
            signoutLink.textContent = 'Sign Out';

            signoutLink.addEventListener('click', async function(e) {
                e.preventDefault();

                try {
                    // Sign out user
                    const { error } = await signOut();

                    if (error) {
                        console.error('Sign out error:', error);
                        return;
                    }

                    // Redirect to home page
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Sign out error:', error);
                }
            });

            signoutItem.appendChild(signoutLink);
            navList.appendChild(signoutItem);
        }
    } else {
        // Show auth link, hide profile link
        profileLink.classList.add('hidden');
        authLink.classList.remove('hidden');

        // Remove sign out link if present
        const signoutLink = document.getElementById('signout-link');
        if (signoutLink) {
            signoutLink.parentNode.remove();
        }
    }
}
