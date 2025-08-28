'use strict';

/**
 * consultation-country router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Default CRUD routes
    ...createCoreRouter('api::consultation-country.consultation-country').routes,
    
    // SEO-enhanced route for finding by slug
    {
      method: 'GET',
      path: '/consultation-countries/slug/:slug',
      handler: 'consultation-country.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};
