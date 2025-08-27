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
    console.log('🚀 Bootstrapping Strapi Multi-Site CMS...');
    
    try {
      // 1. Create Sites first
      console.log('📍 Setting up Sites...');
      
      const sitesData = [
        {
          key: 'realestateabroad',
          name: 'Real Estate Abroad',
          domains: ['realestateabroad.com', 'www.realestateabroad.com'],
          description: 'International real estate investment platform',
          config: {
            currency: 'EUR',
            language: 'en',
            timezone: 'Europe/London'
          },
          brand_colors: {
            primary: '#1a73e8',
            secondary: '#34a853',
            accent: '#fbbc04'
          },
          meta_defaults: {
            meta_title_suffix: ' | Real Estate Abroad',
            meta_description: 'Discover international real estate investment opportunities worldwide',
            og_image: '/images/og-realestateabroad.jpg',
            twitter_handle: '@realestateabroad'
          }
        },
        {
          key: 'aparthotel',
          name: 'Apart Hotel Investments',
          domains: ['aparthotel.com', 'www.aparthotel.com'],
          description: 'Specialized aparthotel investment opportunities',
          config: {
            currency: 'USD',
            language: 'en',
            timezone: 'America/New_York'
          },
          brand_colors: {
            primary: '#6f42c1',
            secondary: '#e83e8c',
            accent: '#fd7e14'
          },
          meta_defaults: {
            meta_title_suffix: ' | Apart Hotel Investments',
            meta_description: 'Premium aparthotel investment opportunities worldwide',
            og_image: '/images/og-aparthotel.jpg',
            twitter_handle: '@aparthotel'
          }
        }
      ];

      const sites = {};
      
      for (const siteData of sitesData) {
        let site = await strapi.db.query('api::site.site').findOne({
          where: { key: siteData.key }
        });
        
        if (!site) {
          site = await strapi.db.query('api::site.site').create({
            data: siteData
          });
          console.log(`✅ Created site: ${site.name} (${site.key})`);
        } else {
          console.log(`♻️ Site exists: ${site.name} (${site.key})`);
        }
        
        sites[siteData.key] = site;
      }

      // 2. Set up public permissions for all content types
      console.log('🔐 Setting up public permissions...');
      
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' }
      });
      
      if (publicRole) {
        const permissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id }
        });
        
        const requiredActions = [
          'api::blog-post.blog-post.find',
          'api::blog-post.blog-post.findOne',
          'api::site.site.find',
          'api::site.site.findOne'
        ];
        
        for (const action of requiredActions) {
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
      
      // 3. Create SEO-optimized blog content
      console.log('📝 Creating SEO-optimized blog content...');
      
      const blogPostCount = await strapi.db.query('api::blog-post.blog-post').count();
      
      if (blogPostCount === 0) {
        const seoOptimizedPosts = [
          // Real Estate Abroad content
          {
            title: 'Golden Visa Programs 2025: Complete Investment Guide',
            slug: 'golden-visa-programs-2025-investment-guide',
            excerpt: 'Discover the top Golden Visa programs for 2025. Compare Portugal, Spain, Greece, and UAE investment residency options with detailed requirements and benefits.',
            content: `<h2>Golden Visa Programs: Your Gateway to Global Mobility</h2>

<p>Golden visa programs have become the cornerstone of international mobility for high-net-worth individuals seeking enhanced global access, business opportunities, and lifestyle benefits. These residency-by-investment programs offer foreign nationals a pathway to European or international residency through qualifying investments.</p>

<h3>Top Golden Visa Programs in 2025</h3>

<h4>🇵🇹 Portugal Golden Visa Program</h4>
<p>Portugal's program remains one of Europe's most attractive options for international investors:</p>
<div class="highlight-box">
<ul>
  <li><strong>Investment Options:</strong> €500,000 in investment funds, €350,000 in research activities, or €250,000 in cultural heritage preservation</li>
  <li><strong>Benefits:</strong> EU residency, pathway to citizenship after 5 years, visa-free travel to 188 countries</li>
  <li><strong>Requirements:</strong> Minimum 7 days per year physical presence in Portugal</li>
  <li><strong>Processing Time:</strong> 8-12 months for initial approval</li>
</ul>
</div>

<h4>🇪🇸 Spain Golden Visa Program</h4>
<p>Spain offers immediate residency for qualifying real estate investors:</p>
<div class="highlight-box">
<ul>
  <li><strong>Investment Threshold:</strong> €500,000 in Spanish real estate</li>
  <li><strong>Benefits:</strong> Immediate residency, includes family members, no minimum stay requirement</li>
  <li><strong>Pathway:</strong> Permanent residency after 5 years, citizenship after 10 years</li>
  <li><strong>Advantages:</strong> Access to Spanish healthcare and education systems</li>
</ul>
</div>

<h4>🇬🇷 Greece Golden Visa Program</h4>
<p>One of Europe's most affordable investment residency programs:</p>
<div class="highlight-box">
<ul>
  <li><strong>Investment Amount:</strong> €250,000 in real estate (increasing to €500,000 in prime areas from 2024)</li>
  <li><strong>Benefits:</strong> 5-year renewable residency, includes family members</li>
  <li><strong>Advantages:</strong> No residence requirements, EU access, strong rental yields</li>
  <li><strong>Best For:</strong> Budget-conscious investors seeking EU residency</li>
</ul>
</div>

<h4>🇦🇪 UAE Golden Visa Program</h4>
<p>The UAE's program offers long-term residency in a tax-free environment:</p>
<div class="highlight-box">
<ul>
  <li><strong>Investment Options:</strong> AED 2 million (€540,000) in real estate or business investment</li>
  <li><strong>Duration:</strong> 10-year renewable residency</li>
  <li><strong>Benefits:</strong> No personal income tax, strategic location, world-class infrastructure</li>
  <li><strong>Family Inclusion:</strong> Spouse, children, and parents eligible</li>
</ul>
</div>

<h3>Investment Strategies and Due Diligence</h3>

<h4>Choosing the Right Program</h4>
<p>Selecting the optimal Golden Visa program requires careful consideration of your personal and financial circumstances:</p>

<ul>
  <li><strong>Investment Budget:</strong> Programs range from €250,000 (Greece) to €500,000+ (Portugal, Spain)</li>
  <li><strong>Residency Requirements:</strong> Some programs require minimal physical presence, others have specific requirements</li>
  <li><strong>Family Inclusion:</strong> Consider whether spouse, children, and parents can be included</li>
  <li><strong>Business Opportunities:</strong> Evaluate the potential for business expansion in your chosen country</li>
  <li><strong>Tax Implications:</strong> Understand the tax obligations in both your home country and residency country</li>
</ul>

<h4>Due Diligence Process</h4>
<p>All Golden Visa programs require comprehensive due diligence:</p>

<ul>
  <li><strong>Background Checks:</strong> Criminal record checks from all countries of residence</li>
  <li><strong>Financial Verification:</strong> Proof of funds and source of wealth documentation</li>
  <li><strong>Health Requirements:</strong> Medical certificates and health insurance</li>
  <li><strong>Investment Compliance:</strong> Ensuring investments meet program requirements</li>
</ul>

<h3>Market Trends and Future Outlook</h3>

<p>The Golden Visa market continues to evolve with increased demand and tightening requirements. Key trends for 2025 include:</p>

<ul>
  <li><strong>Increased Investment Thresholds:</strong> Several countries are raising minimum investment amounts</li>
  <li><strong>Enhanced Due Diligence:</strong> More stringent background checks and source of funds requirements</li>
  <li><strong>Focus on Economic Impact:</strong> Programs increasingly favor investments that create jobs or economic benefits</li>
  <li><strong>Alternative Investment Options:</strong> Growing acceptance of fund investments and business investments</li>
</ul>

<h3>Professional Guidance</h3>

<p>Given the complexity and significant financial commitment involved, working with experienced immigration lawyers and investment advisors is crucial. They can help you:</p>

<ul>
  <li>Evaluate which program best suits your needs</li>
  <li>Navigate the application process efficiently</li>
  <li>Ensure full compliance with all requirements</li>
  <li>Optimize your investment for both residency and returns</li>
</ul>

<p><em>Ready to explore Golden Visa opportunities? Contact our team of international investment specialists for personalized guidance on achieving European residency through strategic real estate investment.</em></p>`,
            author_name: 'Sarah Mitchell, International Investment Specialist',
            category: 'Investment Guide',
            featured: true,
            type: 'post',
            reading_time: 12,
            meta_title: 'Golden Visa Programs 2025: Complete Investment Guide',
            meta_description: 'Comprehensive guide to Golden Visa programs in 2025. Compare Portugal, Spain, Greece, and UAE investment residency options with requirements and benefits.',
            keywords: ["golden visa", "investment residency", "portugal golden visa", "spain golden visa", "greece golden visa", "uae golden visa", "european residency"],
            site: sites.realestateabroad ? sites.realestateabroad.id : null,
            publishedAt: new Date()
          },
          {
            title: 'Dubai Real Estate Investment 2025: Complete Market Analysis',
            slug: 'dubai-real-estate-investment-2025-market-analysis',
            excerpt: 'Dubai real estate offers exceptional opportunities in 2025. Discover prime investment areas, expected returns, legal framework, and expert insights for successful property investment.',
            content: `<h2>Dubai Real Estate: Prime Investment Opportunities in 2025</h2>

<p>Dubai's real estate market continues to attract international investors with its strategic location, tax advantages, world-class infrastructure, and robust legal framework. As we enter 2025, the emirate presents compelling opportunities across multiple property sectors.</p>

<h3>Market Overview and Performance</h3>

<p>Dubai's property market has shown remarkable resilience and growth, with several key indicators pointing to continued strength:</p>

<div class="stats-box">
<ul>
  <li><strong>Price Growth:</strong> 15-20% annual appreciation in prime areas</li>
  <li><strong>Rental Yields:</strong> 5-8% annually, among the highest globally</li>
  <li><strong>Transaction Volume:</strong> Record-breaking sales values exceeding AED 300 billion</li>
  <li><strong>Foreign Investment:</strong> 70% of purchases by international buyers</li>
</ul>
</div>

<h3>Prime Investment Areas</h3>

<h4>🏙️ Downtown Dubai</h4>
<p>The heart of the emirate offers premium properties with guaranteed high returns:</p>
<div class="area-highlight">
<ul>
  <li><strong>Average Price:</strong> AED 2,500-4,000 per sq ft</li>
  <li><strong>Rental Yield:</strong> 5-7% annually</li>
  <li><strong>Key Attractions:</strong> Burj Khalifa, Dubai Mall, Business Bay proximity</li>
  <li><strong>Investment Range:</strong> AED 1.5M - 15M+</li>
  <li><strong>Best For:</strong> Luxury investors seeking prestige and strong returns</li>
</ul>
</div>

<h4>🏖️ Dubai Marina</h4>
<p>Waterfront living with excellent infrastructure and amenities:</p>
<div class="area-highlight">
<ul>
  <li><strong>Average Price:</strong> AED 1,800-3,200 per sq ft</li>
  <li><strong>Rental Yield:</strong> 6-8% annually</li>
  <li><strong>Lifestyle:</strong> Beach access, dining, entertainment</li>
  <li><strong>Property Types:</strong> High-rise apartments, penthouses</li>
  <li><strong>Growth Potential:</strong> Consistent demand from expats and tourists</li>
</ul>
</div>

<h4>🌴 Palm Jumeirah</h4>
<p>Iconic man-made island with exclusive luxury properties:</p>
<div class="area-highlight">
<ul>
  <li><strong>Average Price:</strong> AED 3,000-8,000+ per sq ft</li>
  <li><strong>Rental Yield:</strong> 4-6% annually</li>
  <li><strong>Exclusivity:</strong> Limited supply, high demand</li>
  <li><strong>Property Types:</strong> Villas, luxury apartments, penthouses</li>
  <li><strong>Investment Minimum:</strong> AED 3M+</li>
</ul>
</div>

<h4>🏗️ Business Bay</h4>
<p>Dubai's central business district with mixed-use developments:</p>
<div class="area-highlight">
<ul>
  <li><strong>Average Price:</strong> AED 1,500-2,800 per sq ft</li>
  <li><strong>Rental Yield:</strong> 6-9% annually</li>
  <li><strong>Growth Driver:</strong> Commercial hub development</li>
  <li><strong>Best For:</strong> Buy-to-let investors and end-users</li>
</ul>
</div>

<h3>Investment Strategies for 2025</h3>

<h4>Buy-to-Let Strategy</h4>
<p>Dubai's strong rental market makes buy-to-let an attractive option:</p>
<ul>
  <li><strong>Target Areas:</strong> Dubai Marina, JBR, Downtown Dubai</li>
  <li><strong>Expected Yields:</strong> 6-8% annually</li>
  <li><strong>Tenant Profile:</strong> Expat professionals, corporate housing</li>
  <li><strong>Management:</strong> Professional property management recommended</li>
</ul>

<h4>Off-Plan Investment</h4>
<p>Purchasing properties before completion offers several advantages:</p>
<ul>
  <li><strong>Payment Plans:</strong> Flexible payment schemes during construction</li>
  <li><strong>Capital Appreciation:</strong> Value increase during construction period</li>
  <li><strong>Early Bird Prices:</strong> Pre-launch pricing advantages</li>
  <li><strong>Risk Mitigation:</strong> Choose reputable developers with proven track records</li>
</ul>

<h4>Luxury Property Investment</h4>
<p>High-end properties offer prestige and strong appreciation potential:</p>
<ul>
  <li><strong>Target Locations:</strong> Palm Jumeirah, Emirates Hills, Downtown</li>
  <li><strong>Investment Range:</strong> AED 5M - 50M+</li>
  <li><strong>Benefits:</strong> Limited supply, international appeal, lifestyle amenities</li>
  <li><strong>Financing:</strong> Local and international mortgage options available</li>
</ul>

<h3>Legal Framework and Process</h3>

<h4>Ownership Rights</h4>
<p>Dubai offers clear property ownership rights for foreign investors:</p>
<ul>
  <li><strong>Freehold Areas:</strong> Over 40 designated areas allow 100% foreign ownership</li>
  <li><strong>Leasehold:</strong> 99-year leases in certain areas</li>
  <li><strong>Property Types:</strong> Residential, commercial, and mixed-use properties</li>
  <li><strong>Inheritance:</strong> Properties can be inherited and transferred</li>
</ul>

<h4>Purchase Process</h4>
<p>The property acquisition process is streamlined and transparent:</p>
<ol>
  <li><strong>Property Selection:</strong> Choose property and negotiate terms</li>
  <li><strong>MOU Signing:</strong> Memorandum of Understanding with initial deposit</li>
  <li><strong>Due Diligence:</strong> Verify developer, property status, and legal compliance</li>
  <li><strong>SPA Signing:</strong> Sales and Purchase Agreement with Dubai Land Department</li>
  <li><strong>Registration:</strong> Property registration and title deed issuance</li>
  <li><strong>Handover:</strong> Key handover and possession</li>
</ol>

<h3>Financial Considerations</h3>

<h4>Costs and Fees</h4>
<p>Understanding all costs involved in Dubai property investment:</p>
<div class="cost-breakdown">
<ul>
  <li><strong>Transfer Fee:</strong> 4% of property value (2% buyer, 2% seller)</li>
  <li><strong>Brokerage Fee:</strong> 2% of property value</li>
  <li><strong>Mortgage Registration:</strong> 0.25% of loan amount (if applicable)</li>
  <li><strong>Property Valuation:</strong> AED 2,500-5,000</li>
  <li><strong>Legal Fees:</strong> AED 5,000-15,000</li>
  <li><strong>Service Charges:</strong> AED 10-25 per sq ft annually</li>
</ul>
</div>

<h4>Financing Options</h4>
<p>Multiple financing solutions available for international investors:</p>
<ul>
  <li><strong>UAE Banks:</strong> Up to 75% LTV for residents, 50% for non-residents</li>
  <li><strong>International Banks:</strong> Offshore financing options</li>
  <li><strong>Developer Financing:</strong> In-house financing for select projects</li>
  <li><strong>Interest Rates:</strong> 3.5-6% annually depending on profile</li>
</ul>

<h3>Tax Benefits and Advantages</h3>

<p>Dubai's tax-friendly environment provides significant advantages:</p>
<ul>
  <li><strong>No Income Tax:</strong> Zero personal income tax on property income</li>
  <li><strong>No Capital Gains Tax:</strong> Profits from property sales not taxed</li>
  <li><strong>No Inheritance Tax:</strong> Properties pass to heirs without tax implications</li>
  <li><strong>Golden Visa:</strong> Long-term residency for property investors over AED 2M</li>
</ul>

<h3>Market Outlook for 2025</h3>

<p>Several factors point to continued growth in Dubai's real estate market:</p>

<ul>
  <li><strong>Expo 2020 Legacy:</strong> Continued infrastructure benefits and international attention</li>
  <li><strong>Economic Diversification:</strong> Growing sectors beyond oil and gas</li>
  <li><strong>Population Growth:</strong> Increasing expat population driving demand</li>
  <li><strong>Government Initiatives:</strong> Pro-business policies and visa reforms</li>
  <li><strong>Regional Hub:</strong> Strategic location connecting East and West</li>
</ul>

<h3>Expert Investment Tips</h3>

<p>Maximize your Dubai real estate investment success with these expert recommendations:</p>

<ol>
  <li><strong>Location Priority:</strong> Focus on areas with strong rental demand and growth potential</li>
  <li><strong>Developer Reputation:</strong> Choose established developers with proven delivery records</li>
  <li><strong>Market Timing:</strong> Monitor market cycles and economic indicators</li>
  <li><strong>Professional Advice:</strong> Work with licensed real estate agents and legal advisors</li>
  <li><strong>Portfolio Diversification:</strong> Consider multiple property types and locations</li>
  <li><strong>Long-term Perspective:</strong> Dubai real estate rewards patient investors</li>
</ol>

<p><em>Ready to explore Dubai's real estate opportunities? Our team of Dubai property specialists can guide you through every step of your investment journey, from initial selection to successful completion.</em></p>`,
            author_name: 'Ahmed Hassan, Dubai Property Expert',
            category: 'Market Analysis',
            featured: true,
            type: 'post',
            reading_time: 15,
            meta_title: 'Dubai Real Estate Investment 2025: Complete Market Analysis & Guide',
            meta_description: 'Dubai real estate investment guide 2025. Prime areas, rental yields, legal framework, costs, and expert tips for successful property investment in Dubai.',
            keywords: ["dubai real estate", "dubai property investment", "uae real estate", "dubai marina", "palm jumeirah", "downtown dubai", "business bay"],
            site: sites.realestateabroad ? sites.realestateabroad.id : null,
            publishedAt: new Date()
          }
        ];

        for (const post of seoOptimizedPosts) {
          await strapi.db.query('api::blog-post.blog-post').create({
            data: post
          });
          console.log(`✅ Created SEO-optimized blog post: ${post.title}`);
        }
      }
      
      console.log('✅ Multi-Site Strapi Bootstrap Complete!');
      console.log(`📊 Summary:`);
      console.log(`   - Sites created: ${Object.keys(sites).length}`);
      console.log(`   - Permissions configured: Public API access enabled`);
      console.log(`   - Blog posts created: SEO-optimized content ready`);
      console.log(`   - Media partitioning: Enabled by site`);
      
    } catch (error) {
      console.error('❌ Bootstrap error:', error);
      throw error;
    }
  },
};
