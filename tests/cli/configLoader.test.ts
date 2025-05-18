/**
 * Tests for configuration file loading
 */

import fs from 'fs/promises';
import yaml from 'js-yaml';
import { loadConfig, mergeConfig } from '../../src/cli/configLoader';
import { jest, describe, it, beforeEach, expect } from '@jest/globals';

// Set up manual mocks for fs and yaml
const mockReadFile = jest.fn();
const mockYamlLoad = jest.fn();

// Replace the actual functions with our mocks
fs.readFile = mockReadFile;
yaml.load = mockYamlLoad;

describe('loadConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty object if no file path is provided', async () => {
    const config = await loadConfig();
    expect(config).toEqual({});
  });

  it('loads configuration from a JSON file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const mockFileContent = JSON.stringify(mockConfig);

    mockReadFile.mockResolvedValue(mockFileContent);

    const config = await loadConfig('config.json');

    expect(config).toEqual(mockConfig);
    expect(mockReadFile).toHaveBeenCalledWith('config.json', 'utf8');
  });

  it('loads configuration from a YAML file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const mockFileContent = 'initialUrl: https://example.com\ndepth: 2';

    mockReadFile.mockResolvedValue(mockFileContent);
    mockYamlLoad.mockReturnValue(mockConfig);

    const config = await loadConfig('config.yaml');

    expect(config).toEqual(mockConfig);
    expect(mockReadFile).toHaveBeenCalledWith('config.yaml', 'utf8');
    expect(mockYamlLoad).toHaveBeenCalledWith(mockFileContent);
  });

  it('handles file not found error gracefully', async () => {
    const error = new Error('File not found');
    (error as NodeJS.ErrnoException).code = 'ENOENT';
    mockReadFile.mockRejectedValue(error);

    await expect(loadConfig('nonexistent.json')).rejects.toThrow('Configuration file not found');
  });

  it('handles invalid JSON format error gracefully', async () => {
    const error = new SyntaxError('Invalid JSON');
    mockReadFile.mockResolvedValue('invalid json');

    // Store original JSON.parse
    const originalJSONParse = JSON.parse;

    // Mock JSON.parse to throw an error
    JSON.parse = jest.fn().mockImplementation(() => {
      throw error;
    });

    try {
      await expect(loadConfig('invalid.json')).rejects.toThrow('Invalid JSON format');
    } finally {
      // Restore original JSON.parse
      JSON.parse = originalJSONParse;
    }
  });

  it('handles invalid YAML format error gracefully', async () => {
    const error = new Error('JS-YAML: bad indentation');
    mockReadFile.mockResolvedValue('invalid yaml');
    mockYamlLoad.mockImplementation(() => {
      throw error;
    });

    await expect(loadConfig('invalid.yaml')).rejects.toThrow('Invalid YAML format');
  });

  it('throws original error for other error types', async () => {
    const error = new Error('Unknown error');
    mockReadFile.mockRejectedValue(error);

    await expect(loadConfig('config.json')).rejects.toThrow('Unknown error');
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
