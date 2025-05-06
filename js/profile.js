/**
 * profile.js - User profile functionality
 * Lamp Timess Newspaper Website
 */

// Initialize the profile page
document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

// Initialize profile page
async function initProfilePage() {
    try {
        // Check if user is logged in
        const user = await checkUser();
        if (!user) {
            // Redirect to auth page if not logged in
            window.location.href = 'auth.html';
            return;
        }

        // Set up tabs
        setupTabs();

        // Set up sign out
        setupSignOut();

        // Load user profile and update UI
        document.getElementById('user-name').textContent = user.user_metadata.full_name || 'User';
        document.getElementById('user-email').textContent = user.email;

        // Update profile form
        document.getElementById('profile-name').value = user.user_metadata.full_name || '';
        document.getElementById('profile-email').value = user.email;

        // Load bookmarked articles
        loadBookmarkedArticles();

        // Set up profile form
        setupProfileForm();

        // Set up password form
        setupPasswordForm();
    } catch (error) {
        console.error('Error initializing profile page:', error);
    }
}

// Set up tabs
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Set up sign out
function setupSignOut() {
    const signOutLink = document.getElementById('signout-link');

    if (signOutLink) {
        signOutLink.addEventListener('click', async function(e) {
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
    }
}

// This function has been integrated into initProfilePage for better performance

// Load bookmarked articles
async function loadBookmarkedArticles() {
    try {
        const bookmarkedArticles = await getBookmarkedArticles();
        const container = document.getElementById('bookmarked-articles');

        if (!container) return;

        // Clear loading message
        container.innerHTML = '';

        if (bookmarkedArticles.length === 0) {
            container.innerHTML = '<div class="empty-state">You haven\'t bookmarked any articles yet.</div>';
            return;
        }

        // Render each bookmarked article
        bookmarkedArticles.forEach(article => {
            const articleCard = createArticleCard(article);
            container.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error loading bookmarked articles:', error);
    }
}

// Create article card element
function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';

    const content = document.createElement('div');
    content.className = 'article-content';

    const title = document.createElement('h3');
    title.className = 'article-title';

    const titleLink = document.createElement('a');
    titleLink.href = `article.html?id=${article.id}`;
    titleLink.textContent = article.title;
    title.appendChild(titleLink);

    const meta = document.createElement('p');
    meta.className = 'article-meta';
    meta.textContent = `By ${article.author} | ${formatDate(article.created_at)}`;

    const category = document.createElement('span');
    category.className = 'article-category';
    category.textContent = article.category || 'Uncategorized';
    meta.appendChild(document.createTextNode(' | '));
    meta.appendChild(category);

    const excerpt = document.createElement('p');
    excerpt.className = 'article-excerpt';
    excerpt.textContent = article.excerpt;

    // Create a container for the actions
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'article-actions';

    // Create read more link
    const readMore = document.createElement('a');
    readMore.className = 'read-more';
    readMore.href = `article.html?id=${article.id}`;
    readMore.textContent = 'Continue Reading';

    // Create remove bookmark button
    const removeBookmark = document.createElement('button');
    removeBookmark.className = 'remove-bookmark';
    removeBookmark.textContent = 'Remove Bookmark';
    removeBookmark.dataset.id = article.id;
    removeBookmark.addEventListener('click', handleRemoveBookmark);

    // Add elements to container
    actionsContainer.appendChild(readMore);
    actionsContainer.appendChild(removeBookmark);

    // Add all elements to content
    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(excerpt);
    content.appendChild(actionsContainer);

    card.appendChild(content);

    return card;
}

// Handle remove bookmark
async function handleRemoveBookmark(e) {
    const articleId = e.target.dataset.id;

    try {
        const { error } = await removeBookmark(articleId);

        if (error) {
            console.error('Error removing bookmark:', error);
            return;
        }

        // Remove article card from DOM
        const card = e.target.closest('.article-card');
        card.remove();

        // Check if there are any bookmarks left
        const container = document.getElementById('bookmarked-articles');
        if (container.children.length === 0) {
            container.innerHTML = '<div class="empty-state">You haven\'t bookmarked any articles yet.</div>';
        }
    } catch (error) {
        console.error('Error removing bookmark:', error);
    }
}

// Set up profile form
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    const errorElement = document.getElementById('profile-error');

    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('profile-name').value;

            // Clear previous errors
            errorElement.textContent = '';
            errorElement.classList.add('hidden');

            try {
                // Update user profile
                const { data, error } = await supabase.auth.updateUser({
                    data: { full_name: name }
                });

                if (error) {
                    // Show error message
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                    return;
                }

                // Show success message
                errorElement.textContent = 'Profile updated successfully!';
                errorElement.classList.remove('hidden');
                errorElement.style.color = '#2e7d32';

                // Update profile display
                document.getElementById('user-name').textContent = name;

                // Clear success message after delay
                setTimeout(() => {
                    errorElement.classList.add('hidden');
                }, 3000);
            } catch (error) {
                // Show error message
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.classList.remove('hidden');
                console.error('Profile update error:', error);
            }
        });
    }
}

// Set up password form
function setupPasswordForm() {
    const passwordForm = document.getElementById('password-form');
    const errorElement = document.getElementById('password-error');

    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Clear previous errors
            errorElement.textContent = '';
            errorElement.classList.add('hidden');

            // Validate passwords match
            if (newPassword !== confirmPassword) {
                errorElement.textContent = 'New passwords do not match';
                errorElement.classList.remove('hidden');
                return;
            }

            try {
                // Update password
                const { data, error } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (error) {
                    // Show error message
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                    return;
                }

                // Show success message
                errorElement.textContent = 'Password updated successfully!';
                errorElement.classList.remove('hidden');
                errorElement.style.color = '#2e7d32';

                // Reset form
                passwordForm.reset();

                // Clear success message after delay
                setTimeout(() => {
                    errorElement.classList.add('hidden');
                }, 3000);
            } catch (error) {
                // Show error message
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.classList.remove('hidden');
                console.error('Password update error:', error);
            }
        });
    }
}
