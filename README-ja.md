# WebLinkCollector

[English](./README.md) | 日本語

Webページから再帰的にリンクを収集し、構造化データとして出力するライブラリおよびCLIツールです。

## 特徴

- 設定可能な深さまで再帰的にWebページをクロール（最大5階層）
- CSSセレクタを使用したHTML内のリンク抽出
- ドメイン、パスプレフィックス、正規表現パターン、キーワードによるURL絞り込み
- クエリパラメータやハッシュフラグメント内のURL除外機能
- JSON または プレーンテキスト形式での結果出力
- 設定可能なログレベルとリクエスト間隔
- JSON/YAMLファイルを用いた構成のサポート

## インストール

### グローバルインストール

```bash
npm install -g web-link-collector
```

### ローカルインストール

```bash
npm install web-link-collector
```

### CDNからの使用

```html
<script type="module">
  import { collectLinks } from 'https://cdn.jsdelivr.net/npm/web-link-collector@1.0.0/dist/index.js';

  // ライブラリの使用例
  async function main() {
    const results = await collectLinks('https://example.com', { depth: 1 });
    console.log(results);
  }
</script>
```

### 開発環境セットアップ

リポジトリをクローンして依存関係をインストール：

```bash
git clone https://github.com/yourusername/web-link-collector.git
cd web-link-collector
npm install
```

リントの実行：

```bash
npm run lint
```

テストの実行：

```bash
npm run test
```

プロジェクトのビルド：

```bash
npm run build
```

### npmへの公開

npmに新しいバージョンを公開するには、次の手順に従います：

1. `package.json`のバージョンを更新します：

```bash
npm version patch  # バグ修正の場合
npm version minor  # 新機能追加の場合
npm version major  # 破壊的変更の場合
```

2. npmに公開：

```bash
npm publish
```

パッケージは`prepublishOnly`スクリプトを通じて、公開前に自動的にリントとテストを実行します。

#### 利用可能なスクリプト

| スクリプト          | 説明                                   |
| ------------------- | -------------------------------------- |
| `npm run build`     | TypeScriptをJavaScriptにコンパイル     |
| `npm run test`      | すべてのテストを実行                   |
| `npm run test:core` | コア機能のテストを実行（`test`と同じ） |
| `npm run lint`      | リントの問題をチェック                 |
| `npm run lint:fix`  | リントの問題を自動修正                 |
| `npm run format`    | Prettierでコードをフォーマット         |
| `npm run check`     | リントとテストを実行                   |
| `npm run start`     | CLIツールを実行                        |

#### Gitフック

このプロジェクトはHuskyを使用してコード品質を強制し、以下のgitフックを実装しています：

- **pre-commit**: ステージングしたファイルに対してリント、フォーマット、テストを実行
- **pre-push**: 変更をプッシュする前にすべてのリントとテストが通ることを確認

## CLI使用方法

CLIツールの基本的な使用方法：

```bash
# グローバルインストールした場合
wlc collect https://example.com --depth 2

# ローカルでの開発時
bun run dev collect https://example.com --depth 2
```

### コマンド

`wlc` CLIは2つの主要なコマンドをサポートしています：

#### `wlc collect <url>` - ウェブページからリンクを収集

| オプション           | 説明                                                  | デフォルト |
| -------------------- | ----------------------------------------------------- | ---------- |
| `<url>`              | リンク収集の開始URL                                   | _必須_     |
| `--depth`, `-d`      | 最大再帰深度 (0-5)                                    | 1          |
| `--filters`          | フィルタ条件のJSON文字列                              | なし       |
| `--filtersFile`      | フィルタ条件を含むJSONまたはYAMLファイルへのパス      | なし       |
| `--selector`, `-s`   | リンク抽出範囲を制限するCSSセレクタ（初期ページのみ） | なし       |
| `--delayMs`          | リクエスト間の遅延（ミリ秒）                          | 1000       |
| `--logLevel`, `-l`   | ログレベル (debug, info, warn, error)                 | info       |
| `--output`, `-o`     | 出力ファイルパス（指定されない場合、標準出力へ出力）  | なし       |
| `--format`, `-f`     | 出力形式 (json, txt)                                  | json       |
| `--configFile`, `-c` | JSONまたはYAML設定ファイルへのパス                    | なし       |
| `--help`, `-h`       | ヘルプメッセージを表示                                | -          |

#### `wlc format` - 収集結果を各種フォーマットに変換

| オプション       | 説明                                                   | デフォルト |
| ---------------- | ------------------------------------------------------ | ---------- |
| `--input`, `-i`  | 入力JSONファイル（CollectionResult形式）               | _必須_     |
| `--output`, `-o` | 出力ディレクトリ                                       | _必須_     |
| `--format`, `-f` | 出力フォーマット（notebooklm）                         | _必須_     |
| `--separator`    | notebooklm用：区切り文字タイプ（space または newline） | newline    |
| `--filename`     | カスタム出力ファイル名（指定されない場合自動生成）     | なし       |
| `--help`, `-h`   | ヘルプメッセージを表示                                 | -          |

### 使用例

再帰深度2でウェブサイトからリンクを収集：

```bash
# グローバルインストールした場合
wlc collect https://example.com --depth 2

# ローカルでの開発時
bun run dev collect https://example.com --depth 2
```

指定したドメインからのリンクのみを収集：

```bash
# グローバルインストールした場合
wlc collect https://example.com --filters '{"domain": "example.com"}'

# ローカルでの開発時
bun run dev collect https://example.com --filters '{"domain": "example.com"}'
```

