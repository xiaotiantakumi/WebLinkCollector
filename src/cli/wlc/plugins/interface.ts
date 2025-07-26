/**
 * Plugin interface definitions for WLC CLI system
 */

/**
 * Base interface for all WLC plugins
 */
export interface PluginHandler {
  /** Unique plugin name used for routing */
  readonly name: string;

  /** Human-readable description of the plugin */
  readonly description: string;

  /**
   * Execute the plugin with provided arguments
   * @param args Command line arguments (excluding -p <plugin>)
   * @returns Exit code (0 = success, >0 = error)
   */
  execute(args: string[]): Promise<number>;

  /**
   * Show help information for this plugin
   */
  showHelp(): void;
}

/**
 * Registry for managing plugin handlers
 */
export interface PluginRegistry {
  /**
   * Register a plugin handler
   * @param handler The plugin handler to register
   */
  register(handler: PluginHandler): void;

  /**
   * Get a plugin handler by name
   * @param name Plugin name
   * @returns The plugin handler or undefined if not found
   */
  get(name: string): PluginHandler | undefined;

  /**
   * Get all registered plugin names
   * @returns Array of plugin names
   */
  list(): string[];

  /**
   * Check if a plugin is registered
   * @param name Plugin name
   * @returns True if plugin is registered
   */
  has(name: string): boolean;
}

/**
 * Default implementation of PluginRegistry
 */
export class DefaultPluginRegistry implements PluginRegistry {
  private handlers = new Map<string, PluginHandler>();

  register(handler: PluginHandler): void {
    if (this.handlers.has(handler.name)) {
      throw new Error(`Plugin "${handler.name}" is already registered`);
    }
    this.handlers.set(handler.name, handler);
  }

  get(name: string): PluginHandler | undefined {
    return this.handlers.get(name);
  }

  list(): string[] {
    return Array.from(this.handlers.keys());
  }

  has(name: string): boolean {
    return this.handlers.has(name);
  }
}
