'use strict';

/**
 * site router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::site.site');

const customRoutes = {
  routes: [
    {
      method: 'GET',
      path: '/sites/domain/:domain',
      handler: 'site.findByDomain',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

// Merge custom routes with default routes
module.exports = {
  routes: [
    ...defaultRouter.routes,
    ...customRoutes.routes,
  ],
};