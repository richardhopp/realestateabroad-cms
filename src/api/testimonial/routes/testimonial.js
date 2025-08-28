'use strict';

/**
 * testimonial router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::testimonial.testimonial');

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
    path: '/testimonials/service/:serviceType',
    handler: 'api::testimonial.testimonial.findByServiceType',
  },
  {
    method: 'GET',
    path: '/testimonials/country/:country',
    handler: 'api::testimonial.testimonial.findByCountry',
  },
  {
    method: 'GET',
    path: '/testimonials/featured',
    handler: 'api::testimonial.testimonial.getFeatured',
  },
  {
    method: 'GET',
    path: '/testimonials/high-converting',
    handler: 'api::testimonial.testimonial.getHighConverting',
  },
  {
    method: 'GET',
    path: '/testimonials/by-rating',
    handler: 'api::testimonial.testimonial.findByRating',
  },
  {
    method: 'GET',
    path: '/testimonials/social-proof',
    handler: 'api::testimonial.testimonial.getSocialProof',
  },
  {
    method: 'POST',
    path: '/testimonials/:id/view',
    handler: 'api::testimonial.testimonial.trackView',
  }
];

module.exports = customRouter(defaultRouter, myExtraRoutes);