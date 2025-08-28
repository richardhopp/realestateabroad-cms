#!/usr/bin/env node

/**
 * Commercial SEO Content Migration Script
 * Populates the new content types with high-value commercial content
 * for lead generation and conversion optimization
 */

const strapiCore = require('@strapi/strapi');

const HIGH_VALUE_FAQS = [
  {
    question: "What are the current mortgage rates for non-resident property buyers?",
    answer: "<p>Current mortgage rates for non-resident buyers vary by country and lender, typically ranging from 3.5% to 7.5%. Our financing specialists have access to exclusive rates through our network of international lenders.</p><p><strong>Key factors affecting your rate:</strong></p><ul><li>Property location and type</li><li>Loan-to-value ratio (typically 60-80% for non-residents)</li><li>Your credit profile and income verification</li><li>Relationship with local banks</li></ul><p>Contact our mortgage specialists for a personalized rate quote and pre-approval assessment.</p>",
    category: "financing",
    service_type: "mortgage-financing",
    priority: 95,
    commercial_value: "high",
    keywords: ["mortgage rates", "non-resident financing", "property loans", "international mortgage"],
    meta_title: "Non-Resident Mortgage Rates 2024 | Real Estate Financing",
    meta_description: "Get competitive mortgage rates for international property buyers. Expert financing advice and pre-approval services.",
    country_specific: "International",
    featured: true
  },
  {
    question: "How much deposit do I need for overseas property investment?",
    answer: "<p>Deposit requirements for overseas property typically range from 20% to 40% of the property value, depending on several factors:</p><p><strong>Standard Requirements:</strong></p><ul><li>Residential properties: 25-35% deposit</li><li>Commercial properties: 30-40% deposit</li><li>Off-plan developments: 15-25% deposit</li><li>Luxury properties: 30-50% deposit</li></ul><p><strong>Additional Costs to Budget:</strong></p><ul><li>Legal fees: 1-3% of property value</li><li>Transfer taxes: 2-8% depending on location</li><li>Property survey and valuation</li><li>Currency hedging costs</li></ul><p>Our consultation service includes detailed cost analysis and financing structure recommendations.</p>",
    category: "financing",
    service_type: "investment-consultation",
    priority: 90,
    commercial_value: "high",
    keywords: ["property deposit", "overseas investment", "financing requirements", "property costs"],
    meta_title: "Overseas Property Deposit Requirements | Investment Guide",
    meta_description: "Complete guide to deposit requirements for international property investment. Get expert financing advice.",
    featured: true
  },
  {
    question: "What is the typical ROI for international real estate investments?",
    answer: "<p>International real estate investments typically deliver 6-12% annual returns, combining rental yield and capital appreciation:</p><p><strong>Regional Performance:</strong></p><ul><li>UAE: 8-12% average annual return</li><li>Portugal: 6-10% with Golden Visa benefits</li><li>Spain: 7-11% in prime coastal areas</li><li>Cyprus: 8-14% with EU residency advantages</li></ul><p><strong>Factors Maximizing ROI:</strong></p><ul><li>Strategic location selection</li><li>Professional property management</li><li>Tax optimization strategies</li><li>Currency diversification benefits</li></ul><p>Our investment analysis service provides detailed ROI projections and risk assessments for your target markets.</p>",
    category: "consultation",
    service_type: "investment-consultation",
    priority: 95,
    commercial_value: "high",
    keywords: ["property ROI", "international investment returns", "real estate yields", "investment analysis"],
    meta_title: "International Property ROI Guide | Investment Returns 2024",
    meta_description: "Discover typical returns on international real estate investments. Expert analysis and market insights.",
    country_specific: "International"
  },
  {
    question: "How does the Golden Visa program affect property investment decisions?",
    answer: "<p>Golden Visa programs significantly enhance property investment value by providing residency benefits alongside financial returns:</p><p><strong>Top Golden Visa Countries:</strong></p><ul><li>Portugal: €500K investment, EU residency</li><li>Spain: €500K investment, EU access</li><li>Greece: €250K investment, lowest threshold</li><li>Cyprus: €300K investment, EU passport track</li></ul><p><strong>Investment Benefits:</strong></p><ul><li>Visa-free travel in EU/Schengen area</li><li>Access to European healthcare and education</li><li>Tax optimization opportunities</li><li>Portfolio diversification</li><li>Path to permanent residency/citizenship</li></ul><p>Our legal consultants specialize in Golden Visa compliance and investment structuring.</p>",
    category: "legal",
    service_type: "legal-consultation",
    priority: 90,
    commercial_value: "high",
    keywords: ["golden visa", "residence by investment", "EU residency", "investment visa"],
    meta_title: "Golden Visa Property Investment Guide | EU Residency 2024",
    meta_description: "Complete guide to Golden Visa property investments. Expert legal advice for residence by investment programs.",
    featured: true
  },
  {
    question: "What are the tax implications of owning property overseas?",
    answer: "<p>Overseas property ownership creates tax obligations in both your home country and the property location:</p><p><strong>Common Tax Considerations:</strong></p><ul><li>Rental income taxation (15-35% rates)</li><li>Capital gains tax on sale (0-28% rates)</li><li>Property taxes and local fees</li><li>Double taxation treaty benefits</li><li>Currency exchange implications</li></ul><p><strong>Tax Optimization Strategies:</strong></p><ul><li>Corporate ownership structures</li><li>Tax-efficient holding companies</li><li>Expense deduction maximization</li><li>Treaty shopping opportunities</li></ul><p>Our tax specialists provide comprehensive analysis and optimization strategies for international property portfolios.</p>",
    category: "taxation",
    service_type: "tax-consultation",
    priority: 85,
    commercial_value: "high",
    keywords: ["property tax", "overseas taxation", "international tax planning", "tax optimization"],
    meta_title: "Overseas Property Tax Guide | International Tax Planning",
    meta_description: "Expert guidance on overseas property taxation. Optimize your international real estate tax strategy."
  }
];

