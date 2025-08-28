'use strict';

/**
 * SEO Service routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/seo/meta/:contentType/:id',
      handler: 'seo-service.getMeta',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/seo/sitemap/:site',
      handler: 'seo-service.getSitemap',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/seo/robots/:site',
      handler: 'seo-service.getRobots',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/seo/og-image',
      handler: 'seo-service.generateOgImage',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/seo/structured-data/:contentType/:id',
      handler: 'seo-service.getStructuredData',
      config: {
        auth: false,
      },
    },
  ],
};