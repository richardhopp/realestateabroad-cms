#!/usr/bin/env node
/**
 * SEO Validation Script
 * Comprehensive SEO testing and validation for Strapi CMS
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs/promises');
const path = require('path');

class SeoValidator {
  constructor(baseUrl, siteKey) {
    this.baseUrl = baseUrl || 'http://localhost:1337';
    this.siteKey = siteKey || 'realestateabroad';
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  /**
   * Run all SEO validation tests
   */
  async runAllTests() {
    console.log('🚀 Starting comprehensive SEO validation...\n');
    
    try {
      // Test API endpoints
      await this.testApiEndpoints();
      
      // Test meta tag generation
      await this.testMetaTagGeneration();
      
      // Test sitemap generation
      await this.testSitemapGeneration();
      
      // Test robots.txt
      await this.testRobotsGeneration();
      
      // Test structured data
      await this.testStructuredDataGeneration();
      
      // Test URL patterns
      await this.testUrlPatterns();
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ SEO validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Test API endpoints functionality
   */
  async testApiEndpoints() {
    console.log('📡 Testing API endpoints...');
    
    const endpoints = [
      '/api/financing-countries',
      '/api/consultation-countries',
      '/api/seo-countries',
      '/api/seo-cities',
      '/api/faqs'
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint, 'API Endpoint Access');
    }
  }

  /**
   * Test meta tag generation for different content types
   */
  async testMetaTagGeneration() {
    console.log('🏷️  Testing meta tag generation...');

    // Test financing country meta
    await this.testContentTypeMeta('financing-country', 1);
    
    // Test consultation country meta  
    await this.testContentTypeMeta('consultation-country', 1);
    
    // Test SEO country meta
    await this.testContentTypeMeta('seo-country', 1);
  }

  /**
   * Test meta generation for specific content type
   */
  async testContentTypeMeta(contentType, id) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/seo/meta/${contentType}/${id}?site=${this.siteKey}`
      );

      const meta = response.data.meta;
      
      // Test required meta fields
      this.validateField(meta.title, 'Title', `${contentType} meta title`);
      this.validateField(meta.description, 'Description', `${contentType} meta description`);
      this.validateField(meta.canonical, 'Canonical URL', `${contentType} canonical`);
      
      // Test Open Graph tags
      this.validateField(meta.ogTitle, 'OG Title', `${contentType} og:title`);
      this.validateField(meta.ogDescription, 'OG Description', `${contentType} og:description`);
      this.validateField(meta.ogUrl, 'OG URL', `${contentType} og:url`);
      
      // Test title length (SEO best practice: 50-60 chars)
      if (meta.title && meta.title.length > 60) {
        this.addWarning(`${contentType} title too long: ${meta.title.length} chars`);
      }
      
      // Test description length (SEO best practice: 150-160 chars)
      if (meta.description && meta.description.length > 160) {
        this.addWarning(`${contentType} description too long: ${meta.description.length} chars`);
      }

      this.addTest(`${contentType} Meta Generation`, 'PASSED');
      
    } catch (error) {
      this.addTest(`${contentType} Meta Generation`, 'FAILED', error.message);
    }
  }

  /**
   * Test sitemap generation
   */
  async testSitemapGeneration() {
    console.log('🗺️  Testing sitemap generation...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/seo/sitemap/${this.siteKey}`);
      
      // Validate XML structure
      if (!response.data.includes('<?xml version="1.0"')) {
        throw new Error('Invalid XML structure');
      }
      
      if (!response.data.includes('<urlset')) {
        throw new Error('Missing urlset element');
      }
      
      // Check for required URLs
      const requiredUrls = ['/financing', '/consultation', '/for-sale'];
      for (const url of requiredUrls) {
        if (!response.data.includes(url)) {
          this.addWarning(`Sitemap missing required URL: ${url}`);
        }
      }
      
      this.addTest('Sitemap Generation', 'PASSED');
      
    } catch (error) {
      this.addTest('Sitemap Generation', 'FAILED', error.message);
    }
  }

  /**
   * Test robots.txt generation
   */
  async testRobotsGeneration() {
    console.log('🤖 Testing robots.txt generation...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/api/seo/robots/${this.siteKey}`);
      
      // Check for required directives
      const robotsContent = response.data;
      
      if (!robotsContent.includes('User-agent:')) {
        throw new Error('Missing User-agent directive');
      }
      
      if (!robotsContent.includes('Sitemap:')) {
        throw new Error('Missing Sitemap directive');
      }
      
      if (!robotsContent.includes('Disallow: /admin/')) {
        this.addWarning('Should disallow admin directory');
      }
      
      this.addTest('Robots.txt Generation', 'PASSED');
      
    } catch (error) {
      this.addTest('Robots.txt Generation', 'FAILED', error.message);
    }
  }

  /**
   * Test structured data generation
   */
  async testStructuredDataGeneration() {
    console.log('📊 Testing structured data generation...');
    
    const testCases = [
      { contentType: 'financing-country', id: 1, expectedType: 'Service' },
      { contentType: 'consultation-country', id: 1, expectedType: 'Service' },
      { contentType: 'faq', id: 1, expectedType: 'FAQPage' }
    ];

    for (const testCase of testCases) {
      await this.testStructuredData(testCase.contentType, testCase.id, testCase.expectedType);
    }
  }

  /**
   * Test structured data for specific content
   */
  async testStructuredData(contentType, id, expectedType) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/seo/structured-data/${contentType}/${id}?site=${this.siteKey}`
      );

      const structuredData = response.data.structuredData;
      
      if (!structuredData) {
        throw new Error('No structured data returned');
      }
      
      if (structuredData['@context'] !== 'https://schema.org') {
        throw new Error('Invalid schema.org context');
      }
      
      if (structuredData['@type'] !== expectedType) {
        throw new Error(`Expected type ${expectedType}, got ${structuredData['@type']}`);
      }
      
      this.addTest(`${contentType} Structured Data`, 'PASSED');
      
    } catch (error) {
      this.addTest(`${contentType} Structured Data`, 'FAILED', error.message);
    }
  }

  /**
   * Test URL patterns and slug consistency
   */
  async testUrlPatterns() {
    console.log('🔗 Testing URL patterns...');
    
    // Test slug-based endpoints
    const slugTests = [
      { endpoint: '/api/financing-countries/slug/spain', description: 'Financing Spain by slug' },
      { endpoint: '/api/consultation-countries/slug/spain', description: 'Consultation Spain by slug' }
    ];

    for (const test of slugTests) {
      await this.testEndpoint(test.endpoint, test.description);
    }
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(endpoint, description) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}?site=${this.siteKey}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      this.addTest(description, 'PASSED');
      
    } catch (error) {
      this.addTest(description, 'FAILED', error.response?.status || error.message);
    }
  }

  /**
   * Validate field presence and quality
   */
  validateField(value, fieldName, testName) {
    if (!value || value.trim() === '') {
      this.addTest(testName, 'FAILED', `Missing ${fieldName}`);
    } else {
      this.addTest(testName, 'PASSED');
    }
  }

  /**
   * Add test result
   */
  addTest(name, status, error = null) {
    this.results.tests.push({ name, status, error, timestamp: new Date() });
    
    if (status === 'PASSED') {
      this.results.passed++;
      console.log(`  ✅ ${name}`);
    } else {
      this.results.failed++;
      console.log(`  ❌ ${name}: ${error || 'Failed'}`);
    }
  }

  /**
   * Add warning
   */
  addWarning(message) {
    this.results.warnings++;
    console.log(`  ⚠️  ${message}`);
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.tests.length,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: Math.round((this.results.passed / this.results.tests.length) * 100)
      },
      tests: this.results.tests,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../reports/seo-validation-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 SEO Validation Results:');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Success Rate: ${report.summary.successRate}%`);
    console.log(`\nDetailed report saved to: ${reportPath}`);

    if (report.summary.failed > 0) {
      console.log('\n❌ Some tests failed. Please check the detailed report.');
      process.exit(1);
    } else {
      console.log('\n✅ All SEO validation tests passed!');
    }
  }

  /**
   * Generate SEO recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed > 0) {
      recommendations.push('Fix failed SEO tests to improve search engine optimization');
    }

    if (this.results.warnings > 0) {
      recommendations.push('Address SEO warnings to optimize content length and structure');
    }

    recommendations.push('Regularly run SEO validation after content updates');
    recommendations.push('Monitor Core Web Vitals in production');
    recommendations.push('Test meta tags with Google Rich Results Test');
    recommendations.push('Validate sitemaps with Google Search Console');

    return recommendations;
  }
}

// CLI execution
if (require.main === module) {
  const baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  const siteKey = process.env.SITE_KEY || 'realestateabroad';
  
  const validator = new SeoValidator(baseUrl, siteKey);
  validator.runAllTests().catch(console.error);
}

module.exports = SeoValidator;