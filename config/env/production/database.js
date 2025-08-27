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
  const dbConfig = {
    connection: {
      client: 'postgres',
      connection: {
        // Use internal connection string for better reliability on Render
        connectionString: `postgresql://${env('DATABASE_USERNAME')}:${env('DATABASE_PASSWORD')}@${env('DATABASE_HOST')}:${env('DATABASE_PORT')}/${env('DATABASE_NAME')}`,
        ssl: env.bool('DATABASE_SSL', false) ? {
          rejectUnauthorized: false,
        } : false,
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