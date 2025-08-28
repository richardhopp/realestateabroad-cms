'use strict';

/**
 * service-feature router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::service-feature.service-feature');

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/service-features/service/:serviceType',
    handler: 'api::service-feature.service-feature.findByServiceType',
  },
  {
    method: 'GET',
    path: '/service-features/country/:country',
    handler: 'api::service-feature.service-feature.findByCountry',
  },
  {
    method: 'GET',
    path: '/service-features/lead-generation',
    handler: 'api::service-feature.service-feature.getLeadGenerationFeatures',
  },
  {
    method: 'POST',
    path: '/service-features/:id/click',
    handler: 'api::service-feature.service-feature.trackClick',
  }
];

module.exports = customRouter(defaultRouter, myExtraRoutes);