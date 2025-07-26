/**
 * WebLinkCollector Filter Presets
 * This file contains predefined filter configurations for common use cases.
 */

import type { FilterConditions } from './types';

/**
 * Predefined filter presets for common web crawling scenarios
 */
export const FILTER_PRESETS: Record<string, FilterConditions> = {
  /**
   * Documentation-focused crawling
   * Targets documentation sites, API references, guides, and tutorials
   */
  documentation: [
    {
      domain: ['docs.github.com', 'developer.mozilla.org', 'docs.microsoft.com'],
      pathPrefix: ['/docs/', '/documentation/', '/api/', '/guide/', '/reference/'],
      keywords: ['doc', 'guide', 'tutorial', 'api', 'reference', 'manual', 'help'],
    },
  ],

  /**
   * GitHub-specific crawling
   * Focuses on repository pages, issues, pulls, and organizational content
   */
  github: [
    {
      domain: ['github.com'],
      pathPrefix: ['/repos/', '/orgs/', '/users/', '/issues/', '/pulls/', '/discussions/'],
    },
  ],

  /**
   * Blog and article content
   * Targets blog posts, news articles, and editorial content
   */
  blog: [
    {
      pathPrefix: ['/blog/', '/post/', '/article/', '/news/', '/story/'],
      keywords: ['blog', 'post', 'article', 'news', 'story', 'update'],
    },
  ],

  /**
   * E-commerce and product pages
   * Focuses on product listings, catalogs, and shopping-related content
   */
  ecommerce: [
    {
      pathPrefix: ['/product/', '/shop/', '/store/', '/catalog/', '/category/'],
      keywords: ['product', 'buy', 'shop', 'store', 'cart', 'price', 'order'],
    },
  ],

  /**
   * Social media platforms
   * Targets major social networking sites
   */
  social: [
    {
      domain: ['twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'instagram.com'],
    },
  ],

  /**
   * Media and file content
   * Targets images, videos, documents, and downloadable content
   */
  media: [
    {
      keywords: ['video', 'audio', 'image', 'media', 'gallery', 'photo'],
      regex: ['/\\.(jpg|jpeg|png|gif|svg|mp4|mp3|pdf|doc|docx)$/i'],
    },
  ],
};

/**
 * Type for available preset names
 */
export type PresetName = 'documentation' | 'github' | 'blog' | 'ecommerce' | 'social' | 'media';

/**
 * Helper function to get filter conditions for a preset
 * @param presetName - The name of the preset
 * @returns Filter conditions for the preset
 */
export function getPresetFilters(presetName: PresetName): FilterConditions {
  return FILTER_PRESETS[presetName] || [];
}

/**
 * Helper function to get all available preset names
 * @returns Array of all preset names
 */
export function getAvailablePresets(): PresetName[] {
  return Object.keys(FILTER_PRESETS) as PresetName[];
}

/**
 * Helper function to combine multiple presets
 * @param presetNames - Array of preset names to combine
 * @returns Combined filter conditions
 */
export function combinePresets(...presetNames: PresetName[]): FilterConditions {
  const combined: FilterConditions = [];
  for (const presetName of presetNames) {
    combined.push(...(FILTER_PRESETS[presetName] || []));
  }
  return combined;
}
