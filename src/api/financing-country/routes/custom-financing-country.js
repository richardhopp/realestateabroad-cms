'use strict';

/**
 * financing-country custom router
 * SEO-enhanced routes for slug-based access
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/financing-countries/slug/:slug',
      handler: 'financing-country.findBySlug',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};