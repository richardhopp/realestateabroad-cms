# CACHE BUSTER DEPLOYMENT - FORCE COMPLETE REBUILD

## DEPLOYMENT TIMESTAMP: 2025-08-27 14:45:00

This deployment forces a complete cache-busting rebuild with:

### 🔧 REQUIRED VERSIONS:
- **Strapi: v4.15.5** (NOT v5.x)  
- **Node.js: v20.19.4** (NOT v22.x)

### 🚀 CACHE BUSTING MEASURES:
- ✅ Deleted package-lock.json  
- ✅ Added aggressive build command with cache clearing
- ✅ Added NODE_VERSION environment variable
- ✅ Added NPM_CONFIG_ENGINE_STRICT=true
- ✅ Added postinstall version verification
- ✅ Updated .nvmrc file

### 📦 BUILD COMMAND:
```bash
rm -rf node_modules package-lock.json && npm cache clean --force && npm install && npm run build
```

### 🔍 VERSION VERIFICATION:
The postinstall script will output:
- Node.js version (should be v20.19.4)
- npm version  
- @strapi/strapi version (should be 4.15.5)

### 🎯 DEPLOYMENT GOAL:
Admin panel should show:
- Strapi version v4.15.5 
- Node version v20.19.4
- Community Edition

**IF THIS STILL DEPLOYS v5.23.0, THERE IS A RENDER DASHBOARD CONFIGURATION ISSUE**

Commit: CACHE_BUSTER_REBUILD_STRAPI_V4