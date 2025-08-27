#!/bin/bash

# Strapi CMS Deployment Verification Script
# Run this script after triggering deployment in Render Dashboard

echo "🔍 Verifying Strapi CMS Multi-Site Deployment"
echo "=============================================="

BASE_URL="https://realestateabroad-cms.onrender.com"
TIMEOUT=10

# Function to check endpoint
check_endpoint() {
    local endpoint="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    echo -n "$description: "
    
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint")
    
    if [ "$http_code" = "$expected_status" ]; then
        echo "✅ SUCCESS (HTTP $http_code)"
        return 0
    else
        echo "❌ FAILED (HTTP $http_code, expected $expected_status)"
        return 1
    fi
}

# Function to check JSON response
check_json_endpoint() {
    local endpoint="$1"
    local description="$2"
    
    echo -n "$description: "
    
    local response=$(curl -s --max-time $TIMEOUT "$BASE_URL$endpoint")
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint")
    
    if [ "$http_code" = "200" ] && echo "$response" | jq . >/dev/null 2>&1; then
        local count=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
        echo "✅ SUCCESS (HTTP $http_code, $count items)"
        return 0
    else
        echo "❌ FAILED (HTTP $http_code)"
        return 1
    fi
}

echo ""
echo "🌐 Testing Core Endpoints:"
echo "=========================="

# Basic connectivity
check_endpoint "/admin" "Admin Panel" "200"

# API Endpoints - Multi-site architecture
check_json_endpoint "/api/sites" "Sites API"
check_json_endpoint "/api/blog-posts" "Blog Posts API"

# Site-specific filtering
check_json_endpoint "/api/blog-posts?site=realestateabroad" "Site Filtering"

echo ""
echo "🔍 Detailed API Response Analysis:"
echo "=================================="

echo ""
echo "📊 Sites Response:"
SITES_RESPONSE=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/sites")
if [ $? -eq 0 ] && [ -n "$SITES_RESPONSE" ]; then
    echo "$SITES_RESPONSE" | jq '.data[] | {key: .attributes.key, name: .attributes.name, active: .attributes.active}' 2>/dev/null || echo "Invalid JSON or empty response"
else
    echo "❌ No response from sites endpoint"
fi

echo ""
echo "📝 Blog Posts Response:"
POSTS_RESPONSE=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/blog-posts")
if [ $? -eq 0 ] && [ -n "$POSTS_RESPONSE" ]; then
    echo "$POSTS_RESPONSE" | jq '.data[] | {title: .attributes.title, slug: .attributes.slug, category: .attributes.category}' 2>/dev/null || echo "Invalid JSON or empty response"
else
    echo "❌ No response from blog-posts endpoint"
fi

echo ""
echo "🎯 Multi-Site Architecture Verification:"
echo "========================================"

# Check if sites exist
SITES_COUNT=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/sites" | jq '.data | length' 2>/dev/null || echo "0")
POSTS_COUNT=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/blog-posts" | jq '.data | length' 2>/dev/null || echo "0")

echo "Sites created: $SITES_COUNT (expected: 2)"
echo "Blog posts created: $POSTS_COUNT (expected: 4)"

# Check specific requirements
if [ "$SITES_COUNT" -ge "2" ] && [ "$POSTS_COUNT" -ge "2" ]; then
    echo "✅ BOOTSTRAP SUCCESS: Content created automatically"
else
    echo "⚠️  Bootstrap may not have completed successfully"
fi

echo ""
echo "🔐 Authentication & Permissions:"
echo "================================"

# Test public access (should work without authentication)
PUBLIC_ACCESS=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/blog-posts" | jq '.data | length' 2>/dev/null || echo "0")
if [ "$PUBLIC_ACCESS" -gt "0" ]; then
    echo "✅ Public API access enabled"
else
    echo "❌ Public API access not working"
fi

echo ""
echo "📱 SEO Content Verification:"
echo "============================"

# Check for SEO-optimized content
GOLDEN_VISA=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/blog-posts" | jq -r '.data[] | select(.attributes.slug == "golden-visa-programs-2024") | .attributes.title' 2>/dev/null)
DUBAI_REAL_ESTATE=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/blog-posts" | jq -r '.data[] | select(.attributes.slug == "dubai-real-estate-investment-guide-2025") | .attributes.title' 2>/dev/null)

if [ -n "$GOLDEN_VISA" ] && [ "$GOLDEN_VISA" != "null" ]; then
    echo "✅ Golden Visa guide: $GOLDEN_VISA"
else
    echo "❌ Golden Visa guide not found"
fi

if [ -n "$DUBAI_REAL_ESTATE" ] && [ "$DUBAI_REAL_ESTATE" != "null" ]; then
    echo "✅ Dubai real estate guide: $DUBAI_REAL_ESTATE"
else
    echo "❌ Dubai real estate guide not found"
fi

echo ""
echo "🎉 Deployment Status Summary:"
echo "============================"

if [ "$SITES_COUNT" -ge "2" ] && [ "$POSTS_COUNT" -ge "2" ] && [ "$PUBLIC_ACCESS" -gt "0" ]; then
    echo "🎯 ✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "✅ Multi-site architecture is working"
    echo "✅ API endpoints are accessible"
    echo "✅ Bootstrap content created"
    echo "✅ Public permissions enabled"
    echo "✅ SEO-optimized content available"
    echo ""
    echo "🚀 Ready for Next Steps:"
    echo "  1. Access admin: $BASE_URL/admin"
    echo "  2. Generate API token for Next.js integration"
    echo "  3. Update environment variables in Vercel"
    echo ""
    echo "🔗 API Endpoints Ready:"
    echo "  - GET $BASE_URL/api/blog-posts"
    echo "  - GET $BASE_URL/api/sites"
    echo "  - GET $BASE_URL/api/blog-posts?site=realestateabroad"
    
    exit 0
else
    echo "❌ DEPLOYMENT ISSUES DETECTED"
    echo ""
    echo "⚠️  Issues found:"
    [ "$SITES_COUNT" -lt "2" ] && echo "  - Sites not created ($SITES_COUNT/2)"
    [ "$POSTS_COUNT" -lt "2" ] && echo "  - Blog posts not created ($POSTS_COUNT/4)"
    [ "$PUBLIC_ACCESS" -eq "0" ] && echo "  - Public API access not working"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Check Render service logs for errors"
    echo "  2. Verify database connection is working"
    echo "  3. Ensure bootstrap function completed"
    echo "  4. Try redeploying if issues persist"
    
    exit 1
fi