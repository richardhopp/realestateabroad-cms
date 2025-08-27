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
    
    // Find the site by key first
    const site = await strapi.service('api::site.site').findByKey(siteKey);
    
    if (!site) {
      return ctx.notFound(`Site not found: ${siteKey}`);
    }
    
    // Add site relation filter to the query
    ctx.query.filters = {
      ...ctx.query.filters,
      site: { id: { $eq: site.id } }
    };

    // Populate site relation by default
    ctx.query.populate = {
      ...ctx.query.populate,
      site: {
        fields: ['key', 'name', 'domains']
      }
    };

    // Call the default find method
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  // Custom findOne method with site filtering
  async findOne(ctx) {
    const { id } = ctx.params;
    const siteKey = ctx.query.site || 'realestateabroad';

    // Find the site by key first
    const site = await strapi.service('api::site.site').findByKey(siteKey);
    
    if (!site) {
      return ctx.notFound(`Site not found: ${siteKey}`);
    }

    // Add site relation filter
    ctx.query.filters = {
      ...ctx.query.filters,
      site: { id: { $eq: site.id } }
    };

    // Populate site relation
    ctx.query.populate = {
      ...ctx.query.populate,
      site: {
        fields: ['key', 'name', 'domains']
      }
    };

    const response = await super.findOne(ctx);
    return response;
  },

  // Find by slug with site filtering
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const siteKey = ctx.query.site || 'realestateabroad';

    // Find the site by key first
    const site = await strapi.service('api::site.site').findByKey(siteKey);
    
    if (!site) {
      return ctx.notFound(`Site not found: ${siteKey}`);
    }

    try {
      const blogPost = await strapi.db.query('api::blog-post.blog-post').findOne({
        where: {
          slug,
          site: site.id,
          publishedAt: { $notNull: true }
        },
        populate: {
          site: {
            select: ['key', 'name', 'domains']
          }
        }
      });

      if (!blogPost) {
        return ctx.notFound(`Blog post not found: ${slug}`);
      }

      return { data: blogPost };
    } catch (error) {
      ctx.throw(500, 'Error finding blog post by slug');
    }
  }
}));