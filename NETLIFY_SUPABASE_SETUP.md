# Connecting Netlify to Supabase Database

## Step 1: Get Your Supabase Connection Strings

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **Database**
4. You'll see two connection strings:

### For Netlify (Serverless), you need TWO connection strings:

#### 1. Transaction Pooler (for DATABASE_URL)
- Under "Connection string" section, select **Transaction** mode
- Copy the connection string that looks like:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```
- **IMPORTANT**: Add `?pgbouncer=true&connection_limit=1` to the end:
  ```
  postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```

#### 2. Direct Connection (for DIRECT_URL - migrations only)
- Under "Connection string" section, select **Direct connection**
- Copy the connection string that looks like:
  ```
  postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
  ```

## Step 2: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site configuration** → **Environment variables**
4. Add these variables:

```
DATABASE_URL = [Your Transaction Pooler URL with ?pgbouncer=true&connection_limit=1]
DIRECT_URL = [Your Direct Connection URL]
JWT_SECRET = [Any random string - you can generate one]
NEXT_PUBLIC_SUPABASE_URL = https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase anon key from API settings]
```

### Example DATABASE_URL format:
```
postgresql://postgres.hcgjyajlienvmxgbtvff:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Step 3: Initialize Your Database

### Option A: Using Prisma Migrate (Recommended)

1. On your local machine, create a `.env` file with:
   ```
   DATABASE_URL="[Your Direct Connection URL]"
   DIRECT_URL="[Your Direct Connection URL]"
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Using Supabase SQL Editor

1. Go to Supabase dashboard → SQL Editor
2. Run the schema SQL (already in your supabase-schema.sql file)

## Step 4: Verify Connection

After deploying to Netlify:

1. Check `/api/health` endpoint
   - Should show `"database": {"connected": true}`

2. If there are issues, check the error message in the health response

## Common Issues and Solutions

### Issue: "Can't reach database server"
**Solution**: Make sure you're using the Pooler URL (port 6543) for DATABASE_URL, not the direct connection

### Issue: "prepared statement already exists"
**Solution**: Add `?pgbouncer=true&connection_limit=1` to your DATABASE_URL

### Issue: "SSL required"
**Solution**: Add `?sslmode=require` to your connection string (though Supabase usually handles this)

### Issue: "Password authentication failed"
**Solution**: 
1. Check that you've copied the password correctly
2. If your password has special characters, make sure they're URL-encoded
3. Reset your database password in Supabase if needed

## Testing Locally

To test with Supabase locally:

1. Create `.env.local`:
   ```
   DATABASE_URL="[Transaction Pooler URL]"
   DIRECT_URL="[Direct Connection URL]"
   JWT_SECRET="your-secret-key"
   NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
   ```

2. Run:
   ```bash
   npm run dev
   ```

## Security Notes

- Never commit `.env` files to git
- Use different JWT_SECRET values for development and production
- The anon key is safe to expose (it's meant to be public)
- Keep your service role key secret (don't use it in frontend code)