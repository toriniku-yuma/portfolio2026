# Tailwind CSS 移行の検証（2026-09-06）

Panda CSSをTailwind CSS 4.3.3と公式Viteプラグインへ置き換えた。配置・余白・文字・状態別のスタイルはJSXのユーティリティクラスにまとめ、色とフォントのテーマ、Markdown、リンク下線、背景ドット、キーフレームは `src/styles/index.css` に配置した。

Pandaの依存、設定、生成ディレクトリ、ビルド・CIのコード生成処理は削除済み。本文Markdown、B案のカード、アスタリスク、スクロール演出、選択色、リンク操作、印刷と動きを抑える設定を維持した。スキルのサンプル表記もTailwind CSSに更新した。

## 結果

- 本番ビルド・型チェック：成功。
- ESLint・TSX内の関数数チェック：成功。
- コンテンツテスト：9件成功。
- 本番相当E2E：44件成功、失敗・不安定・スキップなし。[結果](e2e.json)
- 開発環境（StrictMode）E2E：11件成功、失敗・不安定・スキップなし。[結果](e2e-development.json)
- 固定lockfileでのオフライン依存インストール：成功。
- 幅375px・1440pxの画面、印刷PDFを生成。両幅のトップ画面を目視確認。
- テーマの文字色コントラスト：検証対象の全組み合わせで4.5以上。[結果](contrast.json)

E2Eは本番相当でChromium・WebKit・Android相当・iPhone相当を使用した。Windowsで検証サーバーの終了処理が待機したため、今回起動した検証用Viteプロセスだけを終了し、両テストコマンドの正常終了とJSON結果の出力を確認した。ユーザーのプレビュー（4180）は継続している。

## 配信サイズ

| 対象 | 移行前 gzip | 移行後 gzip |
| --- | ---: | ---: |
| JavaScript | 118.99 kB | 113.06 kB |
| CSS | 8.19 kB | 4.51 kB |

移行後の個別ファイルのバイト数・ハッシュは [bundle.json](bundle.json) に記録。画面記録は [375px](375-hero.png)・[1440px](1440-hero.png)、印刷は [print.pdf](print.pdf) を参照。

Lighthouseは今回再計測していない。WindowsのFirefox起動問題、実機・Narrator・ブラウザーメニューからの操作は今回の検証対象外。
