/**
 * WebLinkCollector CLI Argument Parsing
 * This module handles parsing command-line arguments.
 * Optimized for Bun runtime with enhanced performance and type safety.
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import type { LogLevel } from '../types';
import { loadConfig } from './configLoader';

/**
 * Interface for CLI arguments
 */
export interface CliArgs {
  initialUrl?: string;
  depth: number;
  filters?: string;
  filtersFile?: string;
  selector?: string;
  element?: string;
  delayMs: number;
  logLevel: LogLevel;
  output?: string;
  format: 'json' | 'txt';
  configFile?: string;
  $0: string;
  _: (string | number)[];
}

/**
 * Parses command line arguments with Bun optimization
 * @returns Promise resolving to the parsed arguments
 */
export const parseCliArgs = async (): Promise<CliArgs> => {
  // テスト環境の検出をより堅牢に
  const isTestEnvironment =
    process.env.NODE_ENV === 'test' ||
    process.env.BUN_ENV === 'test' ||
    process.argv.some(arg => arg.includes('jest') || arg.includes('test'));

  // 明示的に指定されたオプションを追跡するためのSet（パフォーマンス向上）
  const specifiedOptions = new Set<string>();

  // 引数の処理中にキャプチャするミドルウェア
  const trackSpecifiedOptions = (argv: any) => {
    Object.keys(argv).forEach(key => {
      if (key !== '_' && key !== '$0' && !key.startsWith('$')) {
        specifiedOptions.add(key);
      }
    });
    return argv;
  };

  const parser = yargs(hideBin(process.argv))
    .scriptName('web-link-collector')
    .usage('使用法: $0 --initialUrl <url> [オプション]')
    .option('initialUrl', {
      type: 'string',
      describe: 'リンク収集の開始URL',
    })
    .option('depth', {
      type: 'number',
      describe: '最大再帰深度 (0-5)',
      default: 1,
      choices: [0, 1, 2, 3, 4, 5],
    })
    .option('filters', {
      type: 'string',
      describe: 'フィルタ条件のJSON文字列 (例: \'{"domain": "example.com"}\')',
    })
    .option('filtersFile', {
      type: 'string',
      describe: 'フィルタ条件を含むJSONまたはYAMLファイルのパス',
    })
    .option('selector', {
      type: 'string',
      describe: 'リンク抽出範囲を制限するCSSセレクタ（初期ページのみに適用）',
    })
    .option('element', {
      type: 'string',
      describe: 'リンク抽出の開始点として使用するHTMLタグ名 (例: main, article)',
    })
    .option('delayMs', {
      type: 'number',
      describe: 'リクエスト間の遅延時間（ミリ秒）',
      default: 1000,
    })
    .option('logLevel', {
      type: 'string',
      describe: 'ログレベル',
      choices: ['debug', 'info', 'warn', 'error', 'none'] as LogLevel[],
      default: 'info' as LogLevel,
    })
    .option('output', {
      type: 'string',
      describe: '出力ファイルパス（指定されない場合は標準出力）',
    })
    .option('format', {
      type: 'string',
      describe: '出力形式',
      choices: ['json', 'txt'],
      default: 'json',
    })
    .option('configFile', {
      type: 'string',
      describe: 'JSONまたはYAML設定ファイルのパス',
    })
    .middleware(trackSpecifiedOptions)
    .check(async argv => {
      if (argv.configFile) {
        try {
          const configFromFile = await loadConfig(argv.configFile as string);
          if (!argv.initialUrl && !configFromFile.initialUrl) {
            throw new Error('initialUrlは必須です。CLI引数または設定ファイルで指定してください。');
          }
        } catch (error: any) {
          throw new Error(`設定ファイル読み込みエラー: ${error.message}`);
        }
      } else if (!argv.initialUrl) {
        throw new Error('initialUrlは必須です。CLI引数または設定ファイルで指定してください。');
      }
      return true;
    })
    .example(
      '$0 --initialUrl https://example.com --depth 2',
      'example.comから深度2まででリンクを収集'
    )
    .example(
      '$0 --initialUrl https://example.com --filters \'{"domain": "example.com"}\'',
      'example.comドメインからのみリンクを収集'
    )
    .example('$0 --configFile config.yaml', 'YAMLファイルから設定を使用')
    .epilogue('詳細については、ドキュメントを参照してください')
    .help()
    .alias('help', 'h')
    .exitProcess(!isTestEnvironment); // テスト環境ではプロセスを終了しない

  try {
    const args = await parser.parse();

    // 明示的に指定されたオプションのみを含む新しいオブジェクトを作成
    const explicitArgs: Record<string, any> = {};
    specifiedOptions.forEach(key => {
      explicitArgs[key] = args[key];
    });

    // 特殊なプロパティを追加
    explicitArgs.$0 = args.$0;
    explicitArgs._ = args._;

    return explicitArgs as CliArgs;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`CLI引数解析エラー: ${error.message}`);
    }
    throw error;
  }
};
