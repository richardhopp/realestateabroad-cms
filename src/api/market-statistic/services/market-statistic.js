'use strict';

/**
 * market-statistic service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::market-statistic.market-statistic', ({ strapi }) => ({
  /**
   * Get current market snapshot for a country
   */
  async getMarketSnapshot(country, siteKey = null) {
    const filters = {
      country: { $eqi: country },
      ...(siteKey && { site: { key: siteKey } })
    };

    const statistics = await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['statistic_type:asc', 'priority:desc']
    });

    // Group by statistic type for easy consumption
    const snapshot = {};
    statistics.forEach(stat => {
      if (!snapshot[stat.statistic_type]) {
        snapshot[stat.statistic_type] = [];
      }
      snapshot[stat.statistic_type].push(stat);
    });

    return snapshot;
  },

  /**
   * Get high-value statistics for commercial pages
   */
  async getCommercialStats(siteKey, commercialValue = 'high') {
    return await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters: {
        commercial_value: commercialValue,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site'],
      sort: ['priority:desc', 'view_count:desc']
    });
  },

  /**
   * Get statistics with historical trends
   */
  async getHistoricalTrends(statisticType, country, siteKey = null) {
    const filters = {
      statistic_type: statisticType,
      country: { $eqi: country },
      historical_data: { $notNull: true },
      ...(siteKey && { site: { key: siteKey } })
    };

    return await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['last_updated:desc']
    });
  },

  /**
   * Update statistic value and calculate change
   */
  async updateStatisticValue(id, newValue, updateData = {}) {
    const currentStat = await strapi.entityService.findOne('api::market-statistic.market-statistic', id);
    
    if (!currentStat) {
      throw new Error('Statistic not found');
    }

    // Calculate change percentage
    const oldValue = currentStat.value;
    const changePercentage = oldValue ? ((newValue - oldValue) / oldValue) * 100 : 0;
    
    // Determine trend direction
    let trendDirection = 'stable';
    if (Math.abs(changePercentage) >= 1) { // 1% threshold
      trendDirection = changePercentage > 0 ? 'up' : 'down';
    }
    if (Math.abs(changePercentage) >= 10) { // 10% threshold for volatile
      trendDirection = 'volatile';
    }

    // Update historical data
    const historicalData = currentStat.historical_data || [];
    historicalData.push({
      date: currentStat.last_updated,
      value: oldValue
    });

    // Keep only last 12 data points
    if (historicalData.length > 12) {
      historicalData.shift();
    }

    return await strapi.entityService.update('api::market-statistic.market-statistic', id, {
      data: {
        value: newValue,
        change_percentage: changePercentage,
        trend_direction: trendDirection,
        historical_data: historicalData,
        last_updated: new Date().toISOString(),
        ...updateData
      }
    });
  },

  /**
   * Get featured statistics for dashboard widgets
   */
  async getFeaturedStats(siteKey = null, limit = 8) {
    return await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters: {
        featured: true,
        ...(siteKey && { site: { key: siteKey } })
      },
      populate: ['site'],
      sort: ['priority:desc', 'commercial_value:desc'],
      limit
    });
  },

  /**
   * Search statistics by keyword
   */
  async searchStatistics(searchTerm, siteKey = null) {
    const filters = {
      $or: [
        { title: { $containsi: searchTerm } },
        { description: { $containsi: searchTerm } },
        { keywords: { $containsi: searchTerm } },
        { country: { $containsi: searchTerm } }
      ]
    };

    if (siteKey) {
      filters.site = { key: siteKey };
    }

    return await strapi.entityService.findMany('api::market-statistic.market-statistic', {
      filters,
      populate: ['site'],
      sort: ['commercial_value:desc', 'view_count:desc']
    });
  },

  /**
   * Get statistics performance metrics
   */
  async getPerformanceMetrics(siteKey = null) {
    const baseFilters = siteKey ? { site: { key: siteKey } } : {};
    
    const [totalStats, highValueStats, trendingStats, mostViewed] = await Promise.all([
      // Total statistics count
      strapi.entityService.count('api::market-statistic.market-statistic', {
        filters: baseFilters
      }),
      
      // High commercial value statistics
      strapi.entityService.count('api::market-statistic.market-statistic', {
        filters: {
          ...baseFilters,
          commercial_value: 'high'
        }
      }),
      
      // Statistics with recent changes
      strapi.entityService.count('api::market-statistic.market-statistic', {
        filters: {
          ...baseFilters,
          trend_direction: { $in: ['up', 'down', 'volatile'] }
        }
      }),
      
      // Most viewed statistics
      strapi.entityService.findMany('api::market-statistic.market-statistic', {
        filters: baseFilters,
        populate: ['site'],
        sort: ['view_count:desc'],
        limit: 5
      })
    ]);

    return {
      total_statistics: totalStats,
      high_value_statistics: highValueStats,
      trending_statistics: trendingStats,
      most_viewed: mostViewed
    };
  }
}));