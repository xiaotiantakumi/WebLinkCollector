/**
 * WLC CLI Router
 * Main routing system for the plugin-based CLI
 */

import { DefaultPluginRegistry, type PluginRegistry } from './plugins/interface.js';
import { FormatPlugin } from './plugins/format.js';
import { parseTopLevelArgs } from './utils/args.js';
import { showGeneralHelp, showError, suggestPlugins } from './utils/help.js';

/**
 * Main router for WLC CLI system
 */
export class WLCRouter {
  private registry: PluginRegistry;

  constructor(registry?: PluginRegistry) {
    this.registry = registry ?? new DefaultPluginRegistry();
    this.registerBuiltinPlugins();
  }

  /**
   * Run the CLI with provided arguments
   * @param args Command line arguments (without node/script name)
   * @returns Exit code
   */
  async run(args: string[]): Promise<number> {
    try {
      const parsed = parseTopLevelArgs(args);

      // Show general help
      if (parsed.help && !parsed.plugin) {
        showGeneralHelp(this.registry);
        return 0;
      }

      // Plugin must be specified
      if (!parsed.plugin) {
        showError('No plugin specified', ['Use -p <plugin> to specify a plugin']);
        return 1;
      }

      // Get plugin handler
      const handler = this.registry.get(parsed.plugin);
      if (!handler) {
        const suggestions = suggestPlugins(parsed.plugin, this.registry);
        showError(`Unknown plugin: ${parsed.plugin}`, suggestions);
        return 1;
      }

      // Execute plugin
      return await handler.execute(parsed.remaining);
    } catch (error) {
      showError(error instanceof Error ? error.message : String(error));
      return 2;
    }
  }

  /**
   * Get the plugin registry (for testing and advanced usage)
   */
  getRegistry(): PluginRegistry {
    return this.registry;
  }

  /**
   * Register built-in plugins
   */
  private registerBuiltinPlugins(): void {
    this.registry.register(new FormatPlugin());
  }
}
