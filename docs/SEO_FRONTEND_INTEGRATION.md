# SEO Frontend Integration Guide

This guide explains how to integrate the SEO-optimized Strapi CMS with your Next.js frontend to maintain perfect SEO performance during migration.

## 🎯 Overview

Your Strapi CMS now provides comprehensive SEO functionality including:
- Dynamic meta tag generation
- Structured data (Schema.org JSON-LD)
- XML sitemaps
- Canonical URLs
- Open Graph and Twitter Card data
- SEO-optimized content delivery

## 📡 API Endpoints

### Content with SEO Data
```javascript
// Get financing country with complete SEO data
GET /api/financing-countries/slug/{country-slug}?site={site-key}

// Response includes:
{
  "data": { /* content data */ },
  "meta": { /* SEO meta tags */ },
  "structuredData": { /* Schema.org JSON-LD */ }
}
```

### SEO-Specific Endpoints
```javascript
// Get meta tags only
GET /api/seo/meta/{content-type}/{id}?site={site-key}

// Get structured data
GET /api/seo/structured-data/{content-type}/{id}?site={site-key}

// Get XML sitemap
GET /api/seo/sitemap/{site-key}

// Get robots.txt
GET /api/seo/robots/{site-key}
```

## 🔧 Next.js Integration Examples

### 1. Dynamic Meta Tags in Pages

```tsx
// app/financing/[country]/page.tsx
import { Metadata } from 'next';

interface Props {
  params: { country: string };
}

// Generate metadata using Strapi SEO service
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/financing-countries/slug/${params.country}?site=${process.env.SITE_KEY}`
    );
    const { meta, structuredData } = await response.json();

    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords?.join(', '),
      authors: [{ name: meta.author }],
      robots: meta.robots,
      canonical: meta.canonical,
      openGraph: {
        title: meta.ogTitle,
        description: meta.ogDescription,
        url: meta.ogUrl,
        siteName: meta.ogSiteName,
        images: meta.ogImage ? [{ url: meta.ogImage }] : [],
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: meta.twitterTitle,
        description: meta.twitterDescription,
        images: meta.twitterImage ? [meta.twitterImage] : [],
        site: meta.twitterSite,
      },
      alternates: {
        canonical: meta.canonical,
      },
      other: {
        'structured-data': JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    console.error('Error fetching SEO metadata:', error);
    return {
      title: `Property Financing in ${params.country}`,
      description: 'Expert property financing and mortgage services.',
    };
  }
}

