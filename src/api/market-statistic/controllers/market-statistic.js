'use strict';

/**
 * market-statistic controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::market-statistic.market-statistic', ({ strapi }) => ({
  /**
   * Find all market statistics with site filtering
   */
  async find(ctx) {
    const { query } = ctx;
    
    // Add site filtering
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    if (siteKey) {
      query.filters = {
        ...query.filters,
        site: {
          key: siteKey
        }
      };
    }
    
    // Add population
    query.populate = {
      site: true,
      ...query.populate
    };
    
    // Sort by commercial value and priority
    if (!query.sort) {
      query.sort = ['commercial_value:desc', 'priority:desc', 'last_updated:desc'];
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * Get statistics by type (mortgage rates, LTV ratios, etc.)
   */
  async findByType(ctx) {
    const { type } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      statistic_type: type,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const statistics = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['priority:desc', 'last_updated:desc'],
      ...query
    });
    
    return { data: statistics };
  },

  /**
   * Get statistics by country
   */
  async findByCountry(ctx) {
    const { country } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      country: { $eqi: country },
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const statistics = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['commercial_value:desc', 'priority:desc'],
      ...query
    });
    
    return { data: statistics };
  },

  /**
   * Get homepage dashboard statistics
   */
  async getHomepageStats(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      display_on_homepage: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const statistics = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['priority:desc', 'commercial_value:desc'],
      limit: query.limit || 6
    });
    
    return { data: statistics };
  },

  /**
   * Get trending statistics (recent changes)
   */
  async getTrending(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    // Get statistics updated in the last 30 days with significant changes
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filters = {
      last_updated: { $gte: thirtyDaysAgo.toISOString() },
      trend_direction: { $in: ['up', 'down', 'volatile'] },
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const statistics = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['change_percentage:desc', 'commercial_value:desc'],
      limit: query.limit || 10
    });
    
    return { data: statistics };
  },

  /**
   * Get real-time mortgage rates
   */
  async getMortgageRates(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    const country = query.country;
    
    const filters = {
      statistic_type: 'mortgage-rate',
      ...(country && { country: { $eqi: country } }),
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const rates = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['priority:desc', 'last_updated:desc']
    });
    
    return { data: rates };
  },

  /**
   * Track view for analytics
   */
  async trackView(ctx) {
    const { id } = ctx.params;
    
    try {
      const statistic = await strapi.entityService.findOne('api::market-statistic.market-statistic', id);
      
      if (!statistic) {
        return ctx.notFound('Market statistic not found');
      }
      
      await strapi.entityService.update('api::market-statistic.market-statistic', id, {
        data: {
          view_count: (statistic.view_count || 0) + 1
        }
      });
      
      return { success: true, views: (statistic.view_count || 0) + 1 };
    } catch (error) {
      ctx.throw(500, 'Failed to track view');
    }
  },

  /**
   * Get market comparison data for multiple countries
   */
  async compareCountries(ctx) {
    const { query } = ctx;
    const { countries, statistic_type } = query;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    if (!countries || !statistic_type) {
      return ctx.badRequest('Countries and statistic_type are required');
    }
    
    const countryList = Array.isArray(countries) ? countries : countries.split(',');
    
    const comparison = {};
    for (const country of countryList) {
      comparison[country] = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
        filters: {
          country: { $eqi: country.trim() },
          statistic_type: statistic_type,
          ...(siteKey && { site: { key: siteKey } })
        },
        populate: ['site'],
        sort: ['last_updated:desc'],
        limit: 1
      });
    }
    
    return { data: comparison };
  }
}));