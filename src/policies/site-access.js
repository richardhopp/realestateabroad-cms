'use strict';

/**
 * Site-based access control policy
 * Ensures users can only access content from sites they have permissions for
 */

module.exports = async (policyContext, config, { strapi }) => {
  const { user } = policyContext.state;

  // Allow public access for now - can be enhanced later
  if (!user) {
    return true;
  }

  // Super admin can access everything
  if (user.role && user.role.type === 'super-admin') {
    return true;
  }

  // Extract site information from request
  const siteKey = policyContext.query?.site || 'realestateabroad';

  try {
    // Find the site
    const site = await strapi.service('api::site.site').findByKey(siteKey);
    
    if (!site) {
      return false;
    }

    // For now, allow access to active sites
    // This can be enhanced to check user permissions per site
    return site.active;

  } catch (error) {
    strapi.log.error('Site access policy error:', error);
    return false;
  }
};