# カレンダー検索 / Calendar Search

カレンダー形式でデータを可視化・検索する Web アプリケーションです。任意の JSON データを URL パラメータで読み込み、カレンダー表示・一覧表示・統計グラフを提供します。

🔗 **公開サイト**: https://calendar.dl.itc.u-tokyo.ac.jp/

## 特長 / Features

- 📅 月 / 週 / 日 ビューのカレンダー表示
- 🔍 キーワード・コレクションによる絞り込み検索
- 📊 統計グラフ表示（年別・曜日別・メタデータ別）
- 🌐 日本語 / 英語の多言語対応（URL を変えずに切替）
- 🌓 ライト / ダークモード（東京大学ビジュアルアイデンティティ準拠の配色）

## 技術スタック / Tech Stack

| 領域 | 使用技術 |
| --- | --- |
| フレームワーク | [Nuxt 4](https://nuxt.com/)（Vue 3 / TypeScript, SPA / `ssr: false`） |
| スタイル | [Tailwind CSS 4](https://tailwindcss.com/)（UTokyo デザイントークン） |
| 多言語 | [@nuxtjs/i18n](https://i18n.nuxtjs.org/)（`no_prefix` 戦略） |
| ダークモード | [@nuxtjs/color-mode](https://color-mode.nuxtjs.org/) |
| グラフ | Chart.js 4 / vue-chartjs 5 |
| ホスティング | GitHub Pages（カスタムドメイン） |

> デザインは Next.js 製の [`@nakamura196/react-ui`](https://github.com/nakamura196/react-ui) のデザイントークン（東京大学 Visual Identity 準拠）を Vue/Tailwind 向けに移植したものです。

## セットアップ / Setup

```bash
npm ci          # 既存の lockfile からインストール（推奨）
npm run dev     # 開発サーバ起動（http://localhost:3005）
```

主なスクリプト:

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバ（ポート 3005） |
| `npm run generate` | 静的ファイルを `.output/public` に生成 |
| `npm run generate:gh-pages` | 上記 + GitHub Pages 用に `404.html` を生成 |
| `npm run typecheck` | 型チェック（vue-tsc） |
| `npm run preview` | 生成物のローカルプレビュー |

## 使用方法 / Usage

1. 以下のフォーマットの JSON データを用意します（例）:

   https://nakamura196.github.io/json/calendar.json

2. データの URL を `u` パラメータに渡してアクセスします:

   ```
   {host}/?u={data_url}
   ```

   例:

   ```
   https://calendar.dl.itc.u-tokyo.ac.jp/?u=https://example.com/calendar.json
   ```

### URL パラメータ

| パラメータ | 用途 |
| --- | --- |
| `u` | データ JSON の URL（必須） |
| `param` | 検索条件 `{"q": "...", "collections": [...]}` を JSON 文字列で指定 |
| `date` | カレンダー（`/item`）の表示月 `YYYY-MM` |

ページは `/`（年×月グリッド）、`/item`（カレンダー）、`/stats`（統計グラフ）の 3 つです。

### データフォーマット

各アイテムは最低限 `date`（`YYYY-MM-DD`）と `label` を持ち、`collections`・`url`・`thumbnail`・`description`・`metadata`（`[{label, value[]}]`）を任意で持てます。トップレベルには `header`・`footer`・`description`・`links`・`stats` などを指定できます。

## デプロイ / Deployment

`main` ブランチへの push をトリガーに、GitHub Actions（[.github/workflows/gh-pages.yml](.github/workflows/gh-pages.yml)）が `nuxt generate` で静的サイトを生成し `gh-pages` ブランチへ公開します。手動実行は Actions タブの **Run workflow**（`workflow_dispatch`）から行えます。

## ライセンス / License

本リポジトリにライセンスは明示されていません。再利用の際はメンテナにご確認ください。
