// Debug: Log environment variables
console.log('=== JWT Configuration Debug ===');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('ADMIN_JWT_SECRET exists:', !!process.env.ADMIN_JWT_SECRET);
console.log('==============================');

module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET') || env('ADMIN_JWT_SECRET') || 'jrBoSBfcl+2AaK8Cn5ilZCcwuaZAtnEKJWx6Z4DTGc8=',
    },
  },
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
});