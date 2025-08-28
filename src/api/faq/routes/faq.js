'use strict';

/**
 * faq router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::faq.faq');

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
    path: '/faqs/category/:category',
    handler: 'api::faq.faq.findByCategory',
  },
  {
    method: 'POST',
    path: '/faqs/:id/view',
    handler: 'api::faq.faq.incrementView',
  },
  {
    method: 'POST',
    path: '/faqs/:id/helpful',
    handler: 'api::faq.faq.voteHelpful',
  }
];

module.exports = customRouter(defaultRouter, myExtraRoutes);