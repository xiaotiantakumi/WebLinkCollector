/**
 * Tests for CLI argument parsing using yargs.
 */

import { parseCliArgs } from '../../src/cli/args';
import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from 'bun:test';
import * as configLoader from '../../src/cli/configLoader';

// Helper function to simulate process.argv
const mockProcessArgv = (args: string[]) => {
  const originalArgv = process.argv;
  Object.defineProperty(process, 'argv', {
    value: ['node', 'web-link-collector', ...args],
    configurable: true,
  });

  // 後で元に戻せるようにするための関数を返す
  return () => {
    Object.defineProperty(process, 'argv', {
      value: originalArgv,
      configurable: true,
    });
  };
};

// Mock console.error to capture error messages from yargs
const mockConsoleError = mock(() => {});

describe('parseCliArgs', () => {
  let restoreArgv: () => void;
  let loadConfigSpy: any;
  let originalNodeEnv: string | undefined;
  let originalConsoleError: any;

  beforeEach(() => {
    // テスト環境であることを設定
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    // Suppress error output
    originalConsoleError = console.error;
    console.error = mockConsoleError as any;
    mockConsoleError.mockClear();

    // モックの設定
    loadConfigSpy = spyOn(configLoader, 'loadConfig');
    loadConfigSpy.mockImplementation(async () => ({}));
  });

  afterEach(() => {
    // テスト後に元のprocess.argvを復元
    if (restoreArgv) {
      restoreArgv();
    }

    // 環境変数を元に戻す
    process.env.NODE_ENV = originalNodeEnv;

    // Restore console.error
    console.error = originalConsoleError;

    // スパイの復元
    loadConfigSpy.mockRestore();
  });

  it('should parse the initialUrl argument correctly', async () => {
    restoreArgv = mockProcessArgv(['--initialUrl', 'https://example.com']);
    const args = await parseCliArgs();
    expect(args.initialUrl).toBe('https://example.com');
  });

  it('should parse optional arguments correctly', async () => {
    restoreArgv = mockProcessArgv([
      '--initialUrl',
      'https://example.com',
      '--depth',
      '3',
      '--format',
      'txt',
      '--output',
      'results.txt',
      '--selector',
      '.content a',
      '--delayMs',
      '500',
      '--logLevel',
      'debug',
      '--filters',
      '{"include":["test"]}',
    ]);
    const args = await parseCliArgs();
    expect(args.depth).toBe(3);
    expect(args.format).toBe('txt');
    expect(args.output).toBe('results.txt');
    expect(args.filters).toBe('{"include":["test"]}');
    expect(args.selector).toBe('.content a');
    expect(args.delayMs).toBe(500);
    expect(args.logLevel).toBe('debug');
  });

  it('should use default values for optional arguments if not provided', async () => {
    restoreArgv = mockProcessArgv(['--initialUrl', 'https://example.com']);
    const args = await parseCliArgs();
    expect(args.depth).toBe(1); // Default depth
    expect(args.format).toBe('json'); // Default format
    expect(args.logLevel).toBe('info'); // Default logLevel
    expect(args.delayMs).toBe(1000); // Default delayMs
  });

  it('should throw an error if initialUrl is missing', async () => {
    restoreArgv = mockProcessArgv([]);
    await expect(parseCliArgs()).rejects.toThrow('initialUrlは必須です');
  });

  it('should handle invalid depth value', async () => {
    restoreArgv = mockProcessArgv(['--initialUrl', 'https://example.com', '--depth', '10']);
    await expect(parseCliArgs()).rejects.toThrow();
  });

  it('should handle invalid format value', async () => {
    restoreArgv = mockProcessArgv(['--initialUrl', 'https://example.com', '--format', 'invalid']);
    await expect(parseCliArgs()).rejects.toThrow();
  });

  it('should handle invalid logLevel value', async () => {
    restoreArgv = mockProcessArgv(['--initialUrl', 'https://example.com', '--logLevel', 'invalid']);
    await expect(parseCliArgs()).rejects.toThrow();
  });

  it('should load config from file when configFile is provided', async () => {
    const mockConfig = {
      initialUrl: 'https://example-from-config.com',
      depth: 2,
    };
    loadConfigSpy.mockResolvedValue(mockConfig);

    restoreArgv = mockProcessArgv(['--configFile', 'config.test.yaml']);
    const args = await parseCliArgs();
    expect(loadConfigSpy).toHaveBeenCalledWith('config.test.yaml');
    // 設定ファイルの値はparse関数の返り値には含まれない（実際のマージはconfigLoader.mergeConfigで行われる）
    // ここではconfigFileパラメータが正しく設定されることだけを確認する
    expect(args.configFile).toBe('config.test.yaml');
  });

  it('should handle config file loading errors', async () => {
    loadConfigSpy.mockRejectedValue(new Error('File not found'));

    restoreArgv = mockProcessArgv(['--configFile', 'nonexistent.yaml']);
    await expect(parseCliArgs()).rejects.toThrow('設定ファイル読み込みエラー');
  });
});
