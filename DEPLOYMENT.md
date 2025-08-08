# Deployment Guide

## Netlify Deployment

### Required Environment Variables

To deploy this application on Netlify, you need to set the following environment variables in your Netlify dashboard:

1. **DATABASE_URL** (Required for runtime)
   - PostgreSQL: `postgresql://username:password@host:5432/database`
   - Example providers:
     - [Neon](https://neon.tech) - Free tier available
     - [Supabase](https://supabase.com) - Free tier available (PostgreSQL only, no Supabase features used)
     - [Railway](https://railway.app) - Simple PostgreSQL hosting
     - [Render](https://render.com) - Free PostgreSQL database

2. **JWT_SECRET** (Required)
   - A secure random string for JWT token signing
   - Generate one: `openssl rand -base64 32`

### Step-by-Step Netlify Setup

1. **Create a PostgreSQL Database**
   - Sign up for a free PostgreSQL database from one of the providers above
   - Get your connection string

2. **Configure Netlify Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL=your_postgresql_connection_string
     JWT_SECRET=your_secure_secret_key
     ```

3. **Deploy**
   - Connect your GitHub repository to Netlify
   - The build will automatically run with the correct configuration

### Database Setup

After setting the DATABASE_URL, you need to initialize your database schema:

1. **Option 1: Use Prisma Migrate (Recommended)**
   ```bash
   npx prisma migrate deploy
   ```

2. **Option 2: Push Schema Directly**
   ```bash
   npx prisma db push
   ```

### Build Configuration

The application automatically handles missing DATABASE_URL during build time by using a placeholder. The actual database connection is only required at runtime.

### Troubleshooting

**Build fails with "DATABASE_URL not set"**
- The build script now handles this automatically
- Ensure you're using the latest version from the repository

**Runtime errors about database connection**
- Verify DATABASE_URL is set correctly in Netlify environment variables
- Check that your database is accessible from Netlify's servers
- Ensure your database allows connections from Netlify IPs

**"Invalid prisma client" errors**
- Clear Netlify build cache and redeploy
- Ensure postinstall script runs properly

## Local Development

For local development with SQLite:

1. Copy `.env.example` to `.env`
2. Update `prisma/schema.prisma` to use SQLite:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Set in `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Production Database Providers

### Recommended Free Options:

1. **Neon** (https://neon.tech)
   - Free tier: 0.5 GB storage
   - Automatic backups
   - Connection pooling included

2. **Supabase** (https://supabase.com)
   - Free tier: 500 MB database
   - Note: Only using PostgreSQL, not Supabase features

3. **Railway** (https://railway.app)
   - $5 free credit monthly
   - Simple setup

4. **Render** (https://render.com)
   - Free PostgreSQL instance
   - 90-day expiration (can be renewed)