export default async function FinancingCountryPage({ params }: Props) {
  const response = await fetch(
    `${process.env.STRAPI_URL}/api/financing-countries/slug/${params.country}?site=${process.env.SITE_KEY}`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );
  
  const { data, structuredData } = await response.json();

  return (
    <>
      {/* Structured Data JSON-LD */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <main>
        <h1>{data.title || `Property Financing in ${data.name}`}</h1>
        <p>{data.description}</p>
        {/* Your page content */}
      </main>
    </>
  );
}
```

### 2. SEO Component for Consistent Implementation

```tsx
// components/seo/SeoHead.tsx
import { Metadata } from 'next';
import Script from 'next/script';

interface SeoHeadProps {
  meta: {
    title: string;
    description: string;
    canonical: string;
    keywords?: string[];
    ogTitle: string;
    ogDescription: string;
    ogUrl: string;
    ogImage?: string;
    twitterTitle: string;
    twitterDescription: string;
    robots: string;
  };
  structuredData?: object;
}

export function SeoHead({ meta, structuredData }: SeoHeadProps): Metadata {
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords?.join(', '),
    robots: meta.robots,
    canonical: meta.canonical,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: meta.ogUrl,
      images: meta.ogImage ? [{ url: meta.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
  };
}

// Structured Data Component
export function StructuredData({ data }: { data: object }) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
```

### 3. Sitemap Generation in Next.js

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const response = await fetch(
      `${process.env.STRAPI_URL}/api/seo/sitemap/${process.env.SITE_KEY}`
    );
    const xmlText = await response.text();
    
    // Parse XML and convert to Next.js sitemap format
    // This is handled by your Strapi backend, but you can also
    // generate it here if needed
    
    return [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      // Add more URLs dynamically from Strapi
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}
```

### 4. Robots.txt Generation

```tsx
// app/robots.ts
import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

## 🎨 SEO Best Practices Implementation

### 1. Header Structure Validation

```tsx
// components/content/HeaderStructure.tsx
interface HeaderStructureProps {
  h1: string;
  h2s: string[];
  content: string;
}

export function HeaderStructure({ h1, h2s, content }: HeaderStructureProps) {
  return (
    <article>
      <header>
        {/* Only one H1 per page */}
        <h1>{h1}</h1>
      </header>
      
      {h2s.map((h2, index) => (
        <section key={index}>
          <h2>{h2}</h2>
          {/* Section content */}
        </section>
      ))}
      
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
}
```

### 2. Image SEO Optimization

```tsx
// components/seo/SeoImage.tsx
import Image from 'next/image';

interface SeoImageProps {
  src: string;
  alt: string;
  title?: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function SeoImage({ src, alt, title, width, height, priority = false }: SeoImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
    />
  );
}
```

### 3. Internal Linking System

```tsx
// components/seo/InternalLinks.tsx
import Link from 'next/link';

interface InternalLinksProps {
  relatedContent: Array<{
    title: string;
    slug: string;
    type: 'financing' | 'consultation' | 'country' | 'city';
  }>;
}

export function InternalLinks({ relatedContent }: InternalLinksProps) {
  const getUrl = (item: { slug: string; type: string }) => {
    const urlMap = {
      financing: `/financing/${item.slug}`,
      consultation: `/consultation/${item.slug}`,
      country: `/for-sale/${item.slug}`,
      city: `/cities/${item.slug}`,
    };
    return urlMap[item.type] || `/${item.slug}`;
  };

  return (
    <nav aria-label="Related content">
      <h3>Related Information</h3>
      <ul>
        {relatedContent.map((item, index) => (
          <li key={index}>
            <Link href={getUrl(item)} title={`Learn more about ${item.title}`}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## 🔍 URL Slug Consistency

### Maintaining Exact URL Structure

```tsx
// lib/urlMapping.ts
export const URL_PATTERNS = {
  financing: '/financing/[country]',
  consultation: '/consultation/[country]', 
  forSale: '/for-sale/[country]',
  cities: '/for-sale/[country]/[city]',
} as const;

// Ensure URLs match exactly with existing structure
export function validateUrlStructure(pathname: string): boolean {
  const validPatterns = [
    /^\/financing\/[^\/]+$/,
    /^\/consultation\/[^\/]+$/,
    /^\/for-sale\/[^\/]+$/,
    /^\/for-sale\/[^\/]+\/[^\/]+$/,
  ];
  
  return validPatterns.some(pattern => pattern.test(pathname));
}
```

## 📊 Performance & Core Web Vitals

### 1. Image Optimization for CWV

```tsx
// next.config.js
module.exports = {
  images: {
    domains: ['your-strapi-domain.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },
  // Enable compression
  compress: true,
  // Optimize fonts
  optimizeFonts: true,
};
```

### 2. Content Caching Strategy

```tsx
// lib/cache.ts
export const CACHE_SETTINGS = {
  // Static content (countries, cities) - 1 hour
  static: { next: { revalidate: 3600 } },
  
  // Dynamic content (properties) - 5 minutes  
  dynamic: { next: { revalidate: 300 } },
  
  // SEO data - 30 minutes
  seo: { next: { revalidate: 1800 } },
};
```

## 🧪 Testing & Validation

### Run SEO Tests

```bash
# Test all SEO endpoints
npm run seo:validate

# Generate sitemaps locally
npm run seo:generate-sitemap

# Test specific content type
curl "http://localhost:1337/api/seo/meta/financing-country/1?site=realestateabroad"
```

### Frontend SEO Testing

```javascript
// tests/seo.test.js
describe('SEO Implementation', () => {
  test('Meta tags are present', async () => {
    const response = await fetch('/financing/spain');
    const html = await response.text();
    
    expect(html).toContain('<title>');
    expect(html).toContain('name="description"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('application/ld+json');
  });
  
  test('Canonical URLs are correct', async () => {
    const response = await fetch('/financing/spain');
    const html = await response.text();
    
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('href="https://example.com/financing/spain"');
  });
});
```

## 🚀 Deployment Checklist

- [ ] Environment variables configured (`STRAPI_URL`, `SITE_KEY`, `NEXT_PUBLIC_BASE_URL`)
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] Robots.txt configured correctly  
- [ ] All meta tags rendering properly
- [ ] Structured data validation passes
- [ ] Core Web Vitals optimized
- [ ] URL structure matches existing patterns exactly
- [ ] Internal linking implemented
- [ ] Image alt tags and optimization in place
- [ ] SEO validation tests passing

## 📈 Monitoring & Maintenance

### Regular SEO Audits
1. Run `npm run seo:validate` before each deployment
2. Monitor Google Search Console for crawl errors
3. Test with Google Rich Results Test
4. Validate Core Web Vitals in production
5. Check for broken internal links monthly

### Performance Monitoring
- Use Lighthouse CI in your deployment pipeline
- Monitor Core Web Vitals with Real User Monitoring
- Track SEO performance metrics
- Regular content audits for SEO optimization

This integration ensures your high-value commercial pages ($30-50/click keywords) maintain perfect SEO performance during and after the Strapi migration.