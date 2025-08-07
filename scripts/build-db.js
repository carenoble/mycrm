const { PrismaClient } = require('@prisma/client');

async function initializeDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // This will create the database tables if they don't exist
    await prisma.$connect();
    console.log('Database initialized successfully');
  } catch (error) {
    console.log('Database initialization skipped (normal for serverless):', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run this during build if we have a database URL that supports it
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('file:')) {
  initializeDatabase().catch(console.error);
} else {
  console.log('Skipping database initialization (file database or development mode)');
}