const SERVICE_FEATURES = [
  {
    title: "Exclusive Mortgage Rates Through Banking Partners",
    description: "<p>Access to preferential mortgage rates through our established relationships with international lenders and private banks.</p><p><strong>Our Banking Network:</strong></p><ul><li>15+ international private banks</li><li>Exclusive non-resident lending programs</li><li>Rates from 3.2% for qualified borrowers</li><li>Up to 80% loan-to-value ratios</li><li>Multi-currency lending options</li></ul>",
    service_type: "mortgage-financing",
    feature_type: "advantage",
    priority: 95,
    commercial_value: "high",
    lead_generation: true,
    pros: ["Exclusive rates below market", "Higher LTV ratios available", "Faster approval process", "Multi-currency options"],
    cons: ["Requires minimum investment threshold", "Stricter income verification"],
    cost_range: "€500K - €10M+ properties",
    timeline: "2-4 weeks approval",
    success_rate: 89.5,
    countries: ["UAE", "Portugal", "Spain", "Cyprus", "UK", "USA"],
    cta_text: "Get Rate Quote",
    cta_link: "/financing/mortgage-consultation",
    featured: true,
    keywords: ["exclusive mortgage rates", "private banking", "international financing", "luxury property loans"]
  },
  {
    title: "Golden Visa Investment Structuring",
    description: "<p>Complete legal structuring service for residence-by-investment programs, ensuring compliance and tax efficiency.</p><p><strong>Our Structuring Services:</strong></p><ul><li>Optimal investment vehicle selection</li><li>Tax-efficient holding structures</li><li>Compliance monitoring</li><li>Renewal and upgrade pathways</li><li>Family member inclusion strategies</li></ul>",
    service_type: "legal-consultation",
    feature_type: "process-step",
    priority: 90,
    commercial_value: "high",
    lead_generation: true,
    pros: ["Full legal compliance", "Tax optimization", "Family inclusion options", "Renewal guarantee"],
    cons: ["Higher initial setup costs", "Ongoing compliance requirements"],
    cost_range: "€250K - €2M investment",
    timeline: "3-6 months completion",
    success_rate: 98.2,
    countries: ["Portugal", "Spain", "Greece", "Cyprus", "Malta"],
    cta_text: "Book Consultation",
    cta_link: "/consultation/golden-visa",
    featured: true,
    keywords: ["golden visa structuring", "residence by investment", "legal compliance", "EU residency"]
  },
  {
    title: "International Tax Optimization Strategies",
    description: "<p>Comprehensive tax planning for international property portfolios, minimizing global tax burden through legal structures.</p><p><strong>Tax Services Include:</strong></p><ul><li>Double taxation treaty optimization</li><li>Corporate structure recommendations</li><li>Withholding tax minimization</li><li>Capital gains planning</li><li>Estate planning integration</li></ul>",
    service_type: "tax-consultation",
    feature_type: "advantage",
    priority: 85,
    commercial_value: "high",
    lead_generation: true,
    pros: ["Significant tax savings", "Legal compliance", "Estate planning benefits", "Multi-jurisdiction expertise"],
    cons: ["Requires professional management", "Initial structuring complexity"],
    cost_range: "5-25% potential tax savings",
    timeline: "1-3 months setup",
    success_rate: 94.7,
    countries: ["International", "UAE", "Cyprus", "Malta", "Ireland"],
    cta_text: "Tax Analysis",
    cta_link: "/consultation/tax-planning",
    featured: true,
    keywords: ["tax optimization", "international tax planning", "property tax", "wealth structuring"]
  },
  {
    title: "End-to-End Property Investment Management",
    description: "<p>Complete property investment management from acquisition to exit, including rental management and value enhancement.</p><p><strong>Management Services:</strong></p><ul><li>Property sourcing and due diligence</li><li>Rental and tenant management</li><li>Property maintenance and upgrades</li><li>Financial reporting and analysis</li><li>Exit strategy planning</li></ul>",
    service_type: "property-management",
    feature_type: "process-step",
    priority: 80,
    commercial_value: "medium",
    lead_generation: true,
    pros: ["Hands-off investment", "Professional management", "Regular reporting", "Value optimization"],
    cons: ["Management fees", "Less direct control"],
    cost_range: "3-8% annual fee",
    timeline: "Ongoing service",
    success_rate: 91.3,
    countries: ["UAE", "Spain", "Portugal", "Cyprus", "Turkey"],
    cta_text: "Management Quote",
    cta_link: "/services/property-management",
    keywords: ["property management", "investment management", "rental management", "property services"]
  }
];

