const path = require('path');

module.exports = ({ env }) => {
  console.log('=== Production Database Configuration ===');
  console.log('DATABASE_CLIENT:', env('DATABASE_CLIENT', 'not set'));
  console.log('DATABASE_HOST:', env('DATABASE_HOST', 'not set'));
  console.log('DATABASE_PORT:', env('DATABASE_PORT', 'not set'));
  console.log('DATABASE_NAME:', env('DATABASE_NAME', 'not set'));
  console.log('DATABASE_USERNAME:', env('DATABASE_USERNAME', 'not set'));
  console.log('DATABASE_PASSWORD:', env('DATABASE_PASSWORD', 'not set') ? '***hidden***' : 'not set');
  console.log('DATABASE_SSL:', env('DATABASE_SSL', 'not set'));
  console.log('=========================================');

  // PostgreSQL configuration optimized for Render internal network
  // Force internal hostname to avoid external connection issues
  const internalHost = 'dpg-d2jhc3be5dus739462a0-a';
  const dbUser = 'realestateabroad_user';
  const dbPassword = '1hLK0jhaD62gKvLpjc3YzUSLUTpf2rLy';
  const dbName = 'realestateabroad_cms';
  const dbPort = 5432;
  
  console.log(`🔗 Using internal host: ${internalHost}:${dbPort}/${dbName}`);
  
  const dbConfig = {
    connection: {
      client: 'postgres',
      connection: {
        host: internalHost,
        port: dbPort,
        database: dbName,
        user: dbUser,
        password: dbPassword,
        ssl: {
          rejectUnauthorized: false,
        },
      },
      pool: {
        min: 0, // Start with 0 to avoid immediate failures
        max: 3,  // Very conservative max for free tier
        createTimeoutMillis: 120000,  // 2 minutes - give database time to wake up
        acquireTimeoutMillis: 120000, // 2 minutes
        idleTimeoutMillis: 30000,     // 30 seconds
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 5000, // 5 second retry interval
        propagateCreateError: false,
        afterCreate: function (conn, done) {
          // Test the connection
          conn.query('SELECT 1', function (err) {
            if (err) {
              console.log('❌ Database connection test failed:', err.message);
            } else {
              console.log('✅ Database connection test successful');
            }
            done(err, conn);
          });
        }
      },
      acquireConnectionTimeout: 120000, // 2 minutes
      debug: false
    },
  };
  
  console.log('🔗 Attempting PostgreSQL connection...');
  return dbConfig;
};