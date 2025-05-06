/**
 * supabase-config.js - Supabase configuration
 * Lamp Times Newspaper Website
 */

// Supabase configuration
const SUPABASE_URL = 'https://keuxuonslkcvdeysdoge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldXh1b25zbGtjdmRleXNkb2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjc5MjUsImV4cCI6MjA2MDg0MzkyNX0.C1Bkoo9A3BlbfkHlUj7UdCmOPonMFftEFTOTHVQWIl4';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if user is already authenticated
async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Check if user is an admin
async function isAdmin() {
    const user = await checkUser();
    return user && user.user_metadata && user.user_metadata.role === 'admin';
}

// Sign up a new user
async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: fullName
            }
        }
    });

    return { data, error };
}

// Sign in an existing user
async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    return { data, error };
}

// Sign out the current user
async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Get user profile
async function getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    return user;
}

// Set user as admin
async function setUserAsAdmin() {
    const { data, error } = await supabase.auth.updateUser({
        data: { role: 'admin' }
    });

    return { data, error };
}

// Remove admin role from user
async function removeAdminRole() {
    const { data, error } = await supabase.auth.updateUser({
        data: { role: null }
    });

    return { data, error };
}

// Get all articles from Supabase
async function getArticles() {
    // Use a more efficient query with a limit
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30); // Limit to 30 most recent articles for better performance

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }

    return data || [];
}

// Get articles by category
async function getArticlesByCategory(category) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to 20 most recent articles for better performance

    if (error) {
        console.error('Error fetching articles by category:', error);
        return [];
    }

    return data || [];
}

// Get article by ID
async function getArticleById(id) {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching article by ID:', error);
        return null;
    }

    return data;
}

// Add a new article
async function addArticle(article) {
    const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select();

    return { data, error };
}

// Add multiple articles (batch insert)
async function addMultipleArticles(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
        return { error: { message: 'No valid articles to insert' } };
    }

    // Supabase has a limit on batch inserts, so we'll process in chunks if needed
    const CHUNK_SIZE = 50; // Adjust based on Supabase limits
    const results = {
        successful: [],
        failed: []
    };

    // Process articles in chunks
    for (let i = 0; i < articles.length; i += CHUNK_SIZE) {
        const chunk = articles.slice(i, i + CHUNK_SIZE);

        try {
            const { data, error } = await supabase
                .from('articles')
                .insert(chunk)
                .select();

            if (error) {
                // If batch insert fails, try individual inserts
                for (const article of chunk) {
                    const { data: singleData, error: singleError } = await addArticle(article);

                    if (singleError) {
                        results.failed.push({ article, error: singleError.message });
                    } else if (singleData) {
                        results.successful.push(singleData[0]);
                    }
                }
            } else if (data) {
                results.successful.push(...data);
            }
        } catch (error) {
            // If an unexpected error occurs, try individual inserts
            for (const article of chunk) {
                try {
                    const { data, error } = await addArticle(article);

                    if (error) {
                        results.failed.push({ article, error: error.message });
                    } else if (data) {
                        results.successful.push(data[0]);
                    }
                } catch (e) {
                    results.failed.push({ article, error: 'Unknown error occurred' });
                }
            }
        }
    }

    return results;
}

// Update an article
async function updateArticle(id, updates) {
    const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select();

    return { data, error };
}

// Delete an article
async function deleteArticle(id) {
    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

    return { error };
}

// Bookmark an article
async function bookmarkArticle(articleId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: { message: 'User not authenticated' } };

    const { data, error } = await supabase
        .from('bookmarks')
        .insert([
            { user_id: user.id, article_id: articleId }
        ])
        .select();

    return { data, error };
}

// Remove a bookmark
async function removeBookmark(articleId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: { message: 'User not authenticated' } };

    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

    return { error };
}

// Get user's bookmarked articles
async function getBookmarkedArticles() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Use a more efficient query with a limit
    const { data, error } = await supabase
        .from('bookmarks')
        .select('article_id, articles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to 20 most recent bookmarks for better performance

    if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }

    return data.map(bookmark => bookmark.articles) || [];
}

// Check if an article is bookmarked by the current user
async function isArticleBookmarked(articleId) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

    if (error) {
        return false;
    }

    return !!data;
}
