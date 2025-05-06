/**
 * admin.js - Admin functionality
 * Lamp Timess Newspaper Website
 */

// Initialize the admin page
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and is an admin using our function
    const adminStatus = await isAdmin();

    // If user is not an admin, redirect to home page
    if (!adminStatus) {
        const user = await checkUser();

        // Only show alert if user is logged in but not an admin
        if (user) {
            alert('Access denied. Only administrators can access this page.');
        } else {
            alert('Please sign in first at the authentication page.');
        }

        window.location.href = user ? 'index.html' : 'auth.html';
        return;
    }

    initAdminPage();
});

// Admin password (in a real app, this would be server-side)
const ADMIN_PASSWORD = 'admin123';

// Initialize admin page
async function initAdminPage() {
    // Set up login form
    setupLoginForm();

    // Set up tabs
    setupTabs();

    // Set up article form
    setupArticleForm();

    // Set up bulk upload form
    setupBulkUploadForm();

    // Set up article filters
    setupArticleFilters();

    // Check if already logged in
    await checkLoginStatus();
}

// Check if user is logged in
async function checkLoginStatus() {
    // Use the isAdmin function to check admin status
    const adminStatus = await isAdmin();

    // If user is an admin, show the dashboard
    if (adminStatus) {
        showAdminDashboard();
        loadArticles();
    }
}

// Set up login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const password = document.getElementById('password').value;

            if (password === ADMIN_PASSWORD) {
                try {
                    // Check if user is already logged in
                    const user = await checkUser();

                    if (user) {
                        // Update user role to admin using our function
                        const { error: adminError } = await setUserAsAdmin();

                        if (adminError) {
                            console.error('Error setting admin role:', adminError);
                            alert('Error setting admin privileges. Please try again.');
                            return;
                        }
                    } else {
                        // Show error - need to be logged in first
                        alert('Please sign in first at the auth page before accessing admin features.');
                        window.location.href = 'auth.html';
                        return;
                    }

                    // Show admin dashboard
                    showAdminDashboard();

                    // Load articles
                    loadArticles();
                } catch (error) {
                    console.error('Admin login error:', error);
                    alert('An error occurred. Please try again.');
                }
            } else {
                alert('Incorrect password. Please try again.');
            }
        });
    }
}

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
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

// Set up article form
function setupArticleForm() {
    const articleForm = document.getElementById('article-form');

    if (articleForm) {
        articleForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const category = document.getElementById('category').value;
            const excerpt = document.getElementById('excerpt').value;
            const content = document.getElementById('content').value;

            // Get current user
            const user = await checkUser();

            if (!user) {
                showNotification('You must be logged in to add articles', 'error');
                return;
            }

            // Check if user is an admin using our function
            const adminStatus = await isAdmin();
            if (!adminStatus) {
                showNotification('Only administrators can add articles', 'error');
                return;
            }

            // Create new article object
            const newArticle = {
                title: title,
                author: author,
                category: category,
                excerpt: excerpt,
                content: parseContentToParagraphs(content),
                user_id: user.id // Add user_id for RLS policy
            };

            try {
                // Add article to Supabase
                const { data, error } = await addArticle(newArticle);

                if (error) {
                    showNotification('Error adding article: ' + error.message, 'error');
                    return;
                }

                // Reset form
                articleForm.reset();

                // Show success message
                showNotification('Article added successfully!', 'success');

                // Reload articles list
                loadArticles();
            } catch (error) {
                console.error('Error adding article:', error);
                showNotification('An error occurred. Please try again.', 'error');
            }
        });
    }
}

// Set up article filters
function setupArticleFilters() {
    const filterCategory = document.getElementById('filter-category');

    if (filterCategory) {
        filterCategory.addEventListener('change', function() {
            loadArticles(this.value);
        });
    }
}

// Parse content string to paragraphs array
function parseContentToParagraphs(content) {
    // Split by double newlines and filter out empty paragraphs
    return content.split(/\n\s*\n/).filter(paragraph => paragraph.trim() !== '');
}

