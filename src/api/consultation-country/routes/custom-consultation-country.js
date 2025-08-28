'use strict';

/**
 * consultation-country custom router
 * SEO-enhanced routes for slug-based access
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/consultation-countries/slug/:slug',
      handler: 'consultation-country.findBySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};