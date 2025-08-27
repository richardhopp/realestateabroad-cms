const path = require('path');

module.exports = ({ env }) => {
  console.log('=== Production Database Configuration ===');
  console.log('DATABASE_CLIENT:', env('DATABASE_CLIENT', 'not set'));
  console.log('DATABASE_HOST:', env('DATABASE_HOST', 'not set'));
  console.log('DATABASE_PORT:', env('DATABASE_PORT', 'not set'));
  console.log('DATABASE_NAME:', env('DATABASE_NAME', 'not set'));
  console.log('DATABASE_USERNAME:', env('DATABASE_USERNAME', 'not set'));
  console.log('DATABASE_PASSWORD:', env('DATABASE_PASSWORD', 'not set') ? '***hidden***' : 'not set');
  
  // Check if we're forcing a specific client
  const clientOverride = env('DATABASE_CLIENT_OVERRIDE', '');
  const usePostgres = env('DATABASE_CLIENT', 'postgres') === 'postgres' && !clientOverride;
  
  console.log('Use PostgreSQL:', usePostgres);
  console.log('Client Override:', clientOverride || 'none');
  console.log('=========================================');

  if (usePostgres && !clientOverride) {
    // PostgreSQL configuration for Render
    return {
      connection: {
        client: 'postgres',
        connection: {
          host: env('DATABASE_HOST'),
          port: env.int('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME'),
          user: env('DATABASE_USERNAME'),
          password: env('DATABASE_PASSWORD'),
          ssl: {
            rejectUnauthorized: false,
            require: true
          },
        },
        pool: {
          min: 0, // Start with 0 to avoid immediate connection failure
          max: 10,
          createTimeoutMillis: 60000,
          acquireTimeoutMillis: 60000,
          idleTimeoutMillis: 30000,
          reapIntervalMillis: 1000,
          createRetryIntervalMillis: 200,
          propagateCreateError: false // Don't fail immediately if can't connect
        },
        debug: false,
        acquireConnectionTimeout: 60000,
      },
    };
  } else {
    // SQLite fallback
    console.log('⚠️  Using SQLite database (PostgreSQL override or not configured)');
    return {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(__dirname, '..', '..', '..', '.tmp/data.db'),
        },
        useNullAsDefault: true,
      },
    };
  }
};