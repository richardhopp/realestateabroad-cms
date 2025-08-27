const path = require('path');

module.exports = ({ env }) => {
  // In production, check if PostgreSQL credentials are available
  const hasPostgresCredentials = env('DATABASE_HOST') && env('DATABASE_NAME') && env('DATABASE_USERNAME');
  
  console.log('=== Production Database Configuration ===');
  console.log('PostgreSQL credentials available:', hasPostgresCredentials);
  console.log('DATABASE_HOST:', env('DATABASE_HOST', 'not set'));
  console.log('DATABASE_PORT:', env('DATABASE_PORT', 'not set'));
  console.log('DATABASE_NAME:', env('DATABASE_NAME', 'not set'));
  console.log('=========================================');

  // If PostgreSQL credentials are not available, use SQLite
  if (!hasPostgresCredentials) {
    console.log('⚠️  PostgreSQL not configured, using SQLite instead');
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

  // Use PostgreSQL with proper SSL configuration for Render
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
          rejectUnauthorized: false
        },
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),
        max: env.int('DATABASE_POOL_MAX', 10)
      },
    },
  };
};