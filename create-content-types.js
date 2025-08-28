#!/usr/bin/env node

/**
 * 🚀 CONTENT TYPE CREATOR - Programmatically create content types in development mode
 * This script creates the schema files that will be committed to git
 */

const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Write schema file
function writeSchema(apiName, schema) {
  const apiDir = path.join(__dirname, 'src', 'api', apiName);
  const contentTypesDir = path.join(apiDir, 'content-types', apiName);
  
  ensureDir(contentTypesDir);
  
  const schemaPath = path.join(contentTypesDir, 'schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
  
  console.log(`✅ Created schema: ${schemaPath}`);
}

// Create controller, service, and routes files
function createApiFiles(apiName, displayName) {
  const apiDir = path.join(__dirname, 'src', 'api', apiName);
  
  // Create controllers
  const controllersDir = path.join(apiDir, 'controllers');
  ensureDir(controllersDir);
  fs.writeFileSync(path.join(controllersDir, `${apiName}.js`), `'use strict';

/**
 * ${apiName} controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::${apiName}.${apiName}');
`);

  // Create services  
  const servicesDir = path.join(apiDir, 'services');
  ensureDir(servicesDir);
  fs.writeFileSync(path.join(servicesDir, `${apiName}.js`), `'use strict';

/**
 * ${apiName} service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::${apiName}.${apiName}');
`);

  // Create routes
  const routesDir = path.join(apiDir, 'routes');
  ensureDir(routesDir);
  fs.writeFileSync(path.join(routesDir, `${apiName}.js`), `'use strict';

/**
 * ${apiName} router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::${apiName}.${apiName}');
`);

  console.log(`✅ Created API files for: ${apiName}`);
}

// Schema definitions
const SEO_COUNTRY_SCHEMA = {
  kind: "collectionType",
  collectionName: "seo_countries",
  info: {
    singularName: "seo-country",
    pluralName: "seo-countries",
    displayName: "SEO Country",
    description: "SEO-optimized country pages for property listings"
  },
  options: {
    draftAndPublish: true,
    comment: ""
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: "string",
      required: true,
      unique: true,
      maxLength: 100
    },
    slug: {
      type: "uid",
      targetField: "name",
      required: true,
      unique: true
    },
    featured: {
      type: "boolean",
      default: false
    },
    meta_title: {
      type: "string",
      maxLength: 255
    },
    meta_description: {
      type: "text",
      maxLength: 500
    },
    keywords: {
      type: "json"
    },
    description: {
      type: "text"
    },
    hero_image_url: {
      type: "string"
    },
    flag_image_url: {
      type: "string"
    },
    why_invest: {
      type: "json"
    },
    property_count: {
      type: "integer",
      default: 0
    },
    average_price: {
      type: "integer",
      default: 0
    },
    average_yield: {
      type: "decimal",
      default: 0.0
    },
    currency: {
      type: "string"
    },
    timezone: {
      type: "string"
    },
    language: {
      type: "string"
    },
    capital: {
      type: "string"
    },
    continent: {
      type: "string"
    },
    investment_climate: {
      type: "string"
    },
    site: {
      type: "relation",
      relation: "manyToOne",
      target: "api::site.site",
      inversedBy: "seo_countries"
    }
  }
};

const SEO_CITY_SCHEMA = {
  kind: "collectionType",
  collectionName: "seo_cities",
  info: {
    singularName: "seo-city",
    pluralName: "seo-cities",
    displayName: "SEO City",
    description: "SEO-optimized city pages for property listings"
  },
  options: {
    draftAndPublish: true,
    comment: ""
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: "string",
      required: true,
      maxLength: 100
    },
    slug: {
      type: "uid",
      targetField: "name",
      required: true
    },
    featured: {
      type: "boolean",
      default: false
    },
    meta_title: {
      type: "string",
      maxLength: 255
    },
    meta_description: {
      type: "text",
      maxLength: 500
    },
    keywords: {
      type: "json"
    },
    description: {
      type: "text"
    },
    image_url: {
      type: "string"
    },
    property_count: {
      type: "integer",
      default: 0
    },
    average_price: {
      type: "integer", 
      default: 0
    },
    average_yield: {
      type: "decimal",
      default: 0.0
    },
    population: {
      type: "integer"
    },
    area_km2: {
      type: "decimal"
    },
    timezone: {
      type: "string"
    },
    coordinates: {
      type: "json"
    },
    investment_rating: {
      type: "string"
    },
    highlights: {
      type: "json"
    },
    amenities: {
      type: "json"
    },
    transport_links: {
      type: "json"
    },
    country: {
      type: "relation",
      relation: "manyToOne",
      target: "api::seo-country.seo-country",
      inversedBy: "cities"
    },
    site: {
      type: "relation",
      relation: "manyToOne", 
      target: "api::site.site",
      inversedBy: "seo_cities"
    }
  }
};

