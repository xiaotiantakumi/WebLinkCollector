/**
 * Tests for configuration file loading
 */

import { loadConfig, mergeConfig } from '../../src/cli/configLoader';
import { describe, it, beforeEach, afterEach, expect } from 'bun:test';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('loadConfig', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-loader-test-'));
  });

  afterEach(async () => {
    // Clean up temporary files
    await fs.rmdir(tempDir, { recursive: true });
  });

  it('returns empty object if no file path is provided', async () => {
    const config = await loadConfig();
    expect(config).toEqual({});
  });

  it('returns empty object if empty string is provided', async () => {
    const config = await loadConfig('');
    expect(config).toEqual({});
  });

  it('loads configuration from a JSON file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const configPath = path.join(tempDir, 'config.json');

    await fs.writeFile(configPath, JSON.stringify(mockConfig));

    const config = await loadConfig(configPath);

    expect(config).toEqual(mockConfig);
  });

  it('loads configuration from a YAML file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const yamlContent = 'initialUrl: https://example.com\ndepth: 2';
    const configPath = path.join(tempDir, 'config.yaml');

    await fs.writeFile(configPath, yamlContent);

    const config = await loadConfig(configPath);

    expect(config).toEqual(mockConfig);
  });

  it('loads configuration from a YML file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const yamlContent = 'initialUrl: https://example.com\ndepth: 2';
    const configPath = path.join(tempDir, 'config.yml');

    await fs.writeFile(configPath, yamlContent);

    const config = await loadConfig(configPath);

    expect(config).toEqual(mockConfig);
  });

  it('handles file not found error gracefully', async () => {
    const nonexistentPath = path.join(tempDir, 'nonexistent.json');

    await expect(loadConfig(nonexistentPath)).rejects.toThrow('設定ファイルが見つかりません');
  });

  it('handles invalid JSON format error gracefully', async () => {
    const configPath = path.join(tempDir, 'invalid.json');
    await fs.writeFile(configPath, 'invalid json {');

    await expect(loadConfig(configPath)).rejects.toThrow('ファイルのJSON形式が無効です');
  });

  it('handles invalid YAML format error gracefully', async () => {
    const configPath = path.join(tempDir, 'invalid.yaml');
    await fs.writeFile(configPath, 'invalid:\n  - yaml\n - content');

    await expect(loadConfig(configPath)).rejects.toThrow('ファイルのYAML形式が無効です');
  });

  it('throws error for unsupported file format', async () => {
    const configPath = path.join(tempDir, 'config.txt');
    await fs.writeFile(configPath, 'some content');

    await expect(loadConfig(configPath)).rejects.toThrow('サポートされていないファイル形式');
  });

  it('validates that config is an object', async () => {
    const configPath = path.join(tempDir, 'config.json');
    await fs.writeFile(configPath, '"string value"');

    await expect(loadConfig(configPath)).rejects.toThrow(
      '設定ファイルは有効なオブジェクトである必要があります'
    );
  });
});

describe('mergeConfig', () => {
  it('merges CLI arguments with file configuration, with CLI taking precedence', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com',
      depth: 3,
    };

    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2,
      logLevel: 'debug',
    };

    const mergedConfig = mergeConfig(cliArgs, fileConfig);

    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 3, // CLI value takes precedence
      logLevel: 'debug', // Only in file config, so it's preserved
    });
  });

  it('does not override file config with undefined CLI values', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com',
      depth: undefined,
    };

    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2,
    };

    const mergedConfig = mergeConfig(cliArgs, fileConfig);

    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 2, // Undefined CLI value does not override file config
    });
  });

  it('retains all file config properties not specified in CLI args', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com',
    };

    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2,
      logLevel: 'debug',
      output: 'results.json',
    };

    const mergedConfig = mergeConfig(cliArgs, fileConfig);

    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 2, // Preserved from file config
      logLevel: 'debug', // Preserved from file config
      output: 'results.json', // Preserved from file config
    });
  });
});
