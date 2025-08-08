#!/usr/bin/env node

// This script ensures DATABASE_URL is set for Prisma during build
// If not set, it uses a dummy URL that won't be used at runtime

const { execSync } = require('child_process');

// Set a dummy DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not set, using placeholder for build process');
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db?schema=public';
}

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build Next.js
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}