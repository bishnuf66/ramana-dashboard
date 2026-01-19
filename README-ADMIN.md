# Admin Panel Setup Guide

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Get your project URL and anon key from Project Settings > API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create the necessary tables and policies

### 4. Create Your First Admin User

After running the schema, you need to:

1. **Sign up a user in Supabase Auth:**
   - Go to Authentication > Users in your Supabase dashboard
   - Create a new user manually, or use the sign-up flow
   - Note the user's UUID

2. **Add the user to admin_users table:**
   - Go to Table Editor > admin_users
   - Click "Insert row"
   - Enter:
     - `id`: The UUID of the user you just created
     - `email`: The user's email address
     - `role`: `admin` or `super_admin`

Alternatively, you can use SQL:

```sql
-- Replace 'user-uuid-here' with the actual user UUID from auth.users
-- Replace 'admin@example.com' with the admin email
INSERT INTO admin_users (id, email, role)
VALUES ('user-uuid-here', 'admin@example.com', 'admin');
```

### 5. Access the Admin Panel

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`
3. Log in with the admin credentials you created

## Admin Panel Features

### Product Management
- **View Products**: See all products in a table
- **Add Products**: Create new products (flowers, accessories, fruits)
- **Edit Products**: Update existing product information
- **Delete Products**: Remove products from the database

### Order Management
- **View Orders**: See all customer orders
- **Update Order Status**: Change order status (pending, processing, shipped, delivered, cancelled)
- **View Order Details**: See customer information and order items

## Database Tables

### products
- Stores product information (title, price, images, category, stock, etc.)

### orders
- Stores customer orders with shipping information and items

### admin_users
- Tracks which users have admin privileges

## Security

- Row Level Security (RLS) is enabled on all tables
- Only authenticated admin users can modify products and view orders
- Products are publicly readable (for the frontend)
- Orders can be created by anyone, but only admins can view/update them

## Notes

- The frontend still uses static data (as requested)
- Admin panel uses Supabase for data management
- Image URLs should be full URLs (you can use Supabase Storage or external image hosting)

