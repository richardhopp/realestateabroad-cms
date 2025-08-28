'use strict';

/**
 * market-statistic router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::market-statistic.market-statistic');

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
    path: '/market-statistics/type/:type',
    handler: 'api::market-statistic.market-statistic.findByType',
  },
  {
    method: 'GET',
    path: '/market-statistics/country/:country',
    handler: 'api::market-statistic.market-statistic.findByCountry',
  },
  {
    method: 'GET',
    path: '/market-statistics/homepage',
    handler: 'api::market-statistic.market-statistic.getHomepageStats',
  },
  {
    method: 'GET',
    path: '/market-statistics/trending',
    handler: 'api::market-statistic.market-statistic.getTrending',
  },
  {
    method: 'GET',
    path: '/market-statistics/mortgage-rates',
    handler: 'api::market-statistic.market-statistic.getMortgageRates',
  },
  {
    method: 'GET',
    path: '/market-statistics/compare',
    handler: 'api::market-statistic.market-statistic.compareCountries',
  },
  {
    method: 'POST',
    path: '/market-statistics/:id/view',
    handler: 'api::market-statistic.market-statistic.trackView',
  }
];

module.exports = customRouter(defaultRouter, myExtraRoutes);