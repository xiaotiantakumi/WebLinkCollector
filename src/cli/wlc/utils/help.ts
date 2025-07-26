/**
 * Help system utilities for WLC CLI
 */

import type { PluginRegistry } from '../plugins/interface.js';

/**
 * Generate and display general help for WLC
 */
export function showGeneralHelp(registry: PluginRegistry): void {
  const plugins = registry.list();

  console.log(`WebLink Collector (wlc) - URL Processing Utilities

Usage: wlc -p <plugin> [options]

Plugins:`);

  plugins.forEach(pluginName => {
    const plugin = registry.get(pluginName);
    if (plugin) {
      console.log(`  ${pluginName.padEnd(12)} ${plugin.description}`);
    }
  });

  console.log(`
Options:
  -p, --plugin <name>    Plugin to execute
  -h, --help            Show this help message

Examples:
  wlc -p format --help                    Show format plugin help
  wlc -p format -i data.json -f notebooklm   Convert to NotebookLM format

For plugin-specific help, use: wlc -p <plugin> --help`);
}

/**
 * Display error message with suggestions
 */
export function showError(message: string, suggestions?: string[]): void {
  console.error(`Error: ${message}`);

  if (suggestions && suggestions.length > 0) {
    console.error('\nSuggestions:');
    suggestions.forEach(suggestion => {
      console.error(`  • ${suggestion}`);
    });
  }

  console.error(
    '\nUse "wlc --help" for general help or "wlc -p <plugin> --help" for plugin-specific help.'
  );
}

/**
 * Generate suggestions for unknown plugin names
 */
export function suggestPlugins(unknownPlugin: string, registry: PluginRegistry): string[] {
  const availablePlugins = registry.list();
  const suggestions: string[] = [];

  // Simple fuzzy matching - suggest plugins that contain the unknown plugin name
  availablePlugins.forEach(plugin => {
    if (plugin.includes(unknownPlugin) || unknownPlugin.includes(plugin)) {
      suggestions.push(`Use "wlc -p ${plugin}" instead`);
    }
  });

  if (suggestions.length === 0 && availablePlugins.length > 0) {
    suggestions.push(`Available plugins: ${availablePlugins.join(', ')}`);
  }

  return suggestions;
}
