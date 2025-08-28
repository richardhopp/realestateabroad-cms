'use strict';

/**
 * faq service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::faq.faq', ({ strapi }) => ({
  /**
   * Get most helpful FAQs by category
   */
  async getMostHelpful(category, limit = 10) {
    return await strapi.entityService.findMany('api::faq.faq', {
      filters: category ? { category } : {},
      populate: ['site'],
      sort: ['helpful_votes:desc', 'priority:desc'],
      limit
    });
  },

  /**
   * Get FAQs by commercial value for lead generation
   */
  async getCommercialFAQs(siteKey, commercialValue = 'high') {
    return await strapi.entityService.findMany('api::faq.faq', {
      filters: {
        commercial_value: commercialValue,
        site: { key: siteKey }
      },
      populate: ['site'],
      sort: ['priority:desc', 'view_count:desc']
    });
  },

  /**
   * Search FAQs by keywords
   */
  async searchFAQs(searchTerm, siteKey = null) {
    const filters = {
      $or: [
        { question: { $containsi: searchTerm } },
        { answer: { $containsi: searchTerm } },
        { keywords: { $containsi: searchTerm } }
      ]
    };

    if (siteKey) {
      filters.site = { key: siteKey };
    }

    return await strapi.entityService.findMany('api::faq.faq', {
      filters,
      populate: ['site'],
      sort: ['commercial_value:desc', 'helpful_votes:desc']
    });
  },

  /**
   * Get related FAQs based on category and service type
   */
  async getRelatedFAQs(faqId, limit = 5) {
    const faq = await strapi.entityService.findOne('api::faq.faq', faqId, {
      populate: ['site']
    });

    if (!faq) return [];

    return await strapi.entityService.findMany('api::faq.faq', {
      filters: {
        id: { $ne: faqId },
        $or: [
          { category: faq.category },
          { service_type: faq.service_type }
        ],
        site: faq.site.id
      },
      populate: ['site'],
      sort: ['helpful_votes:desc', 'priority:desc'],
      limit
    });
  }
}));