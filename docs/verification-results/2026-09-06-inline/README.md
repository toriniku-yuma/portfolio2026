# JSXへのスタイル集約と目次・余白の調整

2026-09-06。ローカル本番プレビュー http://127.0.0.1:4180/ 。

- 目次に読み込み時のpage-enterを追加。選択中のaria-current項目はhover時もaccentを維持。
- 背景停止ボタンと専用フックを削除。ドットの横移動とreduce対応を維持。
- トップ下に罫線を追加。本文との間隔32px、ヒーロー上下余白はモバイル32px・PC48pxに縮小。
- 各要素のスタイルをTSX内のclassName={css({...})}へ移動。4つのrecipeファイルを削除。共通tokens・文書設定とkeyframesだけを共有。
- s等のスタイル参照変数を除去し、contentType等の名前、JSX・フック・型定義の改行を整理。
- Atomic CSS移行後の罫線色の競合を避け、borderの幅・種類・色を明示して確認。

build（型検査含む）・lint合格。本番4環境のE2E44件合格。最後の罫線色指定後、開発StrictModeのChromium11件合格。e2e.jsonとe2e-development.jsonに保存。

目次のanimation-name、hover中の緑色、罫線の幅と色、32pxの間隔、停止ボタンなし、既存のスクロール・リンク・reduce・320〜1440px表示を確認。375px / 1440pxの画像、印刷PDF、コントラスト、バンドルサイズを保存。画面キャプチャはreduce設定によるレイアウト確認用。Lighthouseは再計測していない。

FirefoxのWindows起動制約、実機・読み上げ・ブラウザーメニュー操作未確認は過去の記録と同じ。公開はしていない。
