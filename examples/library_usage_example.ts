// examples/library_usage_example.ts
import { collectLinks } from '../src';

async function main() {
  try {
    const { allCollectedUrls } = await collectLinks('https://takumi-oda.com/blog/', {
      depth: 2,
      delayMs: 10,
      selector: '#list',
      logLevel: 'debug',
    });
    console.log('収集されたリンク:', allCollectedUrls);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

main();
