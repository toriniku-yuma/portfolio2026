# Kawakami Shunki / 川上駿季

React・TypeScript・Tailwind CSS・Viteで実装した、Markdown更新型のポートフォリオです。
黒と蛍光緑のタイムライン、スクロール初回演出、スキルバー、ハッシュ移動・履歴、動きの抑制、検索・印刷に対応しています。

**モック版の実装です。** 公開名は本人指定、経歴・実績・スキル値はモックです。
`content/` の原稿と画像・リンクを手動で差し替えてください。`build:release` はモックを検出すると停止します。

## 起動

採用環境はNode **26.8.1** / pnpm **10.28.2**。Nodeは `.node-version`、pnpmは `packageManager` に固定しています。
このWindows環境では既存Node 24.14.0をインストールの起点に使い、pnpm scripts内はローカル依存のNode 26.8.1で実行しました。

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

開発サーバーのURLはコマンド出力に表示されます。通常は [localhost:5173](http://127.0.0.1:5173/) です。

## 原稿の更新

1. `content/*.md` のtitle・summary・linksと区切り線以下のMarkdown本文を編集します。公開後のidは維持します。
2. 画像は `public/images/` へ置き、原稿では `/images/ファイル名` と参照します。
3. `pnpm run content:build` を実行し、ページを再読み込みします。
4. 事実確認と仮文言の除去後に各原稿の `mock` をfalseへ変更します。

形式の詳細と雛形は [原稿ガイド](docs/content-authoring.md) を参照してください。
生成JSONはメタデータとMarkdown参照のみです。本文は独立した.mdとして読み込みます。生成物は手編集・コミット不要です。

## 検証・ビルド

```sh
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run test:content
pnpm exec playwright install chromium firefox webkit
pnpm run test:e2e
pnpm run preview
```

`build` は原稿生成 → 型検査 → Viteの順です。
`lint` はESLintと「TSX内の関数は最大1つ」の検査を実施します。
初回に型検査だけを実行する場合は、先に `content:build` が必要です。

E2Eは4173番でStrictMode有効の開発サーバーを自動起動します。
本番ビルドを検証する場合は環境変数 `E2E_PREVIEW=1` を設定します。
既存サーバーを再利用するため、検証モードを切り替える際は4173番のサーバーを終了してください。

WindowsのFirefox 155.0はこのPCでSideBySideエラーにより起動できませんでした。確認済みの範囲を実行するコマンドは次のとおりです。既定設定・CIではFirefoxも対象のままです。

```sh
pnpm run test:e2e --project chromium --project webkit --project android --project iphone
```

本番プレビューを起動後、`pnpm run measure` で画面・印刷PDF・Lighthouse各3回・バンドルサイズを記録します。
既定URLは `http://127.0.0.1:4173/`。`MEASURE_URL` と `MEASURE_OUT` で対象と保存先を指定できます。
`--screenshots-only` を追加するとLighthouseを省略します。

## 公開準備

GitHub Pages用の [.github/workflows/deploy.yml](.github/workflows/deploy.yml) を用意しています。
現在のActionsはモックのまま試験公開できるよう `pnpm run build` を使います。本原稿の準備後は `pnpm run build:release` で確認し、ActionsのPages用ビルドも同コマンドへ変更してください。
公開URL・OGP画像は未確定のため、架空の値を設定していません。

Pagesが返すbase_pathをビルドへ渡すので、リポジトリ名をUIへ埋め込む必要はありません。
ローカルでサブパスを検証するときは、ビルドとpreviewの両方に `VITE_BASE_PATH=/REPO/` を設定します。

ローカルGitのoriginは `github:toriniku-yuma/portfolio2026.git` に設定されています。リモートの実在・Pages設定は公開作業時に確認してください。
本原稿・公開先を準備後、[公開手順](docs/deployment.md) に沿って配信できます。

[設計資料](docs/README.md) / [検証結果と未確認範囲](docs/verification-results/README.md)

## 見た目とスキルの編集

各要素のスタイルはTSX内のTailwindユーティリティクラスに記述しています。要素とスタイルを同じ場所で編集できます。

- トップの名前・ドット・余白・罫線：src/components/Header.tsx
- 目次の演出・選択色：src/components/Navigation.tsx、NavigationItem.tsx
- 縦ラインのカード：src/components/ContentSection.tsx
- 共通リンクのフェード・目次だけの下線：src/components/AppLink.tsx
- スクロール位置に連動する目次の選択：src/hooks/useDisplay.ts
- Markdown内の見出し・表・画像：src/styles/index.css（描画はsrc/components/MarkdownBody.tsx）
- スキルバー：src/components/SkillBar.tsx
- スキル名・0〜100の数値：content/03-skills.md

共通の色・文字はsrc/styles/index.cssの@themeで定義します。同じファイルにkeyframes、ドット背景、リンク下線、Markdown本文、reduce・印刷のCSSをまとめています。TailwindはViteプラグインで処理するため、スタイルのcodegenやPostCSS設定は不要です。

E2E_PORTで検証用ポートを変更できます。[検証記録の一覧](docs/verification-results/README.md)
