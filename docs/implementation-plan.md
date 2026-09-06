# 制作手順

2026-09-06：モック版の骨格・体験・自動検証・性能改善・公開ワークフローを実装した。以下は制作時の方針と公開前の手順として維持する。実装状況は [検証記録一覧](verification-results/README.md) を参照。

## 1. 骨格

- Node・pnpm・各依存は実装開始時点の最新安定版を確認し、互換性を検証してReact + TypeScriptのVite構成を導入する。ユーザーの指摘で仕様が変わった場合は該当docsも更新する。
- 必要な依存だけを選定・固定し、pnpm-lock.yamlを保存する。pnpmの正確なバージョンをpackage.jsonのpackageManagerへ記載し、Nodeの採用バージョンも記録してローカルとCIで揃える。毎回latestへ追従させず、更新時に再検証する。
- Markdown / YAMLは既存パーサーを利用し、E2EはPlaywrightを初期案とする。
- TailwindのViteプラグイン、@theme、JSXのユーティリティクラスを設定する。
- [原稿契約](content-authoring.md)の型、検証、JSON生成を実装する。原稿の雛形から5typeのモックを用意し、本文は独立したMarkdown、JSONはメタデータとbodyFile参照だけにする。
- Header、Navigation、本文、RelatedLinksを責務で分離する。TSX関数制限は [architecture.md](architecture.md) を守る。

終了条件：クリーン環境からビルドでき、5typeの原稿を表示し、原稿テスト8件を確認できる。

## 2. 体験

- アプリ上位のContext、IntersectionObserver、初回閲覧ID集合を実装する。
- 全本文を初回からDOMへ置き、ハッシュ移動、初期ハッシュ、戻る・進む、reduce、検索・印刷を実装する。
- [ui-spec.md](ui-spec.md)に沿って1列／2列／3列とB案の縦ライン表示を整える。比較UIは置かない。目次のスクロール追従、目次だけの下線と通常リンクの400msフェードを実装する。

終了条件：verification.mdの状態・演出・リンク・目次の条件を確認でき、主要操作をキーボードで完結できる。

## 3. 品質

- [verification.md](verification.md)の自動検証を実行し、StrictModeと本番ビルドの両方を確認する。
- 長文・長URL・表・画像を使って画面幅・横はみ出し・キーボード・印刷を確認する。
- 実行環境と証跡を記録し、実装上の判断変更は該当docsへ反映する。
- 実装後にLighthouse、バンドルサイズ、画面キャプチャを必要な条件で採取する。未実施は未実施とする。

終了条件：不具合を解消し、未確認範囲・制約・実測条件を明示できる。

## 4. 原稿と公開

- 本原稿、公開プロフィール、連絡先、作例の担当・技術、デモ／ソースURLを確定する。
- クイズ等の詳細設計はデモ側に置き、紹介ページには概要とリンクだけを置く。
- title / description / OGP画像とURLを設定し、メタデータ・公開URL・リンク到達を確認する。
- [deployment.md](deployment.md)に従ってViteのbaseとGitHub ActionsのPages公開ワークフローを設定し、公開・復旧可能なdistを用意する。

終了条件：モックがなく、公開範囲確認済みのページとデモへ到達できる。

## pnpm scriptsの契約

以下のコマンドをpackage.jsonへ実装済み。実行環境と利用例はルートREADMEを参照。measureコマンドで画面・印刷PDF・コントラスト・Lighthouse・サイズの記録も作成できる。

| コマンド | 処理 |
| --- | --- |
| pnpm install | 初回導入・依存更新時にpnpm-lock.yamlを生成・更新 |
| pnpm install --frozen-lockfile | 作成済みpnpm-lock.yamlを変更せず依存導入。CI・再現確認で利用 |
| pnpm run content:build | 開発用の原稿検証・メタデータとMarkdown生成 |
| pnpm run dev | 原稿生成 → Vite開発サーバー |
| pnpm run lint | TS/TSXの静的チェック |
| pnpm run typecheck | TypeScriptの型検査 |
| pnpm run test:content | 原稿スキーマのテスト |
| pnpm run test:e2e | E2E。サーバー起動条件を設定へ記載 |
| pnpm run build | 原稿生成 → 型検査 → Viteビルド |
| pnpm run preview | 生成済みdistを確認 |

検証失敗時は後続処理を停止する。
開発中に原稿を編集したらcontent:build後にページを再読み込みする。
実装した時点でREADMEへ実際のコマンドを記載し、本表と一致させる。
最初から複雑なCI基盤は作らず、上記検証が揃ったら同じコマンドをCIでも利用する。

## 公開までに確定する項目

| 項目 | 現在 | 確定する時点 |
| --- | --- | --- |
| Node、pnpm、各依存のバージョン | Node 26.8.1 / pnpm 10.28.2。package.jsonとlockfileへ固定済み | 実装済み |
| 本原稿・連絡先・画像 | 手動で記載するためモックで実装 | 本原稿差し替え前 |
| デモ・ソース・クイズ側資料のURL | 手動で記載 | 公開前 |
| 公開名・ドメイン・OGP画像 | Kawakami Shunki（川上駿季）の名前でGitHub Pagesへ公開、OGP画像未定 | 配信設定・メタデータ作成時 |
| GitHubの所有者・リポジトリ・公開ブランチ・Pagesのbase | originはtoriniku-yuma/portfolio2026.git、ローカルmain。リモート実在・公開ブランチ・Pages設定は要確認 | 公開先準備時 |
| 実機ブラウザーの確認範囲 | Windows実ブラウザー＋3エンジンE2Eを基本とし、スマートフォン実機は利用可能なら追加。詳細は [verification.md](verification.md) | 方針確定、品質工程で実施 |
| 性能値 | 通常/reduce × mobile/desktop各3回を記録。CLS改善後の結果は検証記録を参照 | 本原稿・公開後は再計測 |

初期の技術判断は各docs本文に記録済み。変更時は理由・影響する仕様・検証を該当箇所へ追記する。
