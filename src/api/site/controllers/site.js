'use strict';

/**
 * site controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::site.site', ({ strapi }) => ({
  // Find sites with domain matching
  async findByDomain(ctx) {
    const { domain } = ctx.params;
    
    if (!domain) {
      return ctx.badRequest('Domain parameter is required');
    }

    try {
      const sites = await strapi.db.query('api::site.site').findMany({
        where: {
          active: true,
          domains: {
            $contains: domain
          }
        }
      });

      return { data: sites };
    } catch (error) {
      ctx.throw(500, 'Error finding site by domain');
    }
  },

  // Custom find with active filter by default
  async find(ctx) {
    // Add active filter by default unless explicitly disabled
    if (!ctx.query.filters) {
      ctx.query.filters = {};
    }
    
    if (ctx.query.filters.active === undefined) {
      ctx.query.filters.active = { $eq: true };
    }

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  }
}));