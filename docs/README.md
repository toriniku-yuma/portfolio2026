# 実装資料の入口

作成日：2026-09-06。依頼された「紹介ページ企画書」を実装可能な契約に整理した資料。
モック原稿でのアプリ実装・ビルド・検証を実施済み。結果と環境制約は [検証記録一覧](verification-results/README.md) を参照。本原稿への差し替えとGitHub Pagesへの実公開は未実施。

## 読む順序

| 資料 | 内容・参照する作業 |
| --- | --- |
| [architecture.md](architecture.md) | 採用構成、責務分割、TSX規約、順次表示・履歴・検索・印刷 |
| [content-authoring.md](content-authoring.md) | Markdown契約、検証、原稿の雛形、本原稿への差し替え |
| [ui-spec.md](ui-spec.md) | 情報構成、色・レイアウト、キーボード、レスポンシブ |
| [verification.md](verification.md) | 受け入れ条件、スキーマテスト、E2E、手動確認、実測記録 |
| [implementation-plan.md](implementation-plan.md) | 制作順、成果物、予定コマンド、未確定事項 |
| [deployment.md](deployment.md) | GitHub Pages、公開前確認、公開・復旧手順 |

初回は architecture を読み、その後は担当作業に対応する資料を読む。
原稿の契約は content-authoring、挙動の契約は architecture、合否は verification を正とする。
資料間の矛盾を見つけたらユーザーの最新指示を優先し、関連資料を一緒に修正する。

## 初期範囲

- React + TypeScript + Tailwind CSS + Vite。SSRを使わない静的SPA。依存管理とコマンド実行はpnpmに統一する。
- ビルドはbuildに統一する。原稿の完成度フラグは持たず、公開前に内容を手動確認する。
- 公開先はGitHub Pages。GitHub Actionsでビルドしたdistを配信する（2026-09-06のユーザー訂正を反映）。
- トップページとハッシュアンカーのみ。ナビは一覧内のセクションへ移動する。
- 本文はMarkdownを参照し、JSONにはメタデータだけを生成する。実行時のポーリングを行わない。
- 全本文を最初からDOMに置き、各セクションが画面に入った初回だけスクロール演出する。
- 表示済みIDはアプリ上位のメモリに保持し、再読み込みまで減らさない。
- 動きの抑制、キーボード、スマートフォン、標準検索・印刷に対応する。全件表示や検索の案内UIは置かない。
- 技術デモやクイズは別プロジェクト。詳細設計や実装をこのプロジェクトへ持ち込まない。

パスルーター、SSR、個別の動的OGP、CMS、ログイン、投稿・返信・いいね機能、外部状態管理ライブラリは初期範囲外。
ミニブログは見た目と情報の並べ方を指し、SNS機能の実装を意味しない。

## 企画書から具体化した判断

1. 長文の表示単位は「Markdown 1ファイル = 1セクション」。必要なら複数ファイルへ分け、独立したIDを付ける。
2. 同じorderはIDの昇順で決定する。ID形式、URL許可範囲、未知の項目の扱いは content-authoring に定義する。
3. contact型は追加せず、連絡先は about型の専用セクションに置く。
4. 「1つのJSXファイル」の規約は .jsx と .tsx に適用し、関数は1ファイル最大1つとする。
5. 全文を初回からDOMに置くことで、ブラウザーの標準検索をそのまま使えるようにする。

これらは本資料で選んだ初期設計。製品やブラウザーの仕様と混同しない。

## 現在の不足物

企画書に記載された付属 content/ は、資料作成時のフォルダには存在しなかった。
[原稿の雛形](content-authoring.md)を用意したが、経歴・実績・連絡先等はモック。公開名はユーザー指定の名前を使用する。
ユーザーの更新により、本原稿・連絡先・画像・デモURLは手動で差し替える方針とし、実装はモックで進める。
公開名はKawakami Shunki（川上駿季）。年号はブランドに表示しない。ローカルGitのoriginはgithub:toriniku-yuma/portfolio2026.git。リモートの実在・公開ブランチ・Pages設定は公開先準備時に確認する。OGP画像は未定。
Node 26.8.1、pnpm 10.28.2と依存を固定した。最新版から互換性のため変更した理由、画面・性能・動作の実測は [検証記録](verification-results/2026-09-06/README.md) に記載。FirefoxとWindows画面UI等の未確認範囲を公開前に再確認する。
## 現在の画面・編集方針

- 公開名はKawakami Shunki（川上駿季）。ブランドに年号を付けない。
- カードはB案の縦ラインに統一し、デザイン比較UIは置かない。
- トップに角括弧と緑のアスタリスク、横に流れるドット背景を表示する。停止ボタンは置かない。
- トップ文字と目次は読み込み時に上から下へフェードする。トップ下に罫線と32pxの間隔を置く。
- 各セクションは初期透明から画面内へ入った初回だけ表示する。再訪では再演出しない。
- 目次の選択はスクロール位置に追従し、選択中の緑色はホバーでも維持する。
- 内部リンクはsmooth移動。目次だけ下線を右へ伸ばし、それ以外は400msでopacityを1→0.8へ変える。全リンクにAppLinkを使い、reduceに対応する。
- 外部リンク欄は1280px以上で本文の右列、それ未満ではフッター上段に折り返し可能な横並びで表示する。同じリンクデータを使い、本文のリンクも残す。
- スキルバーの名前と値はMarkdownのYAMLで編集する。現在の数値はユーザー承認のモック。
- TailwindのユーティリティをJSXに記述する。テーマ・Markdown・独自演出のCSSだけをindex.cssにまとめ、Pandaの依存・設定・生成物は使用しない。
- 分かりやすい変数名と改行を使い、アイコンはLucideに統一する。

## Windows SSHでの依存関係

`.npmrc` の `node-linker=hoisted` で依存関係を配置する。Windows SSH環境でpnpmのジャンクション経由の参照が拒否されたため、このプロジェクトではhoisted配置を使用する。通常の導入は `pnpm install --frozen-lockfile`、起動は `pnpm dev`。

旧配置から変更するときは開発サーバーを停止し、既存の `node_modules` を退避してからインストールする。名前変更がアクセス拒否になる場合、VS CodeのTypeScriptサーバーがフォルダーを保持していないか確認する。退避先は `.repair-backup/node_modules` とする。node_modulesという名前を保つことでGit・ESLint・Viteの監視対象から除外できる。Windowsの保護機能やアクセス権は変更しない。

2026-09-07の修復確認：Node 26.8.1 / pnpm 10.28.2。`pnpm install --frozen-lockfile`、build、lint、原稿テスト8件が成功。Playwright専用Chromiumは未導入のため、`$env:E2E_CHANNEL='msedge'` を指定した `pnpm exec playwright test --project=chromium` で13件成功。`pnpm dev --port 5173 --strictPort` の起動とHTTP 200を確認した。Firefox / WebKitは今回未実施。旧依存フォルダーは `.repair-backup/node_modules` に保存。

## 改修・検証の履歴

[検証記録一覧](verification-results/README.md)に各段階の結果をまとめた。Panda、カード比較、全リンクの下線、背景停止ボタンなどを記載した過去の記録は当時の証跡であり、現在の実装指示ではない。現行仕様は本資料とarchitecture・ui-spec・content-authoring・verificationを参照する。

目次の現在位置表示は1024px以上のみ。1024px未満（SP・タブレットの上部目次）では全項目を未選択とし、aria-currentも付けない。幅の変更時にも即座に更新する。
