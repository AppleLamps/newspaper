/**
 * auth.js - Authentication functionality
 * Lamp Timess Newspaper Website
 */

// Initialize the auth page
document.addEventListener('DOMContentLoaded', function() {
    initAuthPage();
});

// Initialize auth page
async function initAuthPage() {
    // Set up tabs
    setupTabs();

    // Set up sign in form
    setupSignInForm();

    // Set up sign up form
    setupSignUpForm();

    // Check if user is already logged in
    const user = await checkUser();
    if (user) {
        // Redirect to profile page if already logged in
        window.location.href = 'profile.html';
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

// Set up sign in form
function setupSignInForm() {
    const signInForm = document.getElementById('signin-form');
    const errorElement = document.getElementById('signin-error');

    if (signInForm) {
        signInForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;

            // Clear previous errors
            errorElement.textContent = '';
            errorElement.classList.add('hidden');

            try {
                // Sign in user
                const { data, error } = await signIn(email, password);

                if (error) {
                    // Show error message
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                    return;
                }

                // Redirect to profile page on success
                window.location.href = 'profile.html';
            } catch (error) {
                // Show error message
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.classList.remove('hidden');
                console.error('Sign in error:', error);
            }
        });
    }
}

// Set up sign up form
function setupSignUpForm() {
    const signUpForm = document.getElementById('signup-form');
    const errorElement = document.getElementById('signup-error');

    if (signUpForm) {
        signUpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;

            // Clear previous errors
            errorElement.textContent = '';
            errorElement.classList.add('hidden');

            // Validate passwords match
            if (password !== confirm) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.classList.remove('hidden');
                return;
            }

            try {
                // Sign up user
                const { data, error } = await signUp(email, password, name);

                if (error) {
                    // Show error message
                    errorElement.textContent = error.message;
                    errorElement.classList.remove('hidden');
                    return;
                }

                // Show success message and switch to sign in tab
                errorElement.textContent = 'Account created successfully! Please check your email to confirm your account.';
                errorElement.classList.remove('hidden');
                errorElement.style.backgroundColor = '#e8f5e9';
                errorElement.style.color = '#2e7d32';
                errorElement.style.borderLeftColor = '#2e7d32';

                // Reset form
                signUpForm.reset();

                // Switch to sign in tab after a delay
                setTimeout(() => {
                    document.querySelector('.tab-btn[data-tab="signin"]').click();
                }, 3000);
            } catch (error) {
                // Show error message
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.classList.remove('hidden');
                console.error('Sign up error:', error);
            }
        });
    }
}
