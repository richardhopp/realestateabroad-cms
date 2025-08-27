module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET') || env('JWT_SECRET') || 'jrBoSBfcl+2AaK8Cn5ilZCcwuaZAtnEKJWx6Z4DTGc8=',
  },
  apiToken: {
    salt: env('API_TOKEN_SALT') || 'dac833f270a6a4cbc3f9af9f442340e9',
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT') || '6841b72c13835a636e8d93f91aa97800',
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
