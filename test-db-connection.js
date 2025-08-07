// Test database connection
require('dotenv').config();

const { Client } = require('pg');

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL not found in environment variables');
    return;
  }

  if (databaseUrl.includes('[YOUR_PASSWORD]')) {
    console.log('❌ DATABASE_URL still contains placeholder. Please replace [YOUR_PASSWORD] with actual password.');
    return;
  }

  console.log('🔍 Testing database connection...');
  console.log('Database URL:', databaseUrl.replace(/:([^:@]+)@/, ':****@')); // Hide password

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    statement_timeout: 10000
  });

  try {
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Client', 'Buyer', 'Alert')
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Database tables found:');
      result.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No CRM tables found. You need to run the SQL schema.');
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 This means the password is incorrect.');
      console.log('   Go to Supabase Dashboard > Settings > Database to get the correct connection string.');
    }
    
  } finally {
    await client.end();
  }
}

testConnection().catch(console.error);