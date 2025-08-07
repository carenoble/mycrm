# Supabase Database Setup Instructions

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **hcgjyajlienvmxgbtvff**

## Step 2: Get Your Database Connection String

1. In your Supabase dashboard, go to **Settings** > **Database**
2. Scroll down to **Connection string** section
3. Copy the **URI** connection string (it should look like):
   ```
   postgresql://postgres.hcgjyajlienvmxgbtvff:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **+ New query**
3. Copy and paste the entire contents of `supabase-schema.sql` file
4. Click **Run** to execute the SQL

This will create all the necessary tables:
- User
- Client 
- Buyer
- ClientBuyer
- Process
- Alert
- Image
- File

## Step 4: Update Environment Variables

### For Local Development:
Update your `.env` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://hcgjyajlienvmxgbtvff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZ2p5YWpsaWVudm14Z2J0dmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjQwNjcsImV4cCI6MjA3MDE0MDA2N30.lcujfofxwRTvHBbxkAcQfSnuULCYhbcYvkmf_RNMHgo
DATABASE_URL="postgresql://postgres.hcgjyajlienvmxgbtvff:YOUR_ACTUAL_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-secure-secret-key"
NODE_ENV="development"
```

### For Netlify Deployment:
In your Netlify dashboard > Site settings > Environment variables, add:
```
NEXT_PUBLIC_SUPABASE_URL=https://hcgjyajlienvmxgbtvff.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZ2p5YWpsaWVudm14Z2J0dmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjQwNjcsImV4cCI6MjA3MDE0MDA2N30.lcujfofxwRTvHBbxkAcQfSnuULCYhbcYvkmf_RNMHgo
DATABASE_URL=postgresql://postgres.hcgjyajlienvmxgbtvff:YOUR_ACTUAL_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
JWT_SECRET=your-secure-random-secret-key
NODE_ENV=production
```

## Step 5: Test the Connection

1. After setting up the database and environment variables
2. Visit your site's health check: `https://your-site.netlify.app/api/health`
3. You should see:
   - `"database": { "connected": true }`
   - `"supabase": { "url": true, "key": true }`

## Step 6: Create Your First User Account

1. Go to your deployed site
2. Click "Create Account" on the home page
3. Register with your email and password
4. You should be able to login and access the dashboard

## Troubleshooting

If you're still getting errors:

1. **Check your database password**: Make sure you're using the correct password
2. **Verify the connection string**: The format should match exactly
3. **Check Supabase dashboard**: Make sure the database is running
4. **Review logs**: Check Netlify function logs for specific error messages

## Test User Account

A test user has been created:
- **Email**: test@example.com
- **Password**: password123

You can use this to test the system immediately after setup.