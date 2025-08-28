#!/usr/bin/env node

/**
 * Test script for new content types
 * Verifies all API endpoints are working correctly
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const API_BASE = `${STRAPI_URL}/api`;

// Test endpoints for each content type
const ENDPOINTS_TO_TEST = [
  // FAQ endpoints
  { method: 'GET', url: '/faqs', name: 'FAQ - List all' },
  { method: 'GET', url: '/faqs/category/financing', name: 'FAQ - By category' },
  
  // Service Features endpoints
  { method: 'GET', url: '/service-features', name: 'Service Features - List all' },
  { method: 'GET', url: '/service-features/service/mortgage-financing', name: 'Service Features - By service type' },
  { method: 'GET', url: '/service-features/lead-generation', name: 'Service Features - Lead generation' },
  
  // Market Statistics endpoints
  { method: 'GET', url: '/market-statistics', name: 'Market Statistics - List all' },
  { method: 'GET', url: '/market-statistics/type/mortgage-rate', name: 'Market Statistics - By type' },
  { method: 'GET', url: '/market-statistics/homepage', name: 'Market Statistics - Homepage' },
  { method: 'GET', url: '/market-statistics/trending', name: 'Market Statistics - Trending' },
  
  // Testimonials endpoints
  { method: 'GET', url: '/testimonials', name: 'Testimonials - List all' },
  { method: 'GET', url: '/testimonials/featured', name: 'Testimonials - Featured' },
  { method: 'GET', url: '/testimonials/service/mortgage-financing', name: 'Testimonials - By service' },
  { method: 'GET', url: '/testimonials/social-proof', name: 'Testimonials - Social proof' },
  
  // Existing endpoints (should still work)
  { method: 'GET', url: '/sites', name: 'Sites - List all' },
  { method: 'GET', url: '/blog-posts', name: 'Blog Posts - List all' }
];

async function testEndpoint(endpoint) {
  try {
    const response = await axios({
      method: endpoint.method,
      url: `${API_BASE}${endpoint.url}`,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    return {
      name: endpoint.name,
      status: 'SUCCESS',
      statusCode: response.status,
      dataCount: Array.isArray(response.data?.data) ? response.data.data.length : (response.data?.data ? 1 : 0)
    };
  } catch (error) {
    return {
      name: endpoint.name,
      status: 'FAILED',
      statusCode: error.response?.status || 'TIMEOUT',
      error: error.response?.data?.error?.message || error.message
    };
  }
}

async function runTests() {
  console.log('🧪 Testing New Content Type Endpoints...');
  console.log(`🔗 Base URL: ${API_BASE}`);
  console.log('─'.repeat(80));
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    process.stdout.write(`Testing: ${endpoint.name.padEnd(40)} ... `);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.status === 'SUCCESS') {
      console.log(`✅ ${result.statusCode} (${result.dataCount} items)`);
      successCount++;
    } else {
      console.log(`❌ ${result.statusCode} - ${result.error}`);
      failCount++;
    }
  }
  
  console.log('─'.repeat(80));
  console.log(`📊 Test Results: ${successCount} passed, ${failCount} failed`);
  
  if (failCount > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAILED').forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
  }
  
  if (successCount > 0) {
    console.log('\n✅ Working Endpoints:');
    results.filter(r => r.status === 'SUCCESS').forEach(r => {
      console.log(`   • ${r.name}: ${r.dataCount} items available`);
    });
  }
  
  console.log('\n🎯 Next Steps:');
  if (failCount === 0) {
    console.log('   ✅ All endpoints working correctly!');
    console.log('   📝 Run the data migration script to populate content:');
    console.log('      node COMMERCIAL_CONTENT_MIGRATION.js');
  } else {
    console.log('   ⚠️  Some endpoints failed. Check Strapi server is running.');
    console.log('   🚀 Start Strapi with: npm run develop');
  }
  
  return { successCount, failCount, results };
}

// Health check function
async function healthCheck() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/sites`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.log('❌ Strapi server not responding. Please start it with: npm run develop');
    return false;
  }
}

async function main() {
  console.log('🏥 Health Check...');
  const isHealthy = await healthCheck();
  
  if (!isHealthy) {
    process.exit(1);
  }
  
  console.log('✅ Strapi server is responding\n');
  
  const testResults = await runTests();
  
  // Exit with error code if tests failed
  process.exit(testResults.failCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, healthCheck };