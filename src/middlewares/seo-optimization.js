'use strict';

/**
 * SEO Optimization middleware
 * Handles URL canonicalization, redirects, and SEO headers
 */

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    try {
      // Skip for admin and API routes (except SEO API routes)
      if (ctx.request.url.startsWith('/admin') || 
          (ctx.request.url.startsWith('/api') && !ctx.request.url.startsWith('/api/seo'))) {
        return next();
      }

      // Get site information from domain or query parameter
      const siteKey = ctx.query.site || await getSiteFromDomain(ctx.request.host);
      const site = siteKey ? await strapi.service('api::site.site').findByKey(siteKey) : null;

      if (site) {
        // Add site context to the request
        ctx.state.site = site;
        ctx.state.siteKey = site.key;

        // Handle URL canonicalization
        await handleUrlCanonicalization(ctx, site);

        // Add SEO security headers
        addSeoSecurityHeaders(ctx);

        // Handle SEO-specific routes
        if (ctx.request.url.startsWith('/api/seo/')) {
          await handleSeoApiRoutes(ctx, site);
        }
      }

      await next();

      // Add performance and SEO headers after processing
      addPerformanceHeaders(ctx);

    } catch (error) {
      strapi.log.error('SEO optimization middleware error:', error);
      await next();
    }
  };

  /**
   * Get site from domain mapping
   */
  async function getSiteFromDomain(host) {
    try {
      if (!host) return 'realestateabroad';
      
      // Remove www. prefix and port
      const domain = host.replace(/^www\./, '').split(':')[0];
      const site = await strapi.service('api::site.site').findByDomain(domain);
      
      return site ? site.key : 'realestateabroad';
    } catch (error) {
      strapi.log.error('Error getting site from domain:', error);
      return 'realestateabroad';
    }
  }

  /**
   * Handle URL canonicalization and redirects
   */
  async function handleUrlCanonicalization(ctx, site) {
    const url = ctx.request.url.toLowerCase();
    const originalUrl = ctx.request.url;

    // Force lowercase URLs (except for specific cases)
    if (url !== originalUrl && !originalUrl.includes('/uploads/')) {
      ctx.redirect(url, 301);
      return;
    }

    // Remove trailing slashes except for root
    if (url.length > 1 && url.endsWith('/')) {
      ctx.redirect(url.slice(0, -1), 301);
      return;
    }

    // Handle common redirect patterns
    const redirectPatterns = [
      // Redirect old patterns to new SEO-friendly ones
      { from: /^\/property-financing\/(.+)$/, to: '/financing/$1' },
      { from: /^\/property-consultation\/(.+)$/, to: '/consultation/$1' },
      { from: /^\/properties\/(.+)$/, to: '/for-sale/$1' },
      { from: /^\/index\.html?$/, to: '/' },
      { from: /^\/home$/, to: '/' },
    ];

    for (const pattern of redirectPatterns) {
      const match = url.match(pattern.from);
      if (match) {
        const redirectTo = pattern.to.replace(/\$(\d+)/g, (_, index) => match[index]);
        ctx.redirect(redirectTo, 301);
        return;
      }
    }
  }

  /**
   * Add SEO and security headers
   */
  function addSeoSecurityHeaders(ctx) {
    // Security headers that also help with SEO
    ctx.set('X-Content-Type-Options', 'nosniff');
    ctx.set('X-Frame-Options', 'SAMEORIGIN');
    ctx.set('X-XSS-Protection', '1; mode=block');
    ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (adjust based on your needs)
    ctx.set('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.googletagmanager.com; " +
      "style-src 'self' 'unsafe-inline' *.googleapis.com; " +
      "img-src 'self' data: *.google.com *.googleapis.com *.gstatic.com; " +
      "font-src 'self' *.googleapis.com *.gstatic.com; " +
      "connect-src 'self' *.google-analytics.com *.googletagmanager.com;"
    );
  }

  /**
   * Add performance headers for better Core Web Vitals
   */
  function addPerformanceHeaders(ctx) {
    // Enable compression if not already enabled
    if (!ctx.response.get('Content-Encoding')) {
      ctx.vary('Accept-Encoding');
    }

    // Cache control for static assets
    if (ctx.request.url.includes('/uploads/') || 
        ctx.request.url.match(/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff|woff2)$/)) {
      ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (ctx.request.url.startsWith('/api/seo/')) {
      // Cache SEO data for 1 hour
      ctx.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    } else {
      // Default cache for pages
      ctx.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    }

    // Add ETag for better caching
    if (ctx.body && typeof ctx.body === 'object') {
      const etag = require('crypto')
        .createHash('md5')
        .update(JSON.stringify(ctx.body))
        .digest('hex');
      ctx.set('ETag', `"${etag}"`);
    }
  }

  /**
   * Handle SEO-specific API routes
   */
  async function handleSeoApiRoutes(ctx, site) {
    // Add site context for SEO routes
    if (!ctx.query.site && site) {
      ctx.query.site = site.key;
    }

    // Handle special SEO routes
    if (ctx.request.url === `/api/seo/sitemap.xml` || 
        ctx.request.url.match(/^\/api\/seo\/sitemap\/[^\/]+$/)) {
      ctx.set('Content-Type', 'application/xml; charset=utf-8');
    }

    if (ctx.request.url === `/api/seo/robots.txt` || 
        ctx.request.url.match(/^\/api\/seo\/robots\/[^\/]+$/)) {
      ctx.set('Content-Type', 'text/plain; charset=utf-8');
    }
  }
};