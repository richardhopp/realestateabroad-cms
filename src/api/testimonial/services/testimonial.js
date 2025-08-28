'use strict';

/**
 * testimonial service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::testimonial.testimonial', ({ strapi }) => ({
  /**
   * Get testimonials by commercial value for conversion optimization
   */
  async getCommercialTestimonials(siteKey, commercialValue = 'high') {
    return await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: {
        commercial_value: commercialValue,
        verified: true,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site', 'client_photo'],
      sort: ['engagement_score:desc', 'rating:desc']
    });
  },

  /**
   * Get testimonials for specific service pages
   */
  async getServiceSpecificTestimonials(serviceType, country = null, siteKey = null) {
    const filters = {
      service_type: serviceType,
      verified: true,
      ...(country && { 
        $or: [
          { client_country: { $eqi: country } },
          { purchase_country: { $eqi: country } }
        ]
      }),
      ...(siteKey && { site: { key: siteKey } })
    };

    return await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['commercial_value:desc', 'rating:desc', 'social_proof_score:desc']
    });
  },

  /**
   * Calculate average rating for a service type
   */
  async calculateAverageRating(serviceType, siteKey = null) {
    const testimonials = await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: {
        service_type: serviceType,
        verified: true,
        ...(siteKey && { site: { key: siteKey } })
      }
    });

    if (testimonials.length === 0) return null;

    const totalRating = testimonials.reduce((sum, t) => sum + t.rating, 0);
    return {
      average: Math.round((totalRating / testimonials.length) * 10) / 10,
      count: testimonials.length
    };
  },

  /**
   * Get testimonials for trust-building sections
   */
  async getTrustBuildingTestimonials(siteKey = null, limit = 8) {
    return await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: {
        verified: true,
        rating: { $gte: 4.0 },
        would_recommend: true,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site', 'client_photo'],
      sort: ['social_proof_score:desc', 'rating:desc', 'view_count:desc'],
      limit
    });
  },

  /**
   * Search testimonials by content or location
   */
  async searchTestimonials(searchTerm, siteKey = null) {
    const filters = {
      $or: [
        { testimonial_text: { $containsi: searchTerm } },
        { client_location: { $containsi: searchTerm } },
        { client_country: { $containsi: searchTerm } },
        { purchase_country: { $containsi: searchTerm } },
        { keywords: { $containsi: searchTerm } }
      ],
      verified: true
    };

    if (siteKey) {
      filters.site = { key: siteKey };
    }

    return await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters,
      populate: ['site', 'client_photo'],
      sort: ['rating:desc', 'commercial_value:desc']
    });
  },

  /**
   * Get testimonial performance metrics
   */
  async getPerformanceMetrics(siteKey = null) {
    const baseFilters = siteKey ? { site: { key: siteKey } } : {};
    
    const [totalTestimonials, averageRating, verifiedCount, highValueCount, recommendationRate] = await Promise.all([
      // Total testimonials
      strapi.entityService.count('api::testimonial.testimonial', {
        filters: baseFilters
      }),
      
      // Calculate average rating
      strapi.entityService.findMany('api::testimonial.testimonial', {
        filters: { ...baseFilters, verified: true }
      }).then(testimonials => {
        if (testimonials.length === 0) return 0;
        const total = testimonials.reduce((sum, t) => sum + t.rating, 0);
        return Math.round((total / testimonials.length) * 10) / 10;
      }),
      
      // Verified testimonials
      strapi.entityService.count('api::testimonial.testimonial', {
        filters: { ...baseFilters, verified: true }
      }),
      
      // High commercial value testimonials
      strapi.entityService.count('api::testimonial.testimonial', {
        filters: { ...baseFilters, commercial_value: 'high' }
      }),
      
      // Recommendation rate
      Promise.all([
        strapi.entityService.count('api::testimonial.testimonial', {
          filters: { ...baseFilters, verified: true, would_recommend: true }
        }),
        strapi.entityService.count('api::testimonial.testimonial', {
          filters: { ...baseFilters, verified: true }
        })
      ]).then(([recommended, total]) => 
        total > 0 ? Math.round((recommended / total) * 100) : 0
      )
    ]);

    return {
      total_testimonials: totalTestimonials,
      average_rating: averageRating,
      verified_count: verifiedCount,
      high_value_count: highValueCount,
      recommendation_rate: recommendationRate
    };
  },

  /**
   * Get related testimonials based on service and location
   */
  async getRelatedTestimonials(testimonialId, limit = 4) {
    const testimonial = await strapi.entityService.findOne('api::testimonial.testimonial', testimonialId, {
      populate: ['site']
    });

    if (!testimonial) return [];

    return await strapi.entityService.findMany('api::testimonial.testimonial', {
      filters: {
        id: { $ne: testimonialId },
        verified: true,
        $or: [
          { service_type: testimonial.service_type },
          { client_country: testimonial.client_country },
          { purchase_country: testimonial.purchase_country }
        ],
        site: testimonial.site.id
      },
      populate: ['site', 'client_photo'],
      sort: ['rating:desc', 'commercial_value:desc'],
      limit
    });
  },

  /**
   * Update engagement metrics
   */
  async updateEngagementScore(testimonialId, interactionType = 'view') {
    const testimonial = await strapi.entityService.findOne('api::testimonial.testimonial', testimonialId);
    
    if (!testimonial) return null;

    let scoreIncrease = 0.1; // Base increase for view
    if (interactionType === 'click') scoreIncrease = 0.3;
    if (interactionType === 'share') scoreIncrease = 0.5;
    
    const newScore = Math.min(10, (testimonial.engagement_score || 5) + scoreIncrease);
    
    return await strapi.entityService.update('api::testimonial.testimonial', testimonialId, {
      data: {
        engagement_score: newScore,
        view_count: (testimonial.view_count || 0) + (interactionType === 'view' ? 1 : 0)
      }
    });
  }
}));