#!/bin/bash

# Strapi CMS Multi-Site Deployment Script for Render
# This script helps deploy or redeploy the Strapi CMS with existing PostgreSQL database

echo "🚀 Deploying Strapi CMS Multi-Site Architecture to Render"
echo "=========================================================="

# Configuration
GITHUB_REPO="https://github.com/richardhopp/realestateabroad-cms"
SERVICE_NAME="realestateabroad-cms"
DATABASE_SERVICE_ID="dpg-d2jhc3be5dus739462a0-a"
EXPECTED_URL="https://realestateabroad-cms.onrender.com"

echo ""
echo "📋 Deployment Configuration:"
echo "  - Repository: $GITHUB_REPO"
echo "  - Service Name: $SERVICE_NAME"
echo "  - Database: $DATABASE_SERVICE_ID (existing PostgreSQL)"
echo "  - Expected URL: $EXPECTED_URL"
echo "  - Node Version: 20.19.4"
echo "  - Strapi Version: 4.15.5"

echo ""
echo "✅ Recent Changes Pushed to GitHub:"
echo "  - Multi-site architecture implemented"
echo "  - Site content type with key, name, domains"
echo "  - Blog Post updated with Site relation"
echo "  - RBAC policies and media partitioning"
echo "  - Bootstrap with SEO-optimized content"
echo "  - render.yaml configured for existing DB"

echo ""
echo "🎯 Deployment Options:"
echo ""
echo "OPTION 1 - Manual Deployment via Render Dashboard:"
echo "==========================================="
echo "1. Go to: https://dashboard.render.com"
echo "2. Find existing '$SERVICE_NAME' service OR create new one"
echo "3. If creating new:"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect GitHub: $GITHUB_REPO"
echo "   - Branch: master"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "4. If service exists, trigger manual deploy"
echo "5. Environment variables are auto-configured via render.yaml"

echo ""
echo "OPTION 2 - Check Current Deployment Status:"
echo "=========================================="
echo "Current service appears to be running but outdated."
echo "API endpoints return 404 - indicates missing content types."
echo ""

# Test current deployment
echo "🔍 Testing Current Deployment:"
echo "------------------------------"

echo -n "Admin Panel: "
if curl -s --max-time 10 "$EXPECTED_URL/admin" | grep -q "JavaScript"; then
    echo "✅ ACCESSIBLE (requires JavaScript)"
else
    echo "❌ NOT ACCESSIBLE"
fi

echo -n "Blog Posts API: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$EXPECTED_URL/api/blog-posts")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ WORKING (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ NOT FOUND (HTTP $HTTP_CODE) - Missing content types"
else
    echo "⚠️  ERROR (HTTP $HTTP_CODE)"
fi

echo -n "Sites API: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$EXPECTED_URL/api/sites")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ WORKING (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ NOT FOUND (HTTP $HTTP_CODE) - Missing content types"
else
    echo "⚠️  ERROR (HTTP $HTTP_CODE)"
fi

echo ""
echo "📊 Analysis:"
if [ "$HTTP_CODE" = "404" ]; then
    echo "❌ DEPLOYMENT ISSUE DETECTED:"
    echo "  - Strapi is running but API endpoints are missing"
    echo "  - This indicates the service is using old code"
    echo "  - Deployment needs to be triggered to use latest code"
    echo ""
    echo "🔧 RECOMMENDED ACTION:"
    echo "  1. Go to Render Dashboard: https://dashboard.render.com"
    echo "  2. Find the '$SERVICE_NAME' service"
    echo "  3. Click 'Manual Deploy' to force redeploy"
    echo "  4. Wait 5-10 minutes for build to complete"
    echo "  5. Run this script again to verify deployment"
else
    echo "✅ Service appears to be working correctly"
fi

echo ""
echo "🔧 Post-Deployment Checklist:"
echo "=============================="
echo "After successful deployment:"
echo ""
echo "1. ✅ Access admin panel: $EXPECTED_URL/admin"
echo "2. ✅ Create first admin user when prompted"
echo "3. ✅ Verify bootstrap created content:"
echo "   - Sites: realestateabroad, aparthotel"  
echo "   - Sample blog posts with SEO content"
echo "   - Public API permissions enabled"
echo "4. ✅ Generate API token:"
echo "   - Settings → API Tokens → Create Token"
echo "   - Full access permissions"
echo "   - Copy token for Next.js integration"
echo "5. ✅ Update Next.js environment variables:"
echo "   - NEXT_PUBLIC_STRAPI_URL=$EXPECTED_URL"
echo "   - STRAPI_API_TOKEN=[generated token]"

echo ""
echo "🧪 Test API Endpoints After Deployment:"
echo "======================================"
echo "curl $EXPECTED_URL/api/blog-posts"
echo "curl $EXPECTED_URL/api/sites"
echo "curl \"$EXPECTED_URL/api/blog-posts?site=realestateabroad\""

echo ""
echo "📚 Troubleshooting:"
echo "=================="
echo "If deployment fails:"
echo "• Check Render service logs for errors"
echo "• Verify Node.js version is 20.19.4"
echo "• Confirm PostgreSQL database is accessible"
echo "• Ensure all environment variables are set via render.yaml"
echo "• Check GitHub repository has latest code"

echo ""
echo "✨ Expected Result:"
echo "=================="
echo "🎯 Working Strapi CMS at: $EXPECTED_URL"
echo "🔗 API accessible to Next.js site for blog content"
echo "🏢 Multi-site support for realestateabroad.com and future sites"
echo "📱 SEO-optimized content ready for production"

echo ""
echo "=========================================================="
echo "📞 Next: Run task #10 (Generate API tokens and test integration)"
echo "=========================================================="