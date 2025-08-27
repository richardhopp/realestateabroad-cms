'use strict';

/**
 * Site-based media partitioning middleware
 * Organizes uploaded files by site in folder structure
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Only apply to upload endpoints
    if (!ctx.request.url.includes('/upload')) {
      return next();
    }

    try {
      // Get site information from query params or header
      const siteKey = ctx.query.site || ctx.request.headers['x-site-key'] || 'realestateabroad';
      
      // Find the site
      const site = await strapi.service('api::site.site').findByKey(siteKey);
      
      if (site) {
        // Create date-based path
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        // Set the upload path based on site
        const uploadPath = `/uploads/${site.key}/${year}/${month}`;
        
        // Add site context to request for upload plugin
        ctx.state.site = site;
        ctx.state.uploadPath = uploadPath;
      }

    } catch (error) {
      strapi.log.error('Site media middleware error:', error);
    }

    return next();
  };
};