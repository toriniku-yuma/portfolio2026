# アーキテクチャと実装規約

## データの流れ

`content/*.md` → YAML / Markdownの検証・整列 → `src/generated/content.json`（メタデータとbodyFile）+ `src/generated/bodies/*.md`（本文）→ Viteのraw import → React / react-markdown。

本文をJSON内の文字列にしない。編集元は常にcontent/*.mdであり、生成ファイルは編集・コミットしない。ブラウザーでのfetch、ポーリング、YAML解析、MDX、生HTML実行は行わない。画像はpublic/imagesから検証し、BASE_URLを付けてGitHub Pagesのサブパスにも対応する。

## 配置と責務

| 配置 | 責務 |
| --- | --- |
| content/*.md | 1ファイル1セクション。本文・見出し・リンク・スキル値の編集元 |
| scripts/content.mjs、build-content.mjs | 原稿検証と生成 |
| src/content/data.ts | メタデータ・Markdown参照・Lucideアイコンの固定対応 |
| src/components | ページ、本文、ナビなどの表示 |
| src/state | Appの外側に保持するContextとProvider |
| src/hooks/useDisplay.ts | 初回スクロール演出、ハッシュ移動 |
| src/styles/index.css | Tailwindの@theme、基本設定、独自演出、Markdown、印刷・reduce |
| src/components/*.tsx、src/App.tsx | JSXのTailwind classNameに各要素のスタイルを記述 |

## React / TypeScript

- .tsx / .jsx内は最大1関数。アロー関数・関数式・ネスト・インラインコールバックも数える。
- effect・イベントは.tsフック、mapは.tsの名前付き描画関数へ置く。必要のない1関数1ファイル化はしない。
- コンポーネント内にコンポーネントを定義しない。本文のkeyはcontent.idを維持する。
- Providerをハッシュやデザイン変更で再マウントしない。memo、外部ストア、仮想リストを先回りして追加しない。
- StrictModeでobserver・イベントの登録と解除が対称であることを確認する。

## スクロールと一度限りの演出

旧仕様の250msタイマー・段階的DOM追加・全件表示ボタンは廃止。
全文は初回からDOMに置くが、未閲覧カードはopacity:0で待機する。display:none・visibility:hiddenは使わず、レイアウト領域と検索・読み上げ対象を維持する。IntersectionObserverはカード自体を観測し、画面下端から高さの35％内側に入った初回にdata-seenとdata-animatedを付ける。画面の高さが変わったら同じ比率でobserverを再設定する。カード全体を観測するため、長文の途中へ検索で移動した場合にも表示できる。

750msのopacity:0→1とtranslateY(36px)→0を実行し、終了時はdata-animatedだけを削除する。data-seenと上位Setは再読み込みまで保持し、再訪で点滅・再マウントを起こさない。初期表示のopacityとアニメーションの開始値を揃える。

prefers-reduced-motion時はCSSとJS双方で全カードを即時表示し、進行中の演出を止める。解除しても再び隠さない。

## アンカーと検索・印刷

通常の内部リンクは、必要時だけ履歴を追加し、対象見出しへpreventScrollでフォーカスしてからscrollIntoView(smooth)で移動する。reduce時はinstant。初期ハッシュと戻る・進むは位置を即時に合わせ、フォーカスを奪わない。修飾キー・別タブ操作を維持する。

キーボードのfocusinでは移動先カードを即時表示する。リンクによるsmooth移動中のプログラム的なフォーカスだけはこの処理を抑え、到着に合わせてobserverが表示する。Ctrl/Cmd+Fとbeforeprintでは全カードを同期的に表示し、検索の既定動作は妨げない。メニューからの検索は対象へスクロールした際にobserverが表示する。実ブラウザーの検索UI確認と自動イベントのテストは区別する。

## 共通リンクと読み込み演出

全a要素はAppLinkを使用する。Markdownのaもreact-markdownのcomponents対応でAppLinkへ渡し、構文木nodeはDOMへ転送しない。通常リンクは400msのease-in-outでopacityを1→0.8へ変化させる。目次だけunderline属性を指定し、navigation-link-motionで下線を右へ伸ばす。hoverとfocus-visibleに同じ演出を適用し、既存のフォーカス枠を維持する。reduce時は遷移を止める。

目次のaria-currentは現在のスクロール位置から決める。カード上端がフェード開始線（画面上端から65％）に達した最後の項目を選択する。先頭ではプロフィールを選択し、次のカード上端がフェード開始線に達するまで維持する。末尾までスクロールした場合は最後の項目を選択する。調整値はsrc/hooks/useDisplay.tsのREVEAL_BOTTOM_RATIO（現在0.35）に集約する。画面下端からの比率で、値を大きくすると開始位置が上がる。フェードと目次で基準線を共有し、目次の位置計算から演出のtranslateYを除いて選択の揺れを防ぐ。scroll・resizeをrequestAnimationFrameにまとめて処理し、解除時にフレームとリスナーを破棄する。通常スクロールではURL・履歴・フォーカスを変更しない。

トップの文字はpage-enterで上から下へ20px移動しながら、80msずつずらしてフェード表示する。アスタリスク背景のドットは8秒で48px横へ動く。停止ボタンは置かない。reduce設定時はドット・文字・リンクの動きを抑制する。

## スタイルの編集

要素の配置・余白・文字・状態はJSXのTailwindユーティリティクラスで記述する。色やフォントはsrc/styles/index.cssの@themeに定義する。ドット、リンク下線、Markdown本文、keyframes、reduce・印刷だけを同ファイルのCSSで管理する。@tailwindcss/viteがスタイルをビルドし、Pandaの依存・設定・styled-system生成物は使用しない。

共有リンクはAppLinkで再利用する。スキル幅だけ数値のCSSカスタムプロパティを使う。クラス名は静的な完全な文字列で書き、文字列連結でクラス名を組み立てない。読みやすい変数名・改行を維持する。

カードはB案（縦ライン）を採用。比較UI・他の案・選択状態は削除した。トップの装飾は角括弧と8本スポークのアスタリスクをSVGで描画する。

静的title・description・OGPはindex.html。公開名はKawakami Shunki（川上駿季）。公開手順は[deployment.md](deployment.md)を参照。

左の目次はpage-enterで読み込み時にフェードする。aria-currentの項目はhover時もaccentを維持。トップ下に1pxの罫線を置き、本文との間隔は32pxとする。

目次の現在位置表示は1024px以上のみ。1024px未満（SP・タブレットの上部目次）では全項目を未選択とし、aria-currentも付けない。幅の変更時にも即座に更新する。
