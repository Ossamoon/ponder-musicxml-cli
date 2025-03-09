# Ponder MusicXML CLI

MusicXMLのファイルを扱うためのCLIツール。DenoとTypeScriptで実装されている。

## インストール方法

Denoがインストールされている環境で、以下のコマンドを実行してください：

```bash
# インストール
deno install --allow-read --allow-write -n pmxl --global https://raw.githubusercontent.com/yourusername/ponder-musicxml-cli/main/cli.ts

# パスの設定（必要な場合）
export PATH="$HOME/.deno/bin:$PATH"

# 動作確認
pmxl --help
```

## 目標

以下の処理を可能とするCLIツールを目指す。

- MusicXMLファイルの読み込み
- MusicXMLのバージョンを取得
- MusicXMLの概要を取得して表示
  - タイトル
  - 作曲者
  - 作品番号
  - 楽章
  - パート
  - 小節数
- 各小節の位置を取得してCSV形式で出力
  - 小節番号
  - 小節の位置(top, left, width, height)

## 使用方法

```bash
# MusicXMLのバージョンを取得
pmxl version example.musicxml

# MusicXMLの概要を表示
pmxl summary example.musicxml

# 小節の位置情報をCSVで出力
pmxl measures example.musicxml -o positions.csv
```

## 技術スタック

### コア技術

- **Deno**: TypeScript のネイティブサポート、セキュリティ機能、標準ライブラリ
- **TypeScript**: 静的型付け、型推論、インターフェース
- **Neverthrow**: Result 型によるエラー処理
- **fast-xml-parser**: 高速なXMLパース

### テスト技術

- **Deno 標準テストライブラリ**: `@std/expect`、`@std/testing/bdd`
- テストカバレッジ計測

### ビルドとツール

- **Deno タスクランナー**: `deno.json` での定義
- **GitHub Actions**: CI/CD パイプライン

## .cline ディレクトリの説明

このリポジトリの `.cline` ディレクトリは、Deno
プロジェクトにおけるコーディングルールとモードを定義するための設定ファイルを管理しています。

### ディレクトリ構造

```
.cline/
├── build.ts        - プロンプトファイルを結合して .clinerules を生成するスクリプト
└── rules/          - コーディングルールを定義するマークダウンファイル
```

### 使用方法

`.cline/build.ts` スクリプトを実行して、`.clinerules` を生成します。

```bash
deno run --allow-read --allow-write .cline/build.ts
```

## 開発環境のセットアップ

### 必要なツール

1. **Deno のインストール**
   ```bash
   # Unix (macOS, Linux)
   curl -fsSL https://deno.land/x/install/install.sh | sh

   # Windows (PowerShell)
   iwr https://deno.land/x/install/install.ps1 -useb | iex
   ```

2. **エディタ設定**
   - VSCode + Deno 拡張機能
   - 設定例:
     ```json
     {
       "deno.enable": true,
       "deno.lint": true,
       "deno.unstable": false,
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "denoland.vscode-deno"
     }
     ```

3. **プロジェクトのセットアップ**
   ```bash
   # リポジトリのクローン
   git clone <repository-url>
   cd <repository-directory>

   # 依存関係のキャッシュ
   deno cache --reload deps.ts

   # ルールとモードの生成
   deno run --allow-read --allow-write .cline/build.ts
   ```

### 開発ワークフロー

1. **新しいスクリプトの作成**
   ```bash
   # スクリプトモードでの開発
   touch scripts/new-script.ts
   # ファイル冒頭に `@script` を追加
   ```

2. **テストの実行**
   ```bash
   # 単一ファイルのテスト
   deno test scripts/new-script.ts

   # すべてのテストの実行
   deno test

   # カバレッジの計測
   deno test --coverage=coverage && deno coverage coverage
   ```

3. **リントとフォーマット**
   ```bash
   # リント
   deno lint

   # フォーマット
   deno fmt
   ```

4. **依存関係の検証**
   ```bash
   deno task check:deps
   ```

## ライセンス

MIT
