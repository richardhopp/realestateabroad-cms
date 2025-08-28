'use strict';

/**
 * service-feature service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::service-feature.service-feature', ({ strapi }) => ({
  /**
   * Get top performing features by clicks
   */
  async getTopPerforming(siteKey, limit = 10) {
    return await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters: siteKey ? { site: { key: siteKey } } : {},
      populate: ['site', 'icon'],
      sort: ['click_count:desc', 'view_count:desc'],
      limit
    });
  },

  /**
   * Get features by commercial value for sales optimization
   */
  async getCommercialFeatures(siteKey, commercialValue = 'high') {
    return await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters: {
        commercial_value: commercialValue,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site', 'icon'],
      sort: ['priority:desc', 'click_count:desc']
    });
  },

  /**
   * Get featured service highlights for homepage
   */
  async getFeaturedServices(siteKey, limit = 4) {
    return await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters: {
        featured: true,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site', 'icon'],
      sort: ['priority:desc', 'commercial_value:desc'],
      limit
    });
  },

  /**
   * Search features by keyword or description
   */
  async searchFeatures(searchTerm, siteKey = null) {
    const filters = {
      $or: [
        { title: { $containsi: searchTerm } },
        { description: { $containsi: searchTerm } },
        { keywords: { $containsi: searchTerm } }
      ]
    };

    if (siteKey) {
      filters.site = { key: siteKey };
    }

    return await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters,
      populate: ['site', 'icon'],
      sort: ['commercial_value:desc', 'priority:desc']
    });
  },

  /**
   * Get service comparison data
   */
  async getServiceComparison(serviceTypes, siteKey = null) {
    const comparison = {};
    
    for (const serviceType of serviceTypes) {
      comparison[serviceType] = await strapi.entityService.findMany('api::service-feature.service-feature', {
        filters: {
          service_type: serviceType,
          ...(siteKey && { site: { key: siteKey } })
        },
        populate: ['site', 'icon'],
        sort: ['priority:desc']
      });
    }
    
    return comparison;
  },

  /**
   * Get features with success rates for credibility
   */
  async getFeaturesWithSuccessRates(siteKey = null) {
    return await strapi.entityService.findMany('api::service-feature.service-feature', {
      filters: {
        success_rate: { $notNull: true },
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site', 'icon'],
      sort: ['success_rate:desc', 'commercial_value:desc']
    });
  }
}));