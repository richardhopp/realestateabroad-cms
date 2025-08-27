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

  // PostgreSQL configuration optimized for Render
  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: env.bool('DATABASE_SSL', false) ? {
          rejectUnauthorized: false,
        } : false,
      },
      pool: {
        min: 0, // Start with 0 connections
        max: 5,  // Lower max to avoid overwhelming database
        createTimeoutMillis: 60000,
        acquireTimeoutMillis: 60000,  
        idleTimeoutMillis: 600000, // 10 minutes
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 2000,
        propagateCreateError: false
      },
      acquireConnectionTimeout: 60000,
      debug: process.env.NODE_ENV === 'development'
    },
  };
};