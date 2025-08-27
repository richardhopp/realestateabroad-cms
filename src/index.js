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
    console.log('🚀 Bootstrapping Strapi...');
    
    try {
      // Ensure public permissions are set for blog posts
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (publicRole) {
        console.log('Setting public permissions for blog-posts...');
        
        // Enable find and findOne for blog-posts
        const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id }
        });
        
        const blogPostActions = ['api::blog-post.blog-post.find', 'api::blog-post.blog-post.findOne'];
        
        for (const action of blogPostActions) {
          const existingPermission = permissions.find(p => p.action === action);
          
          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
                enabled: true
              }
            });
            console.log(`✅ Created permission: ${action}`);
          } else if (!existingPermission.enabled) {
            await strapi.db.query('plugin::users-permissions.permission').update({
              where: { id: existingPermission.id },
              data: { enabled: true }
            });
            console.log(`✅ Enabled permission: ${action}`);
          }
        }
      }
      
      // Check if blog posts exist, if not, add initial content
      const blogPostCount = await strapi.db.query('api::blog-post.blog-post').count();
      
      if (blogPostCount === 0) {
        console.log('📝 No blog posts found, adding initial content...');
        
        const initialPosts = [
          {
            title: 'Golden Visa Programs 2024: Complete Investment Guide',
            slug: 'golden-visa-programs-2024',
            excerpt: 'Comprehensive guide to the best Golden Visa programs in 2024, including Portugal, Spain, Greece, and UAE options with investment requirements and benefits.',
            content: `<h2>Golden Visa Programs: Your Gateway to Global Mobility</h2>
<p>Golden visa programs have become increasingly popular among high-net-worth individuals seeking enhanced global mobility, business opportunities, and lifestyle benefits.</p>
<h3>Top Golden Visa Programs in 2024</h3>
<h4>1. Portugal Golden Visa</h4>
<p>Portugal's program remains one of Europe's most attractive options:</p>
<ul>
  <li><strong>Investment Options:</strong> €500,000 in investment funds, €350,000 in research activities, or €250,000 in cultural heritage</li>
  <li><strong>Benefits:</strong> EU residency, pathway to citizenship after 5 years, visa-free travel to 188 countries</li>
  <li><strong>Requirements:</strong> Minimum 7 days per year in Portugal</li>
</ul>
<h4>2. Spain Golden Visa</h4>
<p>Spain offers immediate residency for real estate investors:</p>
<ul>
  <li><strong>Investment Threshold:</strong> €500,000 in Spanish real estate</li>
  <li><strong>Benefits:</strong> Immediate residency, includes family members, no minimum stay requirement</li>
  <li><strong>Pathway:</strong> Permanent residency after 5 years, citizenship after 10 years</li>
</ul>`,
            author_name: 'Sarah Mitchell',
            category: 'Investment Guide',
            site_key: 'realestateabroad',
            featured: true,
            type: 'post',
            reading_time: 8,
            meta_title: 'Golden Visa Programs 2024: Complete Investment Guide',
            meta_description: 'Comprehensive guide to the best Golden Visa programs in 2024. Compare Portugal, Spain, Greece, and UAE investment residency options.',
            keywords: ["golden visa", "investment residency", "portugal golden visa", "spain golden visa"],
            publishedAt: new Date()
          },
          {
            title: 'Dubai Real Estate Investment Guide 2025',
            slug: 'dubai-real-estate-investment-guide-2025',
            excerpt: 'Complete guide to investing in Dubai real estate in 2025, covering prime areas, investment opportunities, legal framework, and expected returns.',
            content: `<h2>Dubai Real Estate: Prime Investment Opportunities in 2025</h2>
<p>Dubai's real estate market continues to attract international investors with its strategic location, tax advantages, and world-class infrastructure.</p>
<h3>Prime Investment Areas</h3>
<h4>Downtown Dubai</h4>
<p>The heart of the emirate offers premium properties with guaranteed high returns:</p>
<ul>
  <li><strong>Average Price:</strong> AED 2,500-4,000 per sq ft</li>
  <li><strong>Rental Yield:</strong> 5-7% annually</li>
  <li><strong>Key Attractions:</strong> Burj Khalifa, Dubai Mall, Business Bay proximity</li>
</ul>`,
            author_name: 'Ahmed Hassan',
            category: 'Market Analysis',
            site_key: 'realestateabroad',
            featured: false,
            type: 'post',
            reading_time: 10,
            meta_title: 'Dubai Real Estate Investment Guide 2025',
            meta_description: 'Complete guide to investing in Dubai real estate in 2025. Prime areas, yields, and investment strategies.',
            keywords: ["dubai real estate", "dubai property investment", "uae real estate"],
            publishedAt: new Date()
          }
        ];
        
        for (const post of initialPosts) {
          await strapi.db.query('api::blog-post.blog-post').create({
            data: post
          });
          console.log(`✅ Created blog post: ${post.title}`);
        }
      }
      
      console.log('✅ Bootstrap complete!');
    } catch (error) {
      console.error('❌ Bootstrap error:', error);
    }
  },
};