初期ページの特定セクションからのリンク抽出に制限：

```bash
# グローバルインストールした場合
wlc collect https://example.com --selector ".main-content a"

# ローカルでの開発時
bun run dev collect https://example.com --selector ".main-content a"
```

特定のHTML要素からのリンク抽出に制限：

```bash
# グローバルインストールした場合
wlc collect https://example.com --element main

# ローカルでの開発時
bun run dev collect https://example.com --element main
```

結果をテキストファイルに出力：

```bash
# グローバルインストールした場合
wlc collect https://example.com --output results.txt --format txt

# ローカルでの開発時
bun run dev collect https://example.com --output results.txt --format txt
```

クエリパラメータ内のURLのスキップを無効化：

```bash
# グローバルインストールした場合
wlc collect https://example.com --skipQuery false

# ローカルでの開発時
bun run dev collect https://example.com --skipQuery false
```

設定ファイルを使用：

```bash
# グローバルインストールした場合
wlc collect https://example.com --configFile config.yaml

# ローカルでの開発時
bun run dev collect https://example.com --configFile config.yaml
```

### フォーマット変換の例

収集結果をNotebookLM形式に変換：

```bash
wlc format --input results.json --output ./output --format notebooklm
```

スペース区切りで変換：

```bash
wlc format --input results.json --output ./output --format notebooklm --separator space
```

### 組み合わせワークフロー

リンクを収集してからNotebookLM形式に変換：

```bash
# ステップ1: リンクを収集
wlc collect https://example.com --depth 2 --output results.json

# ステップ2: NotebookLM形式に変換
wlc format --input results.json --output ./output --format notebooklm
```

## ライブラリ使用方法

WebLinkCollectorをNode.jsアプリケーション内でライブラリとして使用することもできます：

```javascript
import { collectLinks } from 'web-link-collector';

// 基本的な使用方法
const results = await collectLinks('https://example.com', {
  depth: 2,
});

console.log(results);

// より多くのオプションを指定
const results = await collectLinks('https://example.com', {
  depth: 2,
  filters: [{ domain: 'example.com' }, { domain: 'api.example.com' }],
  selector: '.main-content a',
  delayMs: 2000,
  logLevel: 'info',
  skipQueryUrls: true, // クエリパラメータ内のURLをスキップ
  skipHashUrls: true, // ハッシュフラグメント内のURLをスキップ
});

// 結果へのアクセス
console.log(`収集したURL総数: ${results.allCollectedUrls.length}`);
console.log(`見つかったリンク関係: ${results.linkRelationships.length}`);
console.log(`発生したエラー: ${results.errors.length}`);
console.log(`実行時間: ${results.stats.durationMs}ms`);
```

## 設定ファイル

JSONまたはYAML設定ファイルを使用してオプションを指定できます。以下は例です：

```yaml
initialUrl: https://example.com
depth: 2
delayMs: 2000
logLevel: info
format: json

# 初期ページでのリンク抽出を制限するCSSセレクタ
selector: '.main-content a'

# リンク抽出の起点として使用するHTMLタグ名
element: 'main'

# クエリパラメータやハッシュ内のURLのスキップ設定
skipQueryUrls: true
skipHashUrls: true

# フィルタは収集するURLを定義します
filters:
  # 最初のフィルタ条件（フィルタオブジェクト間はOR論理）
  - domain: example.com
    pathPrefix: /blog

  # 2番目のフィルタ条件
  - domain: api.example.com
```

### 設定ファイルに関する重要な注意点

1. **YAML特殊文字**: YAMLで特殊文字（`#`、`:`など）を使用する場合、値を引用符で囲む必要があります。例えば、`selector: #main`ではなく`selector: "#main"`を使用します。

2. **CLIと設定の優先順位**: CLIオプションと設定ファイルの両方が提供される場合、CLIオプションが優先されます。明示的に指定されたCLIオプションのみが設定ファイルの値を上書きします。

3. **セレクタとエレメントの動作**: CSSセレクタとエレメントオプションは初期ページ（深度0）でのリンク抽出にのみ適用されます。それ以降のページではセレクタやエレメントに関係なくすべてのリンクが抽出されます。両方のオプションが指定された場合、セレクタが優先されます。

4. **URL除外機能**: クエリパラメータやハッシュフラグメント内のURLは、例えば`https://twitter.com/share?url=https://example.com`のような共有リンクなどで、デフォルトでスキップされます。

より多くの設定例については、`examples`ディレクトリを参照してください。

## フィルタオプション

フィルタを使用して、収集するURLを制御できます：

- `domain`: URLドメインと照合する文字列または文字列の配列
- `pathPrefix`: URLパスと照合する文字列または文字列の配列
- `regex`: 完全なURLと照合する正規表現パターンまたはパターンの配列
- `keywords`: URL内のどこかで一致する文字列または文字列の配列

複数のフィルタオブジェクトはOR論理で結合され、単一のフィルタオブジェクト内の条件はAND論理を使用します。

## 結果フォーマット

JSON出力構造には以下が含まれます：

```typescript
{
  initialUrl: string;
  depth: number;
  allCollectedUrls: string[];
  linkRelationships: {
    source: string;
    found: string;
  }[];
  errors: {
    url: string;
    errorType: string;
    message: string;
  }[];
  stats: {
    startTime: string;
    endTime: string;
    durationMs: number;
    totalUrlsScanned: number;
    totalUrlsCollected: number;
    maxDepthReached: number;
  };
}
```

## ライセンス

MIT
