# Lamp Times - Minimalist News Website

Lamp Times is a clean, minimalist news website with a newspaper-style design. It features a responsive layout, category-based navigation, article pages, user authentication, and article bookmarking functionality. The frontend is built with vanilla HTML, CSS, and JavaScript, while the backend uses Supabase for data storage and authentication.

## Project Structure

The project follows a modular structure with separate files for different concerns:

```
newspaper/
├── css/
│   ├── main.css         # Core styles and CSS reset
│   ├── layout.css       # Layout styles
│   ├── typography.css   # Typography styles
│   ├── components.css   # Reusable component styles
│   └── admin.css        # Admin interface styles
├── js/
│   ├── main.js          # Core JavaScript functionality
│   ├── articles.js      # Article-related functionality
│   ├── utils.js         # Utility functions
│   ├── category.js      # Category page functionality
│   ├── admin.js         # Admin functionality
│   ├── auth.js          # Authentication functionality
│   ├── profile.js       # User profile functionality
│   ├── bookmarks.js     # Bookmarking functionality
│   └── supabase-config.js # Supabase configuration and API functions
├── data/
│   └── articles.js      # Mock article data
├── index.html           # Homepage
├── article.html         # Article page template
├── category.html        # Category page template
├── admin.html           # Admin interface
├── auth.html            # Authentication page (sign in/sign up)
├── profile.html         # User profile page
└── README.md            # Project documentation
```

## File Descriptions

### HTML Files

- **index.html**: The homepage featuring a featured article, latest news, most read articles, and opinion pieces.
- **article.html**: Template for displaying full articles with related content and bookmarking functionality.
- **category.html**: Template for displaying articles filtered by category.
- **admin.html**: Admin interface for managing articles (adding and deleting).
- **auth.html**: Authentication page with sign in and sign up forms.
- **profile.html**: User profile page showing bookmarked articles and account settings.

### CSS Files

- **main.css**: Contains CSS reset, color variables, typography variables, and base styles.
- **layout.css**: Defines the layout structure including header, footer, article grids, and responsive breakpoints.
- **typography.css**: Contains all typography-related styles including headings, paragraphs, and article text.
- **components.css**: Defines reusable components like article cards, buttons, and tags.
- **admin.css**: Styles for the admin interface including forms, tables, and notifications.

### JavaScript Files

- **main.js**: Core functionality including date updates.
- **articles.js**: Functions for rendering articles in different formats and layouts.
- **utils.js**: Utility functions for URL parameter parsing, date formatting, and DOM manipulation.
- **category.js**: Handles category page functionality including filtering articles by category.
- **admin.js**: Handles admin functionality including article management.
- **auth.js**: Handles user authentication (sign up, sign in).
- **profile.js**: Manages user profile functionality and bookmarked articles display.
- **bookmarks.js**: Handles article bookmarking functionality.
- **supabase-config.js**: Contains Supabase configuration and API functions for database operations.
- **data/articles.js**: Contains fallback article data used when Supabase is not available.

## Design Features

- **Color Scheme**: Uses a warm, off-white background (#FFF8F0) with dark red accents (#700000).
- **Typography**: Newspaper-style fonts with Playfair Display for headings and Libre Baskerville for body text.
- **Responsive Design**: Adapts to different screen sizes with appropriate breakpoints.
- **Hover Effects**: Subtle underline and color changes on interactive elements.

## Supabase Integration

Lamp Timess uses Supabase for backend functionality:

### Database Tables

1. **articles** - Stores all article content
   - id: auto-incrementing primary key
   - title: article title
   - author: article author
   - category: article category
   - excerpt: short summary
   - content: array of paragraphs
   - created_at: timestamp

2. **bookmarks** - Stores user bookmarks
   - id: auto-incrementing primary key
   - user_id: foreign key to auth.users
   - article_id: foreign key to articles
   - created_at: timestamp

### Authentication

- User sign up and sign in via email/password
- User profiles with customizable display names
- Role-based access control for admin features

## How to Add New Content

### Using the Admin Interface

The easiest way to manage content is through the admin interface:

1. Navigate to `/admin.html`
2. Sign in with your user account
3. Enter the admin password: `admin123`
4. Use the "Add Article" tab to create new articles
5. Use the "Manage Articles" tab to delete existing articles

### Manual Method: Adding New Articles

For direct database access, you can add articles to the Supabase `articles` table.

```javascript
{
    title: "Article Title",
    author: "Author Name",
    category: "Category Name", // Politics, Business, Technology, Arts, Opinion, etc.
    excerpt: "Brief summary of the article...",
    content: [
        "First paragraph...",
        "Second paragraph...",
        // Add as many paragraphs as needed
    ]
}
```

Make sure to:
- Use an existing category name for proper categorization
- Split the content into paragraphs in the array
- The ID and created_at timestamp will be automatically generated by Supabase

### Adding New Categories

To add a new category:

1. Add articles with the new category name in `data/articles.js`
2. Update the navigation menu in all HTML files:

```html
<nav class="main-nav">
    <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="category.html?category=Politics">Politics</a></li>
        <!-- Add your new category here -->
        <li><a href="category.html?category=NewCategory">New Category</a></li>
    </ul>
</nav>
```

### Adding New Pages

To add a new page type:

1. Create a new HTML file based on the existing templates
2. Link to necessary CSS and JavaScript files
3. Add new JavaScript functionality in a separate file if needed
4. Update navigation as needed

## Customization Guide

### Changing Colors

Edit the color variables in `css/main.css`:

```css
:root {
    /* Color Variables */
    --color-background: #FFF8F0; /* Background color */
    --color-text: #1a1a1a; /* Main text color */
    --color-text-light: #444444; /* Secondary text color */
    --color-accent: #700000; /* Accent color for headings and links */
    --color-border: #d8cdb9; /* Border color */
    --color-link: #700000; /* Link color */
    --color-link-hover: #500000; /* Link hover color */
    --color-header: #FFF8F0; /* Header background color */
    --color-footer: #f5eee0; /* Footer background color */
}
```

### Changing Fonts

Edit the font variables in `css/main.css`:

```css
:root {
    /* Typography Variables */
    --font-heading: 'Playfair Display', 'Times New Roman', serif;
    --font-body: 'Libre Baskerville', 'Georgia', serif;
    --font-size-base: 16px;
    --line-height-base: 1.5;
}
```

Also update the Google Fonts link in the HTML files if changing to different fonts.

## Best Practices

- Keep the modular structure when adding new features
- Maintain the minimalist design aesthetic
- Test on multiple screen sizes when making layout changes
- Use the existing CSS variables for consistent styling
- Follow the established naming conventions for classes

## User Features

### Authentication
- Sign up with email and password
- Sign in to access personalized features
- Update profile information
- Change password

### Bookmarking
- Bookmark articles for later reading
- View all bookmarked articles in user profile
- Remove bookmarks when no longer needed

### Admin Features
- Add new articles to the site
- Delete existing articles
- Admin-only access with password protection

## Future Enhancements

Some ideas for future improvements:

- Add a search functionality
- Implement a dark mode option
- Create a contact page
- Add social media sharing buttons
- Implement a newsletter signup form
- Add pagination for category pages with many articles
- Enhance the admin interface:
  - Add article editing functionality
  - Add image upload capability
  - Add analytics dashboard
- Add commenting functionality
- Implement article ratings
- Create a recommendation system based on reading history
