# How to Create an Admin User in Supabase

## Step-by-Step Guide

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Visit [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create a New User**
   - Click the "Add user" button (or "Create new user")
   - Fill in the form:
     - **Email**: Enter your admin email (e.g., `admin@example.com`)
     - **Password**: Enter a secure password
     - **Auto Confirm User**: ✅ **Enable this** (so the user can log in immediately)
   - Click "Create user"

4. **Copy the User UUID**
   - After creating the user, you'll see them in the users list
   - Click on the user to view details
   - **Copy the User UID** (it looks like: `12345678-1234-1234-1234-123456789abc`)

5. **Add User to Admin Table**
   - Go to "Table Editor" in the left sidebar
   - Click on the `admin_users` table
   - Click "Insert row" button
   - Fill in:
     - **id**: Paste the User UID you copied
     - **email**: Enter the same email you used (e.g., `admin@example.com`)
     - **role**: Select `admin` or `super_admin`
   - Click "Save"

### Method 2: Using SQL (Alternative)

If you prefer using SQL:

1. **Create the user first** (using Method 1, steps 1-4)
2. **Go to SQL Editor** in Supabase
3. **Run this SQL** (replace with your actual values):

```sql
-- Replace 'USER-UUID-HERE' with the actual UUID from auth.users
-- Replace 'admin@example.com' with your admin email
INSERT INTO admin_users (id, email, role)
VALUES ('USER-UUID-HERE', 'admin@example.com', 'admin');
```

### Method 3: Find Existing User UUID

If you already have a user and want to make them admin:

1. Go to **Authentication > Users**
2. Find your user in the list
3. Click on the user to see their details
4. Copy the **User UID**
5. Add them to `admin_users` table using Method 1 (step 5) or Method 2

## Verify Your Admin User

1. Start your Next.js app: `npm run dev`
2. Navigate to: `http://localhost:3000/login`
3. Log in with the email and password you created
4. You should be redirected to the admin dashboard

## Troubleshooting

### "Access denied" error
- Make sure the user exists in the `admin_users` table
- Verify the UUID in `admin_users.id` matches the UUID in `auth.users.id`
- Check that the email matches

### Can't log in
- Make sure "Auto Confirm User" was enabled when creating the user
- Or manually confirm the user in Authentication > Users > (click user) > Confirm user

### User not found in admin_users
- Double-check you added the user to the `admin_users` table
- Verify the UUID is correct (it must match exactly)

## Quick SQL Check

To see all admin users:

```sql
SELECT * FROM admin_users;
```

To see all auth users:

```sql
SELECT id, email, created_at FROM auth.users;
```