// Load articles into the table
async function loadArticles(categoryFilter = '') {
    const articlesList = document.getElementById('articles-list');

    if (!articlesList) return;

    // Clear current list
    articlesList.innerHTML = '';

    try {
        // Get articles from Supabase
        let articles;

        if (categoryFilter) {
            articles = await getArticlesByCategory(categoryFilter);
        } else {
            articles = await getArticles();
        }

        // Create table rows
        articles.forEach(article => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${article.id}</td>
                <td>${article.title}</td>
                <td>${article.author}</td>
                <td>${article.category}</td>
                <td>${formatDate(article.created_at)}</td>
                <td>
                    <button class="action-btn delete-btn" data-id="${article.id}">Delete</button>
                </td>
            `;

            articlesList.appendChild(row);
        });

        // Add event listeners to delete buttons
        setupDeleteButtons();
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesList.innerHTML = '<tr><td colspan="6">Error loading articles. Please try again.</td></tr>';
    }
}

// Set up delete buttons
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const id = parseInt(this.getAttribute('data-id'));

            if (confirm('Are you sure you want to delete this article?')) {
                try {
                    // Get current user
                    const user = await checkUser();

                    if (!user) {
                        showNotification('You must be logged in to delete articles', 'error');
                        return;
                    }

                    // Check if user is an admin using our function
                    const adminStatus = await isAdmin();
                    if (!adminStatus) {
                        showNotification('Only administrators can delete articles', 'error');
                        return;
                    }

                    // Delete article from Supabase
                    const { error } = await deleteArticle(id);

                    if (error) {
                        showNotification('Error deleting article: ' + error.message, 'error');
                        return;
                    }

                    // Reload articles list
                    loadArticles(document.getElementById('filter-category').value);

                    // Show success message
                    showNotification('Article deleted successfully!', 'success');
                } catch (error) {
                    console.error('Error deleting article:', error);
                    showNotification('An error occurred. Please try again.', 'error');
                }
            }
        });
    });
}

// Set up bulk upload form
function setupBulkUploadForm() {
    const bulkUploadForm = document.getElementById('bulk-upload-form');

    if (bulkUploadForm) {
        bulkUploadForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get the file input
            const fileInput = document.getElementById('json-file');
            const file = fileInput.files[0];

            if (!file) {
                showNotification('Please select a JSON file to upload', 'error');
                return;
            }

            // Show upload results container
            const uploadResults = document.getElementById('upload-results');
            uploadResults.classList.remove('hidden');

            // Clear previous results
            const uploadSummary = document.querySelector('.upload-summary');
            const uploadDetails = document.querySelector('.upload-details');
            uploadSummary.innerHTML = 'Processing file...';
            uploadDetails.innerHTML = '';

            // Add progress bar
            uploadDetails.innerHTML = '<div class="upload-progress"><div class="progress-bar"></div></div>';
            const progressBar = document.querySelector('.progress-bar');

            try {
                // Read the file
                const articles = await readJSONFile(file);

                if (!Array.isArray(articles)) {
                    uploadSummary.innerHTML = 'Error: Invalid JSON format. File must contain an array of articles.';
                    uploadDetails.innerHTML = '';
                    return;
                }

                // Get current user
                const user = await checkUser();

                if (!user) {
                    uploadSummary.innerHTML = 'Error: You must be logged in to upload articles';
                    uploadDetails.innerHTML = '';
                    return;
                }

                // Check if user is an admin using our function
                const adminStatus = await isAdmin();
                if (!adminStatus) {
                    uploadSummary.innerHTML = 'Error: Only administrators can upload articles';
                    uploadDetails.innerHTML = '';
                    return;
                }

                // Validate articles
                const validArticles = [];
                const invalidArticles = [];

                articles.forEach(article => {
                    if (isValidArticle(article)) {
                        // Add user_id to each article for RLS policy
                        article.user_id = user.id;
                        validArticles.push(article);
                    } else {
                        invalidArticles.push(article);
                    }
                });

                // Update summary
                uploadSummary.innerHTML = `Found ${articles.length} articles: ${validArticles.length} valid, ${invalidArticles.length} invalid`;

                // Process valid articles
                if (validArticles.length > 0) {
                    uploadDetails.innerHTML += '<h4>Uploading articles...</h4>';

                    // Update progress bar - 50% for processing
                    progressBar.style.width = '50%';

                    try {
                        // Use batch upload for better performance
                        const results = await addMultipleArticles(validArticles);

                        const successfulUploads = results.successful;
                        const failedUploads = results.failed;

                        // Complete progress bar
                        progressBar.style.width = '100%';

                        // Show results
                        uploadDetails.innerHTML = '';
                        uploadDetails.innerHTML += `<p><span class="upload-success">✓ ${successfulUploads.length} articles uploaded successfully</span></p>`;

                        if (failedUploads.length > 0) {
                            uploadDetails.innerHTML += `<p><span class="upload-error">✗ ${failedUploads.length} articles failed to upload</span></p>`;

                            // Show failed uploads
                            const failedList = document.createElement('ul');
                            failedUploads.forEach(fail => {
                                const li = document.createElement('li');
                                li.innerHTML = `<strong>${fail.article.title}</strong>: ${fail.error}`;
                                failedList.appendChild(li);
                            });
                            uploadDetails.appendChild(failedList);
                        }

                        // Reload articles list
                        loadArticles();
                    } catch (error) {
                        console.error('Error uploading articles:', error);
                        progressBar.style.width = '100%';
                        uploadDetails.innerHTML = '';
                        uploadDetails.innerHTML += `<p><span class="upload-error">Error uploading articles: ${error.message || 'Unknown error'}</span></p>`;
                    }
                }

                // Show invalid articles
                if (invalidArticles.length > 0) {
                    uploadDetails.innerHTML += '<h4>Invalid Articles:</h4>';

                    const invalidList = document.createElement('ul');
                    invalidArticles.forEach(article => {
                        const li = document.createElement('li');
                        li.textContent = article.title || 'Untitled Article';
                        invalidList.appendChild(li);
                    });
                    uploadDetails.appendChild(invalidList);
                }

                // Reset file input
                fileInput.value = '';

            } catch (error) {
                console.error('Error processing JSON file:', error);
                uploadSummary.innerHTML = 'Error processing file. Please check the JSON format.';
                uploadDetails.innerHTML = error.message;
            }
        });
    }
}

// Read JSON file
function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON format. Please check your file.'));
            }
        };

        reader.onerror = function() {
            reject(new Error('Error reading file.'));
        };

        reader.readAsText(file);
    });
}

// Validate article object
function isValidArticle(article) {
    // Check if article has required fields
    if (!article.title || !article.author || !article.category || !article.excerpt || !article.content) {
        return false;
    }

    // Check if content is an array
    if (!Array.isArray(article.content)) {
        // If content is a string, try to parse it as paragraphs
        if (typeof article.content === 'string') {
            article.content = parseContentToParagraphs(article.content);
        } else {
            return false;
        }
    }

    return true;
}

// Show notification
function showNotification(message, type, parentElement = null) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Find the parent element to insert notification
    if (parentElement) {
        parentElement.insertBefore(notification, parentElement.firstChild);
    } else {
        const form = document.getElementById('article-form');
        if (form) {
            form.parentNode.insertBefore(notification, form);
        }
    }

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
