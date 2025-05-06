# Lamp Times Admin Setup Guide

This guide explains how to set up and manage the admin functionality for the Lamp Times website.

## Database Setup

The Lamp Timess website uses Supabase for authentication and database storage. To properly set up the admin functionality, you need to configure the database with the correct tables, views, and security policies.

### Using the SQL Setup File

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-setup.sql` file
4. Paste it into the SQL Editor and run the queries

This will create:
- The necessary tables (articles, bookmarks)
- A view to identify admin users
- Row Level Security (RLS) policies to control access
- Helper functions for admin management

## How Admin Authentication Works

The admin system uses a two-step authentication process:

1. **User Authentication**: Users must first sign up and log in through the regular authentication system.
2. **Admin Elevation**: After logging in, users can access the admin page and enter the admin password to gain admin privileges.

When a user enters the correct admin password, their user account is updated with an admin role in the user metadata. This role is then used to enforce access control throughout the application.

## Admin Password

The admin password is defined in the `js/admin.js` file:

```javascript
const ADMIN_PASSWORD = 'admin123';
```

For security reasons, you should change this password to something more secure in a production environment.

## Making a User an Admin

There are two ways to make a user an admin:

### Method 1: Through the Admin Interface

1. The user signs up for a regular account
2. The user navigates to the admin page (admin.html)
3. The user enters the admin password
4. The system automatically updates their account with admin privileges

### Method 2: Through the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the Authentication > Users section
3. Find the user you want to make an admin
4. Click on the user to view their details
5. Under "User Metadata", add or update the JSON to include `"role": "admin"`
6. Save the changes

Example user metadata JSON:
```json
{
  "full_name": "User's Name",
  "role": "admin"
}
```

## Row Level Security (RLS) Policies

The database is configured with Row Level Security policies to ensure that:

1. Anyone can read articles
2. Only admin users can create, update, or delete articles
3. Users can only manage their own bookmarks

These policies are enforced at the database level, providing a strong security foundation.

## Checking Admin Status in Code

The application includes helper functions to check if a user is an admin:

```javascript
// Check if the current user is an admin
const adminStatus = await isAdmin();

if (adminStatus) {
    // User is an admin, allow admin actions
} else {
    // User is not an admin, restrict access
}
```

## Troubleshooting

If you encounter issues with admin access:

1. **Check User Metadata**: Verify that the user has the correct role in their metadata
2. **Check RLS Policies**: Ensure the RLS policies are correctly applied in Supabase
3. **Clear Browser Cache**: Sometimes cached authentication data can cause issues
4. **Check Console Errors**: Look for any JavaScript errors in the browser console

## Security Considerations

- The admin password should be stored securely, ideally on the server side
- Consider implementing additional security measures like IP restrictions or two-factor authentication
- Regularly audit admin actions to detect any unauthorized access
- Consider implementing a more sophisticated role-based access control system for larger applications
