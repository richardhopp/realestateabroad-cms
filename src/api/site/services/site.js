'use strict';

/**
 * site service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::site.site', ({ strapi }) => ({
  // Find site by key
  async findByKey(key) {
    return await strapi.db.query('api::site.site').findOne({
      where: { key, active: true }
    });
  },

  // Find site by domain
  async findByDomain(domain) {
    const sites = await strapi.db.query('api::site.site').findMany({
      where: {
        active: true,
        domains: {
          $contains: domain
        }
      }
    });
    
    return sites.length > 0 ? sites[0] : null;
  },

  // Get site configuration
  async getSiteConfig(siteKey) {
    const site = await this.findByKey(siteKey);
    
    if (!site) {
      throw new Error(`Site not found: ${siteKey}`);
    }

    return {
      ...site,
      upload_path: `/uploads/${site.key}`,
      media_base_path: `/uploads/${site.key}`,
    };
  },

  // Validate site access for user
  async validateSiteAccess(userId, siteKey) {
    // For now, return true - implement RBAC logic here later
    return true;
  }
}));