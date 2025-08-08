// Test database connection
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    return;
  }

  console.log('🔍 Testing database connection...');
  
  const isSQLite = databaseUrl.startsWith('file:');
  
  if (isSQLite) {
    console.log('Database Type: SQLite');
    console.log('Database File:', databaseUrl.replace('file:', ''));
  } else {
    console.log('Database URL:', databaseUrl.replace(/:([^:@]+)@/, ':****@')); // Hide password
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    const buyerCount = await prisma.buyer.count();
    const alertCount = await prisma.alert.count();
    
    console.log('✅ Database tables found:');
    console.log(`  - Users: ${userCount} records`);
    console.log(`  - Clients: ${clientCount} records`);
    console.log(`  - Buyers: ${buyerCount} records`);
    console.log(`  - Alerts: ${alertCount} records`);
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 This means the password is incorrect.');
      console.log('   Check your DATABASE_URL in the .env file.');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error);