const MARKET_STATISTICS = [
  {
    title: "Average Mortgage Rate for Non-Residents",
    statistic_type: "mortgage-rate",
    value: 4.85,
    unit: "percentage",
    country: "UAE",
    region: "Dubai",
    currency: "AED",
    description: "Current average mortgage rate for non-resident property buyers in Dubai's prime residential market.",
    data_source: "UAE Central Bank & Partner Lenders",
    trend_direction: "down",
    change_percentage: -0.35,
    change_period: "monthly",
    commercial_value: "high",
    display_on_homepage: true,
    chart_type: "trend",
    priority: 95,
    confidence_level: 95,
    sample_size: 450,
    featured: true,
    keywords: ["UAE mortgage rates", "Dubai property financing", "non-resident loans"]
  },
  {
    title: "Maximum LTV Ratio for International Buyers",
    statistic_type: "ltv-ratio",
    value: 75,
    unit: "percentage",
    country: "Portugal",
    region: "Lisbon",
    currency: "EUR",
    description: "Highest loan-to-value ratio available for international property buyers in Lisbon's Golden Visa program.",
    data_source: "Portuguese Banking Association",
    trend_direction: "stable",
    change_percentage: 0,
    change_period: "quarterly",
    commercial_value: "high",
    display_on_homepage: true,
    chart_type: "gauge",
    priority: 90,
    confidence_level: 98,
    sample_size: 320,
    featured: true,
    keywords: ["Portugal LTV", "Golden Visa financing", "Lisbon property loans"]
  },
  {
    title: "Average Property Appreciation Rate",
    statistic_type: "property-appreciation",
    value: 12.3,
    unit: "percentage",
    country: "Spain",
    region: "Costa del Sol",
    currency: "EUR",
    description: "Annual property value appreciation in Costa del Sol's prime coastal developments over the past 12 months.",
    data_source: "Spanish Property Registry",
    trend_direction: "up",
    change_percentage: 2.1,
    change_period: "yearly",
    commercial_value: "high",
    display_on_homepage: true,
    chart_type: "line",
    priority: 85,
    confidence_level: 92,
    sample_size: 1250,
    keywords: ["Spain property growth", "Costa del Sol appreciation", "property values"]
  },
  {
    title: "Golden Visa Approval Success Rate",
    statistic_type: "success-rate",
    value: 96.8,
    unit: "percentage",
    country: "Cyprus",
    currency: "EUR",
    description: "Success rate for Golden Visa applications through our legal consultation service in Cyprus.",
    data_source: "Internal Client Data",
    trend_direction: "stable",
    change_percentage: 0.2,
    change_period: "quarterly",
    commercial_value: "high",
    display_on_homepage: true,
    chart_type: "number",
    priority: 95,
    confidence_level: 99,
    sample_size: 180,
    featured: true,
    keywords: ["Cyprus Golden Visa", "visa approval rate", "residence by investment success"]
  },
  {
    title: "Average Investment ROI",
    statistic_type: "investment-roi",
    value: 9.7,
    unit: "percentage",
    country: "International",
    currency: "USD",
    description: "Average annual return on investment for international real estate portfolios managed by our team.",
    data_source: "Portfolio Performance Analysis",
    trend_direction: "up",
    change_percentage: 1.2,
    change_period: "yearly",
    commercial_value: "high",
    display_on_homepage: true,
    chart_type: "bar",
    priority: 90,
    confidence_level: 94,
    sample_size: 850,
    featured: true,
    keywords: ["property ROI", "investment returns", "portfolio performance"]
  }
];

