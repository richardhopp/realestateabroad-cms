'use strict';

/**
 * SEO Service - Centralized SEO utilities and functions
 * Provides comprehensive SEO functionality across all content types
 */

module.exports = ({ strapi }) => ({
  
  /**
   * Generate comprehensive meta tags for any content type
   * @param {Object} content - Content object with meta fields
   * @param {Object} site - Site configuration
   * @param {string} contentType - Type of content (country, city, etc.)
   * @returns {Object} Complete meta tags object
   */
  async generateMetaTags(content, site, contentType) {
    try {
      const baseUrl = this.getCanonicalDomain(site);
      const metaTags = {
        // Basic meta tags
        title: this.generateTitle(content, site, contentType),
        description: this.generateDescription(content, site, contentType),
        keywords: this.generateKeywords(content, contentType),
        
        // Canonical URL
        canonical: `${baseUrl}${this.generateCanonicalPath(content, contentType)}`,
        
        // Open Graph tags
        ogTitle: this.generateOgTitle(content, site, contentType),
        ogDescription: this.generateOgDescription(content, site, contentType),
        ogUrl: `${baseUrl}${this.generateCanonicalPath(content, contentType)}`,
        ogType: this.getOgType(contentType),
        ogImage: this.generateOgImage(content, site),
        ogSiteName: site.name,
        ogLocale: 'en_US',
        
        // Twitter Card tags
        twitterCard: 'summary_large_image',
        twitterSite: site.meta_defaults?.twitter_handle || '',
        twitterTitle: this.generateTwitterTitle(content, site, contentType),
        twitterDescription: this.generateTwitterDescription(content, site, contentType),
        twitterImage: this.generateOgImage(content, site),
        
        // Additional SEO meta
        robots: this.generateRobots(content, contentType),
        author: site.name,
        publisher: site.name,
      };

      // Add hreflang for international content
      if (contentType === 'financing-country' || contentType === 'consultation-country') {
        metaTags.hreflang = this.generateHreflang(content, contentType);
      }

      return metaTags;
    } catch (error) {
      strapi.log.error('Error generating meta tags:', error);
      return this.getDefaultMetaTags(site);
    }
  },

  /**
   * Generate optimized page title
   */
  generateTitle(content, site, contentType) {
    if (content.meta_title) {
      return `${content.meta_title}${site.meta_defaults.meta_title_suffix || ''}`;
    }

    const titleMap = {
      'financing-country': () => `Property Financing in ${content.name} | Mortgage & Investment Loans`,
      'consultation-country': () => `Property Consultation ${content.name} | Real Estate Investment Guide`,
      'seo-country': () => `Properties for Sale in ${content.name} | Real Estate Investment`,
      'seo-city': () => `${content.name} Properties | Real Estate for Sale & Investment`,
      'faq': () => `${content.question} | Property Investment FAQ`
    };

    const titleGenerator = titleMap[contentType];
    const generatedTitle = titleGenerator ? titleGenerator() : content.title || content.name || 'Real Estate Investment';
    
    return `${generatedTitle}${site.meta_defaults.meta_title_suffix || ''}`;
  },

  /**
   * Generate optimized meta description
   */
  generateDescription(content, site, contentType) {
    if (content.meta_description) {
      return content.meta_description.substring(0, 160);
    }

    const descriptionMap = {
      'financing-country': () => 
        `Discover property financing options in ${content.name}. Expert mortgage advice, international loans, and investment financing solutions. Get your property loan approved today.`,
      'consultation-country': () => 
        `Expert property consultation for ${content.name} real estate investment. Market analysis, legal guidance, and investment strategies. Start your property journey today.`,
      'seo-country': () => 
        `Find premium properties for sale in ${content.name}. ${content.property_count || 'Thousands of'} listings with ${content.average_yield ? content.average_yield + '% average yield' : 'high returns'}.`,
      'seo-city': () => 
        `Discover ${content.name} real estate opportunities. ${content.property_count || 'Premium'} properties with expert guidance and market insights.`,
      'faq': () => 
        content.answer ? content.answer.substring(0, 155) + '...' : 'Expert answers to your property investment questions.'
    };

    const descriptionGenerator = descriptionMap[contentType];
    return descriptionGenerator ? descriptionGenerator() : (content.description || site.meta_defaults.meta_description || '').substring(0, 160);
  },

  /**
   * Generate SEO keywords
   */
  generateKeywords(content, contentType) {
    let keywords = [];
    
    // Use existing keywords if available
    if (content.keywords && Array.isArray(content.keywords)) {
      keywords = [...content.keywords];
    }

    // Add content-type specific keywords
    const keywordMap = {
      'financing-country': () => [
        `${content.name} property financing`, `${content.name} mortgage`, 'property investment loans',
        'international mortgage', 'real estate financing', `${content.name} property loans`
      ],
      'consultation-country': () => [
        `${content.name} property consultation`, `${content.name} real estate advice`, 'property investment consultation',
        'international property buying', `${content.name} property market`, 'real estate investment guide'
      ],
      'seo-country': () => [
        `${content.name} properties`, `${content.name} real estate`, 'property investment',
        `${content.name} property for sale`, 'international real estate', `${content.name} investment`
      ],
      'seo-city': () => [
        `${content.name} properties`, `${content.name} real estate`, `${content.name} investment`,
        content.country?.name ? `${content.country.name} property` : ''
      ].filter(Boolean)
    };

    const keywordGenerator = keywordMap[contentType];
    if (keywordGenerator) {
      keywords = [...keywords, ...keywordGenerator()];
    }

    return [...new Set(keywords)]; // Remove duplicates
  },

  /**
   * Generate canonical URL path
   */
  generateCanonicalPath(content, contentType) {
    const pathMap = {
      'financing-country': () => `/financing/${content.slug}`,
      'consultation-country': () => `/consultation/${content.slug}`,
      'seo-country': () => `/for-sale/${content.slug}`,
      'seo-city': () => content.country ? `/for-sale/${content.country.slug}/${content.slug}` : `/cities/${content.slug}`,
      'faq': () => `/faq/${content.id}`,
      'blog-post': () => `/blog/${content.slug}`
    };

    const pathGenerator = pathMap[contentType];
    return pathGenerator ? pathGenerator() : `/${content.slug || content.id}`;
  },

  /**
   * Generate Open Graph title
   */
  generateOgTitle(content, site, contentType) {
    return this.generateTitle(content, site, contentType);
  },

  /**
   * Generate Open Graph description
   */
  generateOgDescription(content, site, contentType) {
    return this.generateDescription(content, site, contentType);
  },

  /**
   * Generate Open Graph image
   */
  generateOgImage(content, site) {
    // Priority order: content specific image, site default, fallback
    if (content.hero_image_url) return content.hero_image_url;
    if (content.image_url) return content.image_url;
    if (content.flag_image_url) return content.flag_image_url;
    if (site.meta_defaults?.og_image) return site.meta_defaults.og_image;
    
    // Generate default og image URL based on site
    return `/api/og-image?site=${site.key}&title=${encodeURIComponent(content.name || content.title || 'Real Estate')}`;
  },

  /**
   * Get Open Graph type based on content type
   */
  getOgType(contentType) {
    const typeMap = {
      'blog-post': 'article',
      'faq': 'article',
      default: 'website'
    };
    
    return typeMap[contentType] || typeMap.default;
  },

  /**
   * Generate Twitter title
   */
  generateTwitterTitle(content, site, contentType) {
    return this.generateTitle(content, site, contentType);
  },

  /**
   * Generate Twitter description
   */
  generateTwitterDescription(content, site, contentType) {
    return this.generateDescription(content, site, contentType);
  },

  /**
   * Generate robots meta tag
   */
  generateRobots(content, contentType) {
    // Default to index, follow for published content
    if (content.publishedAt || content.published_at) {
      return 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    }
    
    return 'noindex, nofollow';
  },

  /**
   * Generate hreflang attributes for international content
   */
  generateHreflang(content, contentType) {
    // This would be expanded based on your multi-language setup
    return {
      'en': this.generateCanonicalPath(content, contentType),
      'x-default': this.generateCanonicalPath(content, contentType)
    };
  },

  /**
   * Get canonical domain for site
   */
  getCanonicalDomain(site) {
    if (site.domains && site.domains.length > 0) {
      const primaryDomain = site.domains.find(d => d.primary) || site.domains[0];
      return typeof primaryDomain === 'string' ? `https://${primaryDomain}` : `https://${primaryDomain.domain}`;
    }
    return 'https://example.com'; // fallback
  },

  /**
   * Generate default meta tags for error cases
   */
  getDefaultMetaTags(site) {
    return {
      title: `Real Estate Investment${site.meta_defaults?.meta_title_suffix || ''}`,
      description: site.meta_defaults?.meta_description || 'Find premium international real estate investment opportunities.',
      canonical: this.getCanonicalDomain(site),
      ogTitle: `Real Estate Investment | ${site.name}`,
      ogDescription: site.meta_defaults?.meta_description || 'Find premium international real estate investment opportunities.',
      ogSiteName: site.name,
      robots: 'index, follow'
    };
  },

  /**
   * Generate structured data (Schema.org JSON-LD)
   */
  async generateStructuredData(content, site, contentType) {
    const baseUrl = this.getCanonicalDomain(site);
    
    const schemaMap = {
      'financing-country': () => ({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `Property Financing in ${content.name}`,
        "description": this.generateDescription(content, site, contentType),
        "provider": {
          "@type": "Organization",
          "name": site.name,
          "url": baseUrl
        },
        "areaServed": {
          "@type": "Country",
          "name": content.name
        },
        "serviceType": "Real Estate Financing"
      }),
      
      'consultation-country': () => ({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `Property Consultation in ${content.name}`,
        "description": this.generateDescription(content, site, contentType),
        "provider": {
          "@type": "Organization",
          "name": site.name,
          "url": baseUrl
        },
        "areaServed": {
          "@type": "Country",
          "name": content.name
        },
        "serviceType": "Real Estate Consultation"
      }),
      
      'faq': () => ({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": {
          "@type": "Question",
          "name": content.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": content.answer
          }
        }
      }),
      
      'blog-post': () => ({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": content.title,
        "description": content.meta_description || content.description,
        "author": {
          "@type": "Organization",
          "name": site.name
        },
        "publisher": {
          "@type": "Organization",
          "name": site.name
        },
        "datePublished": content.publishedAt || content.createdAt,
        "dateModified": content.updatedAt
      })
    };

    const schemaGenerator = schemaMap[contentType];
    return schemaGenerator ? schemaGenerator() : null;
  },

  /**
   * Generate XML sitemap entries
   */
  async generateSitemapEntries(contentType, site) {
    try {
      const baseUrl = this.getCanonicalDomain(site);
      const service = strapi.service(`api::${contentType}.${contentType}`);
      const contents = await service.find({ 
        filters: { site: site.id },
        sort: 'updatedAt:desc'
      });

      return contents.results.map(content => ({
        loc: `${baseUrl}${this.generateCanonicalPath(content, contentType)}`,
        lastmod: content.updatedAt,
        changefreq: this.getChangeFreq(contentType),
        priority: this.getPriority(content, contentType)
      }));
    } catch (error) {
      strapi.log.error(`Error generating sitemap entries for ${contentType}:`, error);
      return [];
    }
  },

  /**
   * Get change frequency for sitemap
   */
  getChangeFreq(contentType) {
    const freqMap = {
      'financing-country': 'monthly',
      'consultation-country': 'monthly',
      'seo-country': 'weekly',
      'seo-city': 'weekly',
      'blog-post': 'monthly',
      'faq': 'monthly'
    };
    
    return freqMap[contentType] || 'monthly';
  },

  /**
   * Get priority for sitemap
   */
  getPriority(content, contentType) {
    // Featured content gets higher priority
    if (content.featured) return 0.9;
    
    const priorityMap = {
      'financing-country': 0.8,
      'consultation-country': 0.8,
      'seo-country': 0.7,
      'seo-city': 0.6,
      'blog-post': 0.5,
      'faq': 0.4
    };
    
    return priorityMap[contentType] || 0.5;
  }

});