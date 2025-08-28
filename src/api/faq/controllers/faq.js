'use strict';

/**
 * faq controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::faq.faq', ({ strapi }) => ({
  /**
   * Find all FAQs with site filtering and category filtering
   */
  async find(ctx) {
    const { query } = ctx;
    
    // Add site filtering based on request domain or site parameter
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    if (siteKey) {
      query.filters = {
        ...query.filters,
        site: {
          key: siteKey
        }
      };
    }
    
    // Add population for better API responses
    query.populate = {
      site: true,
      ...query.populate
    };
    
    // Sort by priority and created date
    if (!query.sort) {
      query.sort = ['priority:desc', 'createdAt:desc'];
    }
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },

  /**
   * Find FAQ by category with commercial prioritization
   */
  async findByCategory(ctx) {
    const { category } = ctx.params;
    const { query } = ctx;
    
    // Add site filtering
    const siteKey = ctx.request.header['x-site-key'] || query.site;
    
    const filters = {
      category: category,
      ...(siteKey && { site: { key: siteKey } })
    };
    
    const faqs = await strapi.entityService.findMany('api::faq.faq', {
      filters,
      populate: ['site'],
      sort: ['commercial_value:desc', 'priority:desc', 'helpful_votes:desc'],
      ...query
    });
    
    return { data: faqs };
  },

  /**
   * Increment view count for analytics
   */
  async incrementView(ctx) {
    const { id } = ctx.params;
    
    try {
      const faq = await strapi.entityService.findOne('api::faq.faq', id);
      
      if (!faq) {
        return ctx.notFound('FAQ not found');
      }
      
      await strapi.entityService.update('api::faq.faq', id, {
        data: {
          view_count: (faq.view_count || 0) + 1
        }
      });
      
      return { success: true };
    } catch (error) {
      ctx.throw(500, 'Failed to increment view count');
    }
  },

  /**
   * Vote helpful for FAQ
   */
  async voteHelpful(ctx) {
    const { id } = ctx.params;
    
    try {
      const faq = await strapi.entityService.findOne('api::faq.faq', id);
      
      if (!faq) {
        return ctx.notFound('FAQ not found');
      }
      
      await strapi.entityService.update('api::faq.faq', id, {
        data: {
          helpful_votes: (faq.helpful_votes || 0) + 1
        }
      });
      
      return { success: true, helpful_votes: (faq.helpful_votes || 0) + 1 };
    } catch (error) {
      ctx.throw(500, 'Failed to vote helpful');
    }
  }
}));