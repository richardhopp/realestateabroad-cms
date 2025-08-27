# Deploy Strapi CMS to Render

This Strapi v4.15.5 project is ready for deployment on Render.

## GitHub Repository
🔗 **Repository**: https://github.com/richardhopp/realestateabroad-cms

## Deployment Steps

### 1. Create New Web Service on Render

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"  
3. Connect GitHub account if not already connected
4. Select repository: `richardhopp/realestateabroad-cms`
5. Branch: `master`

### 2. Configure Service Settings

**Basic Settings:**
- **Name**: `realestateabroad-cms`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Starter ($7/month)

### 3. Add PostgreSQL Database

Before deploying, add a PostgreSQL database:

1. In Render dashboard, click "New +" → "PostgreSQL"
2. **Name**: `realestateabroad-db`  
3. **Database Name**: `realestateabroad_cms`
4. **User**: `realestateabroad_cms_user`
5. **Plan**: Starter ($7/month)
6. Click "Create Database"

### 4. Configure Environment Variables

Add these environment variables to the web service:

```bash
NODE_VERSION=20.19.4
HOST=0.0.0.0
PORT=10000
NODE_ENV=production

# Database Configuration (these will auto-populate from PostgreSQL service)
DATABASE_CLIENT=postgres
DATABASE_HOST=<from PostgreSQL service>
DATABASE_PORT=<from PostgreSQL service>  
DATABASE_NAME=<from PostgreSQL service>
DATABASE_USERNAME=<from PostgreSQL service>
DATABASE_PASSWORD=<from PostgreSQL service>
DATABASE_SSL=true

# Auto-generated Strapi Keys (click "Generate" for each)
APP_KEYS=<click Generate>
API_TOKEN_SALT=<click Generate>
ADMIN_JWT_SECRET=<click Generate>
TRANSFER_TOKEN_SALT=<click Generate>
JWT_SECRET=<click Generate>
```

### 5. Deploy

1. Click "Create Web Service"
2. Deployment will start automatically
3. Wait for build to complete (5-10 minutes)

### 6. Access Admin Panel

Once deployed:

1. **Admin URL**: https://realestateabroad-cms.onrender.com/admin
2. **API URL**: https://realestateabroad-cms.onrender.com/api/blog-posts
3. Create your first admin user when prompted

### 7. Bootstrap Features

The project includes automatic bootstrap:

✅ **Public permissions** automatically configured for blog-posts API
✅ **Initial blog content** automatically created on first run
✅ **Site filtering** enabled (queries filtered by site_key='realestateabroad')

### 8. Update Next.js Site

After successful deployment, update the main site environment variables:

```bash
NEXT_PUBLIC_STRAPI_URL=https://realestateabroad-cms.onrender.com
STRAPI_API_TOKEN=<generate in Strapi admin panel>
```

### 9. Generate API Token

1. Login to Strapi admin: https://realestateabroad-cms.onrender.com/admin
2. Go to Settings → API Tokens
3. Create new token with "Full access"
4. Copy the token to your Next.js environment variables

## Testing the API

Once deployed, test the API endpoints:

```bash
# List all blog posts
curl https://realestateabroad-cms.onrender.com/api/blog-posts

# Get specific blog post  
curl https://realestateabroad-cms.onrender.com/api/blog-posts/1

# Filter by site
curl https://realestateabroad-cms.onrender.com/api/blog-posts?site=realestateabroad
```

## Troubleshooting

**Build Fails:**
- Check Node version is 20.19.4
- Ensure PostgreSQL database is running
- Verify all environment variables are set

**API Returns 404:**
- Check bootstrap ran successfully in logs
- Verify public permissions are enabled
- Confirm database migrations completed

**Empty Response:**
- Check if initial content was created
- Verify site_key filtering is working
- Look for errors in Render logs

---

🎯 **Expected Result**: Working Strapi CMS at https://realestateabroad-cms.onrender.com with API endpoints accessible to the Next.js site.