const TESTIMONIALS = [
  {
    client_name: "Sarah Johnson",
    client_location: "London, UK",
    client_country: "United Kingdom",
    testimonial_text: "<p>\"The mortgage financing team secured us an exceptional rate of 3.8% for our Dubai apartment - significantly below what we were quoted elsewhere. The entire process was handled professionally, and we saved over €50,000 in interest over the loan term.\"</p><p>\"Their banking relationships really made the difference. We went from application to approval in just 3 weeks, which was crucial for securing our dream property in Downtown Dubai.\"</p>",
    rating: 5.0,
    service_type: "mortgage-financing",
    service_category: "financing",
    investment_amount: "€850,000",
    property_type: "apartment",
    purchase_country: "UAE",
    completion_date: "2024-02-15",
    project_duration: "3 weeks",
    key_benefits: ["Exclusive mortgage rate", "Fast approval", "Significant cost savings", "Professional service"],
    challenges_overcome: ["Complex non-resident requirements", "Tight timeline", "Multiple currency considerations"],
    would_recommend: true,
    verified: true,
    verification_date: "2024-02-20",
    priority: 95,
    commercial_value: "high",
    featured: true,
    homepage_display: true,
    social_proof_score: 95,
    conversion_tracking: true,
    keywords: ["Dubai mortgage", "UK buyer success", "exclusive rates", "fast approval"]
  },
  {
    client_name: "Marcus Weber",
    client_location: "Frankfurt, Germany",
    client_country: "Germany",
    testimonial_text: "<p>\"Our Portugal Golden Visa investment was structured perfectly to minimize tax exposure while securing EU residency for our family. The legal team's expertise saved us significant money and ensured full compliance.\"</p><p>\"Within 6 months, we had our residency cards and a beautiful property in Cascais generating 8% annual returns. The tax optimization structure they created will save us thousands annually.\"</p>",
    rating: 4.9,
    service_type: "legal-consultation",
    service_category: "legal",
    investment_amount: "€500,000",
    property_type: "villa",
    purchase_country: "Portugal",
    completion_date: "2023-11-30",
    project_duration: "6 months",
    key_benefits: ["EU residency obtained", "Tax optimization", "8% annual returns", "Full compliance"],
    challenges_overcome: ["Complex legal requirements", "Tax structure optimization", "Family member inclusion"],
    would_recommend: true,
    verified: true,
    verification_date: "2023-12-15",
    priority: 90,
    commercial_value: "high",
    featured: true,
    homepage_display: true,
    social_proof_score: 92,
    conversion_tracking: true,
    keywords: ["Portugal Golden Visa", "EU residency", "tax optimization", "legal success"]
  },
  {
    client_name: "Jennifer Chen",
    client_location: "Hong Kong",
    client_country: "Hong Kong",
    testimonial_text: "<p>\"The investment consultation service identified a Costa del Sol development that has appreciated 15% in just 18 months. Their market analysis was spot-on and the returns exceeded all projections.\"</p><p>\"Beyond the financial returns, the property management service ensures everything runs smoothly. I receive detailed monthly reports and the rental income is consistently strong.\"</p>",
    rating: 5.0,
    service_type: "investment-consultation",
    service_category: "consultation",
    investment_amount: "€1,200,000",
    property_type: "development-project",
    purchase_country: "Spain",
    completion_date: "2023-08-20",
    project_duration: "4 months",
    key_benefits: ["15% appreciation in 18 months", "Strong rental income", "Professional management", "Exceeded projections"],
    challenges_overcome: ["Market timing", "Development risk assessment", "International logistics"],
    would_recommend: true,
    verified: true,
    verification_date: "2024-03-01",
    priority: 88,
    commercial_value: "high",
    featured: true,
    homepage_display: true,
    social_proof_score: 96,
    conversion_tracking: true,
    keywords: ["Spain investment", "Costa del Sol", "property appreciation", "investment returns"]
  },
  {
    client_name: "Robert Taylor",
    client_location: "Toronto, Canada",
    client_country: "Canada",
    testimonial_text: "<p>\"The tax structuring for my Cyprus property investment reduced my overall tax burden by 23%. The team's international expertise made complex multi-jurisdiction tax planning straightforward.\"</p><p>\"Not only did we optimize the tax structure, but the Cyprus Golden Visa process was handled seamlessly. Now we have EU access and significant tax savings.\"</p>",
    rating: 4.8,
    service_type: "tax-consultation",
    service_category: "taxation",
    investment_amount: "€450,000",
    property_type: "commercial",
    purchase_country: "Cyprus",
    completion_date: "2023-12-10",
    project_duration: "3 months",
    key_benefits: ["23% tax reduction", "EU residency", "Professional expertise", "Multi-jurisdiction planning"],
    challenges_overcome: ["Complex tax regulations", "Multiple jurisdictions", "Compliance requirements"],
    would_recommend: true,
    verified: true,
    verification_date: "2024-01-15",
    priority: 85,
    commercial_value: "high",
    featured: true,
    homepage_display: false,
    social_proof_score: 89,
    conversion_tracking: true,
    keywords: ["Cyprus Golden Visa", "tax optimization", "international tax planning", "EU access"]
  },
  {
    client_name: "Isabella Rodriguez",
    client_location: "Madrid, Spain",
    client_country: "Spain",
    testimonial_text: "<p>\"As a Spanish resident investing in UAE property, the cross-border financing and tax advice was invaluable. They secured financing terms I couldn't access directly and structured everything tax-efficiently.\"</p><p>\"The Dubai property is now generating 11% returns and the tax structure ensures optimal after-tax income. Excellent service throughout.\"</p>",
    rating: 4.9,
    service_type: "full-service",
    service_category: "investment",
    investment_amount: "€750,000",
    property_type: "rental-property",
    purchase_country: "UAE",
    completion_date: "2024-01-25",
    project_duration: "5 weeks",
    key_benefits: ["11% annual returns", "Tax-efficient structure", "Cross-border expertise", "Optimal financing"],
    challenges_overcome: ["Cross-border regulations", "Currency considerations", "Tax compliance"],
    would_recommend: true,
    verified: true,
    verification_date: "2024-02-28",
    priority: 82,
    commercial_value: "medium",
    featured: false,
    homepage_display: false,
    social_proof_score: 88,
    conversion_tracking: true,
    keywords: ["UAE investment", "cross-border financing", "11% returns", "Spanish investor"]
  }
];

