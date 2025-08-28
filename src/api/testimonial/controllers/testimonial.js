'use strict';

/**
 * testimonial controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::testimonial.testimonial', ({ strapi }) => ({
  /**
   * Find all testimonials with site filtering
   */
  async find(ctx) {
    const { query } = ctx;
    
    // Add site filtering
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    if (siteKey) {
      query.filters = {
        ...query.filters,
        site: {
          key: siteKey
        }
      };
    }
    
    // Filter for verified testimonials only by default
    if (!query.filters?.verified) {
      query.filters = {
        ...query.filters,
        verified: true
      };
    }
    
    // Add population
    query.populate = {
      site: true,
      client_photo: true,
      ...query.populate
    };
    
    // Sort by commercial value and rating
    if (!query.sort) {
      query.sort = ['commercial_value:desc', 'rating:desc', 'priority:desc'];
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * Get testimonials by service type
   */
  async findByServiceType(ctx) {
    const { serviceType } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      service_type: serviceType,
      verified: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['commercial_value:desc', 'rating:desc', 'social_proof_score:desc'],
      ...query
    });
    
    return { data: testimonials };
  },

  /**
   * Get testimonials by country
   */
  async findByCountry(ctx) {
    const { country } = ctx.params;
    const { query } = ctx;
    
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      $or: [
        { client_country: { $eqi: country } },
        { purchase_country: { $eqi: country } }
      ],
      verified: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['rating:desc', 'commercial_value:desc'],
      ...query
    });
    
    return { data: testimonials };
  },

  /**
   * Get featured testimonials for homepage
   */
  async getFeatured(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      featured: true,
      verified: true,
      homepage_display: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['priority:desc', 'rating:desc', 'social_proof_score:desc'],
      limit: query.limit || 6
    });
    
    return { data: testimonials };
  },

  /**
   * Get high-converting testimonials for commercial pages
   */
  async getHighConverting(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      commercial_value: 'high',
      verified: true,
      conversion_tracking: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['engagement_score:desc', 'rating:desc'],
      limit: query.limit || 10
    });
    
    return { data: testimonials };
  },

  /**
   * Get testimonials by rating range
   */
  async findByRating(ctx) {
    const { query } = ctx;
    const { minRating = 4, maxRating = 5 } = query;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      rating: { 
        $gte: parseFloat(minRating),
        $lte: parseFloat(maxRating)
      },
      verified: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['rating:desc', 'social_proof_score:desc'],
      ...query
    });
    
    return { data: testimonials };
  },

  /**
   * Track view for analytics
   */
  async trackView(ctx) {
    const { id } = ctx.params;
    
    try {
      const testimonial = await strapi.entityService.findOne('api::testimonial.testimonial', id);
      
      if (!testimonial) {
        return ctx.notFound('Testimonial not found');
      }
      
      await strapi.entityService.update('api::testimonial.testimonial', id, {
        data: {
          view_count: (testimonial.view_count || 0) + 1
        }
      });
      
      return { success: true, views: (testimonial.view_count || 0) + 1 };
    } catch (error) {
      ctx.throw(500, 'Failed to track view');
    }
  },

  /**
   * Get testimonials with social proof metrics
   */
  async getSocialProof(ctx) {
    const { query } = ctx;
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const baseFilters = {
      verified: true,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const [highRating, recent, verified, recommended] = await Promise.all([
      // High rating testimonials
      strapi.entityService.findMany('api::testimonial.testimonial', {
        filters: { ...baseFilters, rating: { $gte: 4.5 } },
        populate: ['site', 'client_photo'],
        sort: ['rating:desc'],
        limit: 3
      }),
      
      // Recent testimonials
      strapi.entityService.findMany('api::testimonial.testimonial', {
        filters: baseFilters,
        populate: ['site', 'client_photo'],
        sort: ['createdAt:desc'],
        limit: 3
      }),
      
      // Verified client count
      strapi.entityService.count('api::testimonial.testimonial', {
        filters: baseFilters
      }),
      
      // Recommendation rate
      strapi.entityService.count('api::testimonial.testimonial', {
        filters: { ...baseFilters, would_recommend: true }
      })
    ]);
    
    const recommendationRate = verified > 0 ? Math.round((recommended / verified) * 100) : 0;
    
    return {
      data: {
        high_rating: highRating,
        recent: recent,
        metrics: {
          total_verified: verified,
          recommendation_rate: recommendationRate,
          average_rating: null // Will be calculated separately if needed
        }
      }
    };
  }
}));