'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Bootstrapping Strapi v4.15.5...');
    
    try {
      // Set up public permissions for all content types
      console.log('🔐 Setting up public permissions...');
      
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (publicRole) {
        const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id }
        });
        
        // Enable public access for all content types
        const requiredActions = [
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::site.site.find',
          'api::site.site.findOne',
          'api::seo-country.seo-country.find',
          'api::seo-country.seo-country.findOne',
          'api::seo-city.seo-city.find',
          'api::seo-city.seo-city.findOne',
          'api::financing-country.financing-country.find',
          'api::financing-country.financing-country.findOne',
          'api::consultation-country.consultation-country.find',
          'api::consultation-country.consultation-country.findOne',
          'api::faq.faq.find',
          'api::faq.faq.findOne',
          'api::faq.faq.findByCategory',
          'api::faq.faq.incrementView',
          'api::faq.faq.voteHelpful',
          'api::service-feature.service-feature.find',
          'api::service-feature.service-feature.findOne',
          'api::service-feature.service-feature.findByServiceType',
          'api::service-feature.service-feature.findByCountry',
          'api::service-feature.service-feature.getLeadGenerationFeatures',
          'api::service-feature.service-feature.trackClick',
          'api::market-statistic.market-statistic.find',
          'api::market-statistic.market-statistic.findOne',
          'api::market-statistic.market-statistic.findByType',
          'api::market-statistic.market-statistic.findByCountry',
          'api::market-statistic.market-statistic.getHomepageStats',
          'api::market-statistic.market-statistic.getTrending',
          'api::market-statistic.market-statistic.getMortgageRates',
          'api::market-statistic.market-statistic.compareCountries',
          'api::market-statistic.market-statistic.trackView',
          'api::testimonial.testimonial.find',
          'api::testimonial.testimonial.findOne',
          'api::testimonial.testimonial.findByServiceType',
          'api::testimonial.testimonial.findByCountry',
          'api::testimonial.testimonial.getFeatured',
          'api::testimonial.testimonial.getHighConverting',
          'api::testimonial.testimonial.findByRating',
          'api::testimonial.testimonial.getSocialProof',
          'api::testimonial.testimonial.trackView'
        ];
        
        for (const action of requiredActions) {
          const existingPermission = permissions.find(p => p.action === action);
          
          if (!existingPermission) {
            try {
              await strapi.db.query('plugin::users-permissions.permission').create({
                data: {
                  action,
                  role: publicRole.id,
                  enabled: true
                }
              });
              console.log(`✅ Created permission: ${action}`);
            } catch (error) {
              console.log(`⚠️ Could not create permission ${action}: ${error.message}`);
            }
          } else if (!existingPermission.enabled) {
            try {
              await strapi.db.query('plugin::users-permissions.permission').update({
                where: { id: existingPermission.id },
                data: { enabled: true }
              });
              console.log(`✅ Enabled permission: ${action}`);
            } catch (error) {
              console.log(`⚠️ Could not enable permission ${action}: ${error.message}`);
            }
          }
        }
      }
      
      console.log('✅ Bootstrap Complete!');
      console.log(`📊 Strapi v4.15.5 is ready`);
      console.log(`   - Admin: https://realestateabroad-cms.onrender.com/admin`);
      console.log(`   - API: https://realestateabroad-cms.onrender.com/api`);
      
    } catch (error) {
      console.error('❌ Bootstrap error:', error);
      // Don't throw - let Strapi start anyway
    }
  },
};