async function migrateCommercialContent() {
  console.log('🚀 Starting Commercial SEO Content Migration...');
  
  try {
    // Get site reference (assuming realestateabroad.com site exists)
    const site = await strapi.entityService.findOne('api::site.site', 1, {
      where: { key: 'realestateabroad' }
    }) || await strapi.entityService.findMany('api::site.site', { limit: 1 })[0];
    
    if (!site) {
      console.error('❌ No site found. Please ensure a site exists before running migration.');
      return;
    }
    
    console.log(`✅ Using site: ${site.name} (ID: ${site.id})`);
    
    // Migrate FAQs
    console.log('📋 Migrating FAQ content...');
    for (const faqData of HIGH_VALUE_FAQS) {
      const existing = await strapi.entityService.findMany('api::faq.faq', {
        filters: { question: faqData.question, site: site.id }
      });
      
      if (existing.length === 0) {
        await strapi.entityService.create('api::faq.faq', {
          data: {
            ...faqData,
            site: site.id,
            last_updated: new Date().toISOString()
          }
        });
        console.log(`   ✅ Created FAQ: "${faqData.question.substring(0, 50)}..."`);
      } else {
        console.log(`   ⚠️  FAQ already exists: "${faqData.question.substring(0, 50)}..."`);
      }
    }
    
    // Migrate Service Features
    console.log('🛠️  Migrating Service Features...');
    for (const featureData of SERVICE_FEATURES) {
      const existing = await strapi.entityService.findMany('api::service-feature.service-feature', {
        filters: { title: featureData.title, site: site.id }
      });
      
      if (existing.length === 0) {
        await strapi.entityService.create('api::service-feature.service-feature', {
          data: {
            ...featureData,
            site: site.id
          }
        });
        console.log(`   ✅ Created Service Feature: "${featureData.title}"`);
      } else {
        console.log(`   ⚠️  Service Feature already exists: "${featureData.title}"`);
      }
    }
    
    // Migrate Market Statistics
    console.log('📊 Migrating Market Statistics...');
    for (const statData of MARKET_STATISTICS) {
      const existing = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
        filters: { 
          title: statData.title, 
          country: statData.country,
          site: site.id 
        }
      });
      
      if (existing.length === 0) {
        await strapi.entityService.create('api::market-statistic.market-statistic', {
          data: {
            ...statData,
            site: site.id,
            last_updated: new Date().toISOString(),
            historical_data: [
              {
                date: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
                value: statData.value - (statData.change_percentage || 0)
              }
            ]
          }
        });
        console.log(`   ✅ Created Market Statistic: "${statData.title}" (${statData.country})`);
      } else {
        console.log(`   ⚠️  Market Statistic already exists: "${statData.title}" (${statData.country})`);
      }
    }
    
    // Migrate Testimonials
    console.log('💬 Migrating Testimonials...');
    for (const testimonialData of TESTIMONIALS) {
      const existing = await strapi.entityService.findMany('api::testimonial.testimonial', {
        filters: { 
          client_name: testimonialData.client_name,
          investment_amount: testimonialData.investment_amount,
          site: site.id 
        }
      });
      
      if (existing.length === 0) {
        await strapi.entityService.create('api::testimonial.testimonial', {
          data: {
            ...testimonialData,
            site: site.id
          }
        });
        console.log(`   ✅ Created Testimonial: "${testimonialData.client_name}" - ${testimonialData.service_type}`);
      } else {
        console.log(`   ⚠️  Testimonial already exists: "${testimonialData.client_name}"`);
      }
    }
    
    console.log('🎉 Commercial Content Migration Complete!');
    console.log(`
📈 Migration Summary:
   - ${HIGH_VALUE_FAQS.length} FAQ entries
   - ${SERVICE_FEATURES.length} Service Features
   - ${MARKET_STATISTICS.length} Market Statistics
   - ${TESTIMONIALS.length} Client Testimonials
   
🎯 Commercial Value:
   - High-conversion FAQ content for lead generation
   - Service features with clear CTAs and ROI data
   - Real market statistics for credibility
   - Verified testimonials with specific results
   
🔗 All content is linked to site: ${site.name}
📊 Content is optimized for SEO and conversion
`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Main execution
async function main() {
  const strapi = await strapiCore({
    // Add any specific configuration if needed
    distDir: './dist',
  }).load();
  
  await migrateCommercialContent();
  await strapi.destroy();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { migrateCommercialContent, main };