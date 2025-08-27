#!/usr/bin/env node

/**
 * Wake up PostgreSQL database before starting Strapi
 * This helps with free tier databases that go to sleep
 */

const { Client } = require('pg');

async function wakeDatabase() {
  const config = {
    host: process.env.DATABASE_HOST || 'dpg-d2jhc3be5dus739462a0-a',
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME || 'realestateabroad_cms',
    user: process.env.DATABASE_USERNAME || 'realestateabroad_user',
    password: process.env.DATABASE_PASSWORD || '1hLK0jhaD62gKvLpjc3YzUSLUTpf2rLy',
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 60000,
  };

  console.log('🔍 Attempting to wake database service...');
  console.log(`📡 Connecting to: ${config.host}:${config.port}/${config.database}`);

  const maxRetries = 5;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = new Client(config);
    
    try {
      console.log(`📞 Connection attempt ${attempt}/${maxRetries}...`);
      await client.connect();
      
      console.log('✅ Database connection established!');
      
      // Test query to ensure database is responsive
      const result = await client.query('SELECT version(), current_database(), current_user');
      console.log('📊 Database info:');
      console.log(`   Version: ${result.rows[0].version.split(' ')[1]}`);
      console.log(`   Database: ${result.rows[0].current_database}`);
      console.log(`   User: ${result.rows[0].current_user}`);
      
      await client.end();
      console.log('🚀 Database is ready! Starting Strapi...\n');
      return true;
      
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
      
      try {
        await client.end();
      } catch (endError) {
        // Ignore cleanup errors
      }
      
      if (attempt < maxRetries) {
        const delay = attempt * 10000; // Exponential backoff: 10s, 20s, 30s, etc.
        console.log(`⏱️  Waiting ${delay/1000} seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log('⚠️  Could not wake database after all attempts');
  console.log('🔄 Strapi will try with its own connection pool...\n');
  return false;
}

// Only run if called directly
if (require.main === module) {
  wakeDatabase().catch(console.error);
}

module.exports = wakeDatabase;