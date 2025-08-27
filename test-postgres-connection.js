#!/usr/bin/env node

/**
 * Test PostgreSQL Database Connection for dpg-d2jhc3be5dus739462a0-a
 * This script tests if we can connect to the Render PostgreSQL database
 */

const { Client } = require('pg');

// Render PostgreSQL connection details from dashboard
// Using external connection string for testing from local machine
const connectionConfig = {
  connectionString: 'postgresql://realestateabroad_user:1hLK0jhaD62gKvLpjc3YzUSLUTpf2rLy@dpg-d2jhc3be5dus739462a0-a.oregon-postgres.render.com:5432/realestateabroad_cms?sslmode=require',
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  connectionTimeoutMillis: 30000,
};

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection to dpg-d2jhc3be5dus739462a0-a...\n');
  
  const client = new Client(connectionConfig);
  
  try {
    console.log('📡 Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');
    
    // Test query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('📊 Database Information:');
    console.log(`   Version: ${result.rows[0].version}`);
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);
    
    // Check if Strapi tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
      LIMIT 10
    `);
    
    console.log('\n📋 Existing Tables (first 10):');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   No tables found (database is empty)');
    }
    
    console.log('\n✅ PostgreSQL database dpg-d2jhc3be5dus739462a0-a is WORKING!');
    console.log('   The database is accessible and ready for Strapi.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Database service might be suspended (check Render dashboard)');
    console.error('2. Connection credentials might have changed');
    console.error('3. Network/firewall issues');
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

// Run the test
testConnection();