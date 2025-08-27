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

  // PostgreSQL configuration using Render environment variables
  // Convert external hostname to internal hostname for better connectivity
  const externalHost = env('DATABASE_HOST');
  const internalHost = externalHost ? externalHost.split('.')[0] : 'dpg-d2jhc3be5dus739462a0-a';
  const dbUser = env('DATABASE_USERNAME');
  const dbPassword = env('DATABASE_PASSWORD');
  const dbName = env('DATABASE_NAME');
  const dbPort = env.int('DATABASE_PORT', 5432);
  
  console.log(`🔗 External host: ${externalHost}`);
  console.log(`🔗 Using internal host: ${internalHost}:${dbPort}/${dbName}`);
  console.log(`👤 User: ${dbUser}`);
  
  const dbConfig = {
    connection: {
      client: 'postgres',
      connection: {
        host: internalHost,  // Use internal hostname
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