# FORCE STRAPI v4.15.5 DEPLOYMENT

This deployment MUST use:
- **Strapi v4.15.5** (NOT v5.x)
- **Node.js v20.19.4** (NOT v22.x)
- PostgreSQL database dpg-d2jhc3be5dus739462a0-a

## Verification:
After deployment, check admin panel shows:
- Strapi version v4.15.5
- Node version v20.19.4

## Package.json verification:
```json
"@strapi/strapi": "4.15.5",
"@strapi/plugin-cloud": "4.15.5",
"@strapi/plugin-i18n": "4.15.5", 
"@strapi/plugin-users-permissions": "4.15.5"
```

## Node version files:
- .nvmrc: 20.19.4
- render.yaml NODE_VERSION: 20.19.4
- package.json engines: "node": ">=18.0.0 <=20.x.x"

**Deployment timestamp: 2025-08-27 14:35:00**
**Commit hash: FORCE_V4_DEPLOYMENT**