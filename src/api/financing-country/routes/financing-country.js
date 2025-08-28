'use strict';

/**
 * financing-country router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = {
  routes: [
    // Default CRUD routes
    ...createCoreRouter('api::financing-country.financing-country').routes,
    
    // SEO-enhanced route for finding by slug
    {
      method: 'GET',
      path: '/financing-countries/slug/:slug',
      handler: 'financing-country.findBySlug',
      config: {
        auth: false,
      },
    },
  ],
};
