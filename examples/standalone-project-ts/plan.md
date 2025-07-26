# TypeScript Standalone Project Plan

## 分析結果

### 現在のプロジェクト設定分析

**package.json 分析:**

- Bun runtime をメインにしている (`"runtime": {"bun": ">=1.0.0"}`)
- ESM モジュール形式 (`"type": "module"`)
- TypeScript + Bun でビルド
- 開発コマンド:
  - `bun run dev` - 開発実行
  - `bun test` - テスト実行
  - `bun run build` - ビルド
  - `bun run lint` - ESLint
  - `bun run format` - Prettier
  - `bun run tsc` - TypeScript型チェック

**TypeScript 設定 (tsconfig.json):**

- `"target": "ESNext"` - 最新のJS機能を使用
- `"module": "Preserve"` - モジュール形式を保持
- `"moduleResolution": "bundler"` - バンドラーモードの解決
- `"allowImportingTsExtensions": true` - .ts拡張子のインポート許可
- `"verbatimModuleSyntax": true` - 正確なモジュール構文
- `"noEmit": true` - 型チェックのみ（ビルドは別）
- strict mode 有効

**ESLint 設定 (eslint.config.js):**

- ESM形式で設定
- TypeScript plugin 使用
- Jest plugin 使用
- Prettier 統合
- カスタムルール適用

**Prettier 設定 (.prettierrc):**

- Single quotes
- Trailing commas
- 100文字幅
- 2スペースインデント

### 作成計画

## 1. 基本設定ファイル

### package.json

- WebLinkCollector を依存関係に追加
- 現在のプロジェクトと同じBun設定を適用
- TypeScript開発依存関係を追加
- 同じスクリプトコマンドを設定

### tsconfig.json

- 現在のプロジェクトと同じ設定を適用
- ただし、`"noEmit": false` に変更してビルド可能にする
- 出力ディレクトリを `dist` に設定

### eslint.config.js

- 現在のプロジェクトと同じESLint設定を適用
- 必要最小限のルールに調整

### .prettierrc

- 現在のプロジェクトと同じPrettier設定を適用

## 2. TypeScript サンプルファイル

### src/index.ts

- 基本的な使用例
- 型安全性を示す例
- エラーハンドリングの例

### src/advanced.ts

- より高度な設定例
- 型推論の活用
- カスタムインターフェースの定義

### src/types.ts

- カスタム型定義
- WebLinkCollectorの型拡張例

## 3. 開発体験

### 開発コマンド

- `bun run dev` - TypeScript直接実行
- `bun run build` - TypeScript → JavaScript変換
- `bun run start` - ビルドされたJavaScript実行
- `bun run lint` - ESLint実行
- `bun run format` - Prettier実行
- `bun run tsc` - 型チェック

### 特徴

- 型安全性の確保
- 開発時の自動補完
- エラーの事前検出
- 現在のプロジェクトと同じ開発体験

## 4. 実装の重点項目

1. **型安全性**: WebLinkCollectorの型を正しく活用
2. **開発体験**: 現在のプロジェクトと同じワークフロー
3. **エラーハンドリング**: TypeScriptの型を活用したエラー処理
4. **設定の一貫性**: 親プロジェクトと同じ設定を適用
5. **実用性**: 実際のプロジェクトで使用可能な例

## 5. 期待される成果物

- 完全に独立したTypeScriptプロジェクト
- Bunで直接実行可能
- 型安全な WebLinkCollector の使用例
- 開発者向けの詳細なドキュメント
- 実際のプロジェクトで参考になる構造
