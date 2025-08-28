'use strict';

/**
 * financing-country controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::financing-country.financing-country', ({ strapi }) => ({
  
  /**
   * Find financing country by slug with SEO enhancements
   */
  async findBySlug(ctx) {
    try {
      const { slug } = ctx.params;
      const { site: siteKey = 'realestateabroad' } = ctx.query;

      // Get site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      if (!site) {
        return ctx.badRequest('Site not found');
      }

      // Find content by slug
      const entity = await strapi.service('api::financing-country.financing-country').findOne(null, {
        filters: { 
          slug,
          site: site.id 
        },
        populate: ['site']
      });

      if (!entity) {
        return ctx.notFound('Financing country not found');
      }

      // Generate SEO meta tags
      const metaTags = await strapi.service('api::seo-service.seo-service')
        .generateMetaTags(entity, site, 'financing-country');

      // Generate structured data
      const structuredData = await strapi.service('api::seo-service.seo-service')
        .generateStructuredData(entity, site, 'financing-country');

      ctx.body = {
        data: entity,
        meta: metaTags,
        structuredData
      };

    } catch (error) {
      strapi.log.error('Error finding financing country by slug:', error);
      ctx.internalServerError('Failed to fetch financing country');
    }
  },

  /**
   * Enhanced find method with SEO data
   */
  async find(ctx) {
    const { site: siteKey = 'realestateabroad' } = ctx.query;
    
    // Get site
    const site = await strapi.service('api::site.site').findByKey(siteKey);
    if (site) {
      ctx.query.filters = { 
        ...ctx.query.filters, 
        site: site.id 
      };
    }

    // Call parent method
    const result = await super.find(ctx);

    // Add SEO data to each item if requested
    if (ctx.query.includeSeo === 'true' && result.data) {
      for (let item of result.data) {
        item.meta = await strapi.service('api::seo-service.seo-service')
          .generateMetaTags(item, site, 'financing-country');
      }
    }

    return result;
  }

}));
