/**
 * Tests for configuration file loading
 */

import fs from 'fs/promises';
import yaml from 'js-yaml';
import { loadConfig, mergeConfig } from '../../src/cli/configLoader';

// Mock fs/promises
jest.mock('fs/promises');

// Mock js-yaml
jest.mock('js-yaml');

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
    
    (fs.readFile as jest.Mock).mockResolvedValue(mockFileContent);
    
    const config = await loadConfig('config.json');
    
    expect(config).toEqual(mockConfig);
    expect(fs.readFile).toHaveBeenCalledWith('config.json', 'utf8');
  });
  
  it('loads configuration from a YAML file', async () => {
    const mockConfig = { initialUrl: 'https://example.com', depth: 2 };
    const mockFileContent = 'initialUrl: https://example.com\ndepth: 2';
    
    (fs.readFile as jest.Mock).mockResolvedValue(mockFileContent);
    (yaml.load as jest.Mock).mockReturnValue(mockConfig);
    
    const config = await loadConfig('config.yaml');
    
    expect(config).toEqual(mockConfig);
    expect(fs.readFile).toHaveBeenCalledWith('config.yaml', 'utf8');
    expect(yaml.load).toHaveBeenCalledWith(mockFileContent);
  });
  
  it('handles file not found error gracefully', async () => {
    const error = new Error('File not found');
    (error as NodeJS.ErrnoException).code = 'ENOENT';
    (fs.readFile as jest.Mock).mockRejectedValue(error);
    
    await expect(loadConfig('nonexistent.json')).rejects.toThrow('Configuration file not found');
  });
  
  it('handles invalid JSON format error gracefully', async () => {
    const error = new SyntaxError('Invalid JSON');
    (fs.readFile as jest.Mock).mockResolvedValue('invalid json');
    (JSON.parse as any) = jest.fn().mockImplementation(() => {
      throw error;
    });
    
    await expect(loadConfig('invalid.json')).rejects.toThrow('Invalid JSON format');
  });
  
  it('handles invalid YAML format error gracefully', async () => {
    const error = new Error('JS-YAML: bad indentation');
    (fs.readFile as jest.Mock).mockResolvedValue('invalid yaml');
    (yaml.load as jest.Mock).mockImplementation(() => {
      throw error;
    });
    
    await expect(loadConfig('invalid.yaml')).rejects.toThrow('Invalid YAML format');
  });
  
  it('throws original error for other error types', async () => {
    const error = new Error('Unknown error');
    (fs.readFile as jest.Mock).mockRejectedValue(error);
    
    await expect(loadConfig('config.json')).rejects.toThrow('Unknown error');
  });
});

describe('mergeConfig', () => {
  it('merges CLI arguments with file configuration, with CLI taking precedence', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com',
      depth: 3
    };
    
    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2,
      logLevel: 'debug'
    };
    
    const mergedConfig = mergeConfig(cliArgs, fileConfig);
    
    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 3, // CLI value takes precedence
      logLevel: 'debug' // Only in file config, so it's preserved
    });
  });
  
  it('does not override file config with undefined CLI values', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com',
      depth: undefined
    };
    
    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2
    };
    
    const mergedConfig = mergeConfig(cliArgs, fileConfig);
    
    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 2 // Undefined CLI value does not override file config
    });
  });
  
  it('retains all file config properties not specified in CLI args', () => {
    const cliArgs = {
      initialUrl: 'https://cli.example.com'
    };
    
    const fileConfig = {
      initialUrl: 'https://file.example.com',
      depth: 2,
      logLevel: 'debug',
      output: 'results.json'
    };
    
    const mergedConfig = mergeConfig(cliArgs, fileConfig);
    
    expect(mergedConfig).toEqual({
      initialUrl: 'https://cli.example.com', // CLI value takes precedence
      depth: 2, // Preserved from file config
      logLevel: 'debug', // Preserved from file config
      output: 'results.json' // Preserved from file config
    });
  });
});