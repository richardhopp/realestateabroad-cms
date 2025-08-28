'use strict';

/**
 * service-feature controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::service-feature.service-feature', ({ strapi }) => ({
  /**
   * Find all service features with site filtering
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
      icon: true,
      ...query.populate
    };
    
    // Sort by commercial value and priority
    if (!query.sort) {
      query.sort = ['commercial_value:desc', 'priority:desc', 'createdAt:desc'];
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * Find features by service type
   */
  async findByServiceType(ctx) {
    const { serviceType } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      service_type: serviceType,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const features = await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters,
      populate: ['site', 'icon'],
      sort: ['commercial_value:desc', 'priority:desc', 'click_count:desc'],
      ...query
    });
    
    return { data: features };
  },

  /**
   * Get high-value features for lead generation
   */
  async getLeadGenerationFeatures(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      lead_generation: true,
      commercial_value: 'high',
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const features = await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters,
      populate: ['site', 'icon'],
      sort: ['priority:desc', 'click_count:desc'],
      limit: query.limit || 6
    });
    
    return { data: features };
  },

  /**
   * Track feature click for analytics
   */
  async trackClick(ctx) {
    const { id } = ctx.params;
    
    try {
      const feature = await strapi.entityService.findOne('api::service-feature.service-feature', id);
      
      if (!feature) {
        return ctx.notFound('Service feature not found');
      }
      
      await strapi.entityService.update('api::service-feature.service-feature', id, {
        data: {
          click_count: (feature.click_count || 0) + 1,
          view_count: (feature.view_count || 0) + 1
        }
      });
      
      return { success: true, clicks: (feature.click_count || 0) + 1 };
    } catch (error) {
      ctx.throw(500, 'Failed to track click');
    }
  },

  /**
   * Get features by country
   */
  async findByCountry(ctx) {
    const { country } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    // Search in countries JSON field
    const features = await strapi.db.query('api::service-feature.service-feature').findMany({
      where: {
        countries: {
          $contains: country
        },
        ...(siteKey && { 
          site: {
            key: siteKey
          }
        })
      },
      populate: ['site', 'icon'],
      orderBy: [
        { commercial_value: 'desc' },
        { priority: 'desc' }
      ]
    });
    
    return { data: features };
  }
}));