const FINANCING_COUNTRY_SCHEMA = {
  kind: "collectionType",
  collectionName: "financing_countries",
  info: {
    singularName: "financing-country",
    pluralName: "financing-countries", 
    displayName: "Financing Country",
    description: "Country-specific financing and mortgage information"
  },
  options: {
    draftAndPublish: true,
    comment: ""
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: "string",
      required: true,
      unique: true,
      maxLength: 100
    },
    slug: {
      type: "uid", 
      targetField: "name",
      required: true,
      unique: true
    },
    title: {
      type: "string"
    },
    description: {
      type: "text"
    },
    featured: {
      type: "boolean",
      default: false
    },
    meta_title: {
      type: "string",
      maxLength: 255
    },
    meta_description: {
      type: "text",
      maxLength: 500
    },
    keywords: {
      type: "json"
    },
    hero_image_url: {
      type: "string"
    },
    flag_image_url: {
      type: "string"
    },
    overview: {
      type: "text"
    },
    local_mortgages: {
      type: "json"
    },
    banks: {
      type: "json"
    },
    mortgage_rates: {
      type: "json"
    },
    site: {
      type: "relation",
      relation: "manyToOne",
      target: "api::site.site", 
      inversedBy: "financing_countries"
    }
  }
};

const CONSULTATION_COUNTRY_SCHEMA = {
  kind: "collectionType",
  collectionName: "consultation_countries",
  info: {
    singularName: "consultation-country",
    pluralName: "consultation-countries",
    displayName: "Consultation Country", 
    description: "Country-specific property consultation and buying guides"
  },
  options: {
    draftAndPublish: true,
    comment: ""
  },
  pluginOptions: {},
  attributes: {
    name: {
      type: "string",
      required: true,
      unique: true,
      maxLength: 100
    },
    slug: {
      type: "uid",
      targetField: "name", 
      required: true,
      unique: true
    },
    title: {
      type: "string"
    },
    description: {
      type: "text"
    },
    featured: {
      type: "boolean",
      default: false
    },
    meta_title: {
      type: "string",
      maxLength: 255
    },
    meta_description: {
      type: "text",
      maxLength: 500
    },
    keywords: {
      type: "json"
    },
    hero_image_url: {
      type: "string"
    },
    flag_image_url: {
      type: "string"
    },
    market_overview: {
      type: "text"
    },
    market_trends: {
      type: "json"
    },
    investment_rating: {
      type: "string"
    },
    risk_assessment: {
      type: "json"
    },
    legal_considerations: {
      type: "json"
    },
    buying_process: {
      type: "json"
    },
    site: {
      type: "relation",
      relation: "manyToOne",
      target: "api::site.site",
      inversedBy: "consultation_countries"
    }
  }
};

// Create all content types
function createAllContentTypes() {
  console.log('🚀 Creating Content Type Schemas...\n');

  // Create SEO Country
  writeSchema('seo-country', SEO_COUNTRY_SCHEMA);
  createApiFiles('seo-country', 'SEO Country');

  // Create SEO City
  writeSchema('seo-city', SEO_CITY_SCHEMA);
  createApiFiles('seo-city', 'SEO City');

  // Create Financing Country
  writeSchema('financing-country', FINANCING_COUNTRY_SCHEMA);
  createApiFiles('financing-country', 'Financing Country');

  // Create Consultation Country 
  writeSchema('consultation-country', CONSULTATION_COUNTRY_SCHEMA);
  createApiFiles('consultation-country', 'Consultation Country');

  console.log('\n✅ All Content Types Created!');
  console.log('\n⚠️ IMPORTANT: Restart Strapi to load new content types:');
  console.log('   Ctrl+C to stop, then npm run develop');
}

// Also update Site schema to include relationships back
function updateSiteSchema() {
  const siteSchemaPath = path.join(__dirname, 'src', 'api', 'site', 'content-types', 'site', 'schema.json');
  
  if (fs.existsSync(siteSchemaPath)) {
    const siteSchema = JSON.parse(fs.readFileSync(siteSchemaPath, 'utf8'));
    
    // Add relationships to SEO content types
    siteSchema.attributes.seo_countries = {
      type: "relation",
      relation: "oneToMany",
      target: "api::seo-country.seo-country",
      mappedBy: "site"
    };
    
    siteSchema.attributes.seo_cities = {
      type: "relation", 
      relation: "oneToMany",
      target: "api::seo-city.seo-city",
      mappedBy: "site"
    };
    
    siteSchema.attributes.financing_countries = {
      type: "relation",
      relation: "oneToMany",
      target: "api::financing-country.financing-country", 
      mappedBy: "site"
    };
    
    siteSchema.attributes.consultation_countries = {
      type: "relation",
      relation: "oneToMany",
      target: "api::consultation-country.consultation-country",
      mappedBy: "site"
    };

    fs.writeFileSync(siteSchemaPath, JSON.stringify(siteSchema, null, 2));
    console.log('✅ Updated Site schema with relationships');
  }
}

// Execute
createAllContentTypes();
updateSiteSchema();

console.log('\n🎯 Next Steps:');
console.log('1. Restart Strapi: Ctrl+C then npm run develop');  
console.log('2. Commit these changes to git');
console.log('3. Deploy to production');
console.log('4. Run data migration script');