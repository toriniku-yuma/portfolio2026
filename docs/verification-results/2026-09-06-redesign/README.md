# 名前・Panda・スクロール演出の改修検証

2026-09-06、Windows、ローカル本番プレビュー http://127.0.0.1:4180/ 。公開先への配信は行っていない。

## 変更

Kawakami Shunki（川上駿季）の名前を強調し、年号と全件表示・検索・モックの案内を削除。Lucideアイコン、初回スクロール演出、Markdownで編集するスキルバー、3種類のカード比較を実装した。

CSSはPandaのtokensとslot recipesへ分割。index.cssはレイヤー宣言のみ。JSONにはメタデータとbodyFile参照だけを生成し、本文は独立したMarkdownを読み込む。削除済みの生成Markdownがバンドルへ残らないことも検証した。

## 結果

| 項目 | 結果 |
| --- | --- |
| build・lint・typecheck | 合格 |
| 原稿検証 | C01〜C09、9件合格 |
| 本番E2E | Chromium / WebKit / Android相当 / iPhone相当、24件合格。e2e.json |
| 開発E2E | 別ポート4181のVite開発サーバー、StrictMode、Chromium6件合格。e2e-development.json |
| 画面 | 375px / 1440pxのヒーローとカード比較を画像確認。320〜1440pxと長い文字列、3案はE2Eで横はみ出しを確認 |
| 初回演出 | animationstart回数、閲覧済み属性、DOM同一性を確認。再訪・デザイン変更で再演出なし |
| スタイル適用 | 切り替え先のCSS抽出漏れを修正し、実際のborder/gridの適用も検証 |
| コントラスト | 文字の6組すべて4.5:1以上。最小8.42:1。contrast.json |
| 印刷 | print.pdfを出力、印刷メディアで全本文の存在とopacityをE2E確認 |

## 性能

Node 26.8.1 / Lighthouse 13.4.1、Chromium。通常とreduceのそれぞれについてmobile / desktop各3回を実行。ローカル開発PCで他の検証も一部並行しており、専用の隔離測定環境ではない。ブラウザー・スロットリング等の詳細はlighthouse.jsonに保存。

| モード | Performance中央値 | LCP中央値 | CLS |
| --- | --- | --- | --- |
| 通常 mobile | 99 | 約1.58秒 | 0 |
| 通常 desktop | 100 | 約0.36秒 | 0 |
| reduce mobile | 99 | 約1.58秒 | 0 |
| reduce desktop | 100 | 約0.36秒 | 0 |

Accessibility / Best Practices / SEOはいずれの測定も100。ラボ測定であり、実利用者や公開サイトの性能ではない。全12回のHTML、lighthouse.json、medians.json、bundle.jsonを保存。JSはgzip約119.28kB、CSSはgzip約7.33kB。

## 未確認範囲

Firefoxは前回確認時にこのWindows環境のSideBySideエラーで起動できず、今回再試行していない。スマートフォン実機、Narrator等の読み上げ、ブラウザーの検索・印刷メニュー、実タブ復帰・200%拡大の手動確認は未実施。エミュレーションやPDF出力を実機・ブラウザーUI確認と扱わない。

公開名以外の原稿・スキル値はユーザー承認のモックで、例示リンクも残る。公開用のmock拒否は維持している。

## 画面

- [PCヒーロー](1440-hero.png)
- [PCカード3案](1440-designs.png)
- [モバイル全体](375-all.png)
- [モバイルカード3案](375-designs.png)

旧タイマー版の証跡は../2026-09-06/に歴史資料として保持する。
