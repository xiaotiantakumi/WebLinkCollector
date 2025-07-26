/**
 * Argument parsing utilities for WLC CLI
 */

/**
 * Parsed command line arguments
 */
export interface ParsedArgs {
  plugin?: string;
  help?: boolean;
  remaining: string[];
}

/**
 * Parse command line arguments for top-level WLC commands
 * @param args Raw command line arguments
 * @returns Parsed arguments
 */
export function parseTopLevelArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    remaining: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) continue;

    if (arg === '-p' || arg === '--plugin') {
      i++; // Move to next argument
      const pluginName = args[i];
      if (!pluginName) {
        throw new Error('Plugin name is required after -p/--plugin flag');
      }
      result.plugin = pluginName;
    } else if ((arg === '-h' || arg === '--help') && !result.plugin) {
      // Only treat as general help if no plugin is specified yet
      result.help = true;
    } else {
      result.remaining.push(arg);
    }
  }

  return result;
}

/**
 * Plugin-specific argument parsing utilities
 */
export class PluginArgParser {
  private args: string[];
  private index = 0;

  constructor(args: string[]) {
    this.args = args;
  }

  /**
   * Check if there are more arguments to parse
   */
  hasMore(): boolean {
    return this.index < this.args.length;
  }

  /**
   * Get the current argument without advancing
   */
  current(): string | undefined {
    return this.args[this.index];
  }

  /**
   * Get the next argument and advance the index
   */
  next(): string | undefined {
    return this.args[this.index++];
  }

  /**
   * Parse a flag (returns true if present)
   */
  parseFlag(...flags: string[]): boolean {
    const current = this.current();
    if (current && flags.includes(current)) {
      this.index++;
      return true;
    }
    return false;
  }

  /**
   * Parse an option with a value
   */
  parseOption(...flags: string[]): string | undefined {
    const current = this.current();
    if (current && flags.includes(current)) {
      this.index++;
      return this.next();
    }
    return undefined;
  }

  /**
   * Parse a required option (throws if missing)
   */
  parseRequiredOption(name: string, ...flags: string[]): string {
    const value = this.parseOption(...flags);
    if (!value) {
      throw new Error(`Missing required option: ${name} (${flags.join(' or ')})`);
    }
    return value;
  }

  /**
   * Get all remaining unparsed arguments
   */
  remaining(): string[] {
    return this.args.slice(this.index);
  }

  /**
   * Reset parser to beginning
   */
  reset(): void {
    this.index = 0;
  }
}
