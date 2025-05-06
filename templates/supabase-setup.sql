-- Lamp Timess Supabase Database Setup
-- This file contains SQL commands to set up the database structure and security policies

-- Create tables
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    article_id INTEGER REFERENCES articles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

-- Create a view to identify admin users
CREATE OR REPLACE VIEW admin_users AS
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for articles table
-- 1. Anyone can read articles
CREATE POLICY "Anyone can read articles" 
ON articles FOR SELECT 
USING (true);

-- 2. Only admins can insert articles
CREATE POLICY "Only admins can insert articles" 
ON articles FOR INSERT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid()
    )
);

-- 3. Only admins can update articles
CREATE POLICY "Only admins can update articles" 
ON articles FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid()
    )
);

-- 4. Only admins can delete articles
CREATE POLICY "Only admins can delete articles" 
ON articles FOR DELETE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid()
    )
);

-- Create policies for bookmarks table
-- 1. Users can read their own bookmarks
CREATE POLICY "Users can read their own bookmarks" 
ON bookmarks FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- 2. Users can create their own bookmarks
CREATE POLICY "Users can create their own bookmarks" 
ON bookmarks FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" 
ON bookmarks FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Create functions
-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set a user as admin (to be called from server-side only)
CREATE OR REPLACE FUNCTION set_user_as_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = 
        CASE 
            WHEN raw_user_meta_data IS NULL THEN '{"role": "admin"}'::jsonb
            ELSE raw_user_meta_data || '{"role": "admin"}'::jsonb
        END
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove admin role from a user (to be called from server-side only)
CREATE OR REPLACE FUNCTION remove_admin_role(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data - 'role'
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS articles_user_id_idx ON articles(user_id);
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_article_id_idx ON bookmarks(article_id);
