'use strict';

/**
 * SEO Service controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = {

  /**
   * Get complete meta tags for content
   */
  async getMeta(ctx) {
    try {
      const { contentType, id } = ctx.params;
      const { site: siteKey = 'realestateabroad' } = ctx.query;

      // Get site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      if (!site) {
        return ctx.badRequest('Site not found');
      }

      // Get content
      const service = strapi.service(`api::${contentType}.${contentType}`);
      const content = await service.findOne(id, {
        populate: ['site', 'country']
      });

      if (!content) {
        return ctx.notFound('Content not found');
      }

      // Generate meta tags
      const metaTags = await strapi.service('api::seo-service.seo-service')
        .generateMetaTags(content, site, contentType);

      // Generate structured data
      const structuredData = await strapi.service('api::seo-service.seo-service')
        .generateStructuredData(content, site, contentType);

      ctx.body = {
        meta: metaTags,
        structuredData,
        lastModified: content.updatedAt
      };
    } catch (error) {
      strapi.log.error('SEO Meta generation error:', error);
      ctx.internalServerError('Failed to generate meta tags');
    }
  },

  /**
   * Generate XML sitemap
   */
  async getSitemap(ctx) {
    try {
      const { site: siteKey } = ctx.params;

      // Get site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      if (!site) {
        return ctx.badRequest('Site not found');
      }

      const seoService = strapi.service('api::seo-service.seo-service');
      const baseUrl = seoService.getCanonicalDomain(site);
      
      // Generate sitemap entries for all content types
      const contentTypes = [
        'financing-country',
        'consultation-country', 
        'seo-country',
        'seo-city',
        'blog-post',
        'faq'
      ];

      let allEntries = [];
      for (const contentType of contentTypes) {
        try {
          const entries = await seoService.generateSitemapEntries(contentType, site);
          allEntries = [...allEntries, ...entries];
        } catch (error) {
          strapi.log.warn(`Failed to generate sitemap entries for ${contentType}:`, error);
        }
      }

      // Add static pages
      const staticPages = [
        { loc: baseUrl, priority: 1.0, changefreq: 'daily' },
        { loc: `${baseUrl}/financing`, priority: 0.9, changefreq: 'weekly' },
        { loc: `${baseUrl}/consultation`, priority: 0.9, changefreq: 'weekly' },
        { loc: `${baseUrl}/for-sale`, priority: 0.8, changefreq: 'daily' },
        { loc: `${baseUrl}/contact`, priority: 0.5, changefreq: 'monthly' },
        { loc: `${baseUrl}/about`, priority: 0.5, changefreq: 'monthly' },
      ];

      allEntries = [...staticPages, ...allEntries];

      // Generate XML
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq || 'monthly'}</changefreq>
    <priority>${entry.priority || '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`;

      ctx.set('Content-Type', 'application/xml');
      ctx.body = xml;

    } catch (error) {
      strapi.log.error('Sitemap generation error:', error);
      ctx.internalServerError('Failed to generate sitemap');
    }
  },

  /**
   * Generate robots.txt
   */
  async getRobots(ctx) {
    try {
      const { site: siteKey } = ctx.params;

      // Get site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      if (!site) {
        return ctx.badRequest('Site not found');
      }

      const seoService = strapi.service('api::seo-service.seo-service');
      const baseUrl = seoService.getCanonicalDomain(site);

      const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/api/seo/sitemap/${siteKey}

# Disallow admin and API endpoints
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /uploads/

# Allow specific API endpoints for SEO
Allow: /api/seo/

# Crawl delay (optional)
Crawl-delay: 1`;

      ctx.set('Content-Type', 'text/plain');
      ctx.body = robots;

    } catch (error) {
      strapi.log.error('Robots.txt generation error:', error);
      ctx.internalServerError('Failed to generate robots.txt');
    }
  },

  /**
   * Generate Open Graph image
   */
  async generateOgImage(ctx) {
    try {
      const { site, title, type } = ctx.query;

      // For now, return a simple redirect to a default image
      // This can be enhanced with image generation libraries like Puppeteer or Canvas
      const defaultImage = `/uploads/og-images/default-${type || 'property'}.jpg`;
      
      ctx.redirect(defaultImage);

    } catch (error) {
      strapi.log.error('OG Image generation error:', error);
      ctx.internalServerError('Failed to generate OG image');
    }
  },

  /**
   * Get structured data for content
   */
  async getStructuredData(ctx) {
    try {
      const { contentType, id } = ctx.params;
      const { site: siteKey = 'realestateabroad' } = ctx.query;

      // Get site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      if (!site) {
        return ctx.badRequest('Site not found');
      }

      // Get content
      const service = strapi.service(`api::${contentType}.${contentType}`);
      const content = await service.findOne(id, {
        populate: ['site', 'country']
      });

      if (!content) {
        return ctx.notFound('Content not found');
      }

      // Generate structured data
      const structuredData = await strapi.service('api::seo-service.seo-service')
        .generateStructuredData(content, site, contentType);

      ctx.body = {
        structuredData,
        contentType,
        id,
        lastModified: content.updatedAt
      };

    } catch (error) {
      strapi.log.error('Structured data generation error:', error);
      ctx.internalServerError('Failed to generate structured data');
    }
  }

};