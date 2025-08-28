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
          'api::consultation-country.consultation-country.findOne'
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