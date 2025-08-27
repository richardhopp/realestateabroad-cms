'use strict';

/**
 * blog-post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  // Custom find method with site filtering
  async find(ctx) {
    // Extract site key from query params, default to 'realestateabroad'
    const siteKey = ctx.query.site || 'realestateabroad';
    
    // Add site_key filter to the query
    ctx.query.filters = {
      ...ctx.query.filters,
      site_key: { $eq: siteKey }
    };

    // Call the default find method
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // Custom findOne method with site filtering
  async findOne(ctx) {
    const { id } = ctx.params;
    const siteKey = ctx.query.site || 'realestateabroad';

    // Add site_key filter for findOne as well
    ctx.query.filters = {
      ...ctx.query.filters,
      site_key: { $eq: siteKey }
    };

    const response = await super.findOne(ctx);
    return response;
  }
}));