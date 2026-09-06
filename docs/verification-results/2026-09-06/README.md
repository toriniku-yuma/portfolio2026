# モック版の実装・検証記録

実施日：2026-09-06。対象は5件すべてmock: trueの原稿。
Gitリポジトリ未作成のためコミットIDはなく、[bundle.json](final/bundle.json) のSHA-256で測定成果物を識別する。
公開・本原稿への差し替えは未実施。以下を公開後の実測や実績と混同しない。

## 環境と互換性

- Windows、Node 26.8.1（scripts内）/ pnpm 10.28.2。システムのNode 24.14.0は初回インストールとpnpm起動に使用。
- React 19.2.8 / Vite 8.2.2 / Panda 1.12.1 / TypeScript 6.0.3 / Playwright 1.63.0。
- 導入時にnpm registryの最新版を照会。TypeScript 7.0.2はtypescript-eslint 8.69.0のpeer範囲外だったため6.0.3を採用。
- pnpm 12.3.4はこのWindowsで起動shimと依存更新に問題が発生したため10.28.2へ固定。ロックファイルを再生成。
- Chromium 153.0.8010.12、WebKit 26.6。AndroidはPixel 7相当、iPhoneはiPhone 13相当のエミュレーション。
- インストール済みChrome 151.0.7922.174 / Edge 152.0.4191.62はheadlessで確認。ブラウザーUIの手動操作とは区別する。

## 自動検証

| 対象 | 結果・証跡 |
| --- | --- |
| build / TypeScript / ESLint / TSX関数数 | 合格 |
| C01〜C08 原稿検証 | Node標準テスト8件合格。必須項目・型・未知項目・重複YAML・全type・ソート・リンク・画像・HTML・mock・失敗時の古いJSONを検証 |
| S01〜S12 開発StrictMode | Chromium / WebKit / Android / iPhoneで32件合格。[記録](e2e-development.json)。Firefox8件はブラウザー起動失敗 |
| 本番build、base=/ | 長文確認を追加して36件合格。[記録](e2e-production-root.json) |
| Windows Chrome / Edge | headlessで各9件合格。[Chrome](e2e-chrome.json) / [Edge](e2e-edge.json) |
| base=/REPO/ | サブパスの画像・ハッシュ・更新・履歴を含む36件合格。結果は[e2e-production-subpath.json](e2e-production-subpath.json) |
| build:release | 現在のモックを拒否して非ゼロ終了することが正常。false原稿はC07で検証 |
| 凍結ロックファイル | install --frozen-lockfileと生成物の再ビルドで確認 |

S09はStrictMode環境で250msタイマーが1つであることと停止を観測。コンポーネントの手動アンマウント専用テストは未実施。
S10のvisibilitychange、S11の検索・印刷イベントは合成イベントによる検証。実タブ操作やブラウザーUIの成功を示さない。
WebKitはこの環境の既定設定でリンクをTab巡回対象にしない。WebKitのM02は明示フォーカス後のEnter・移動先フォーカスまで確認し、Tab巡回はChromiumで検証。各結果へlimitation注記を追加している。

Firefox 155.0は再取得後も `browserType.launch: spawn UNKNOWN`。
Windows Applicationログに `mozglue, type=win32, version=1.0.0.0` のSideBySideアセンブリ解決失敗が記録された。
アプリへ到達する前の環境エラーであり、Firefoxの合格とはみなさない。Linux CIまたは動作する対応ブラウザー環境で再確認が必要。
テスト設定からFirefoxを削除したり、自動で合格扱いにする変更はしていない。

## 画面と操作

- 320 / 375 / 768 / 1024 / 1440pxで、ページ全体の横はみ出しなし。
- 長文、長URL、表、長いコード、画像を検証。コード・表は名前付きのキーボード操作可能なスクロール領域。
- 200%相当は1440px画面のCSS幅を720pxとして確認。ブラウザーUIの実ズーム操作は未確認。
- デスクトップ3列、1024px未満1列。画像は16:9の領域を確保しobject-fit: containで全体を表示。
- [375px 初期](final/375-initial.png) / [375px 全件](final/375-all.png)
- [1440px 初期](final/1440-initial.png) / [1440px 全件](final/1440-all.png)
- [印刷PDF](final/print.pdf) はブラウザーのPDF出力。検索メニュー・印刷プレビューUIの手動確認とは異なる。
- 読み上げソフト、実スマートフォン、OSの動き設定切替、実タブ復帰は未確認。

Windows Computer Useは現在のChrome URLを確実に判定できず、ポリシー判定のため停止した。
以後のWindows画面入力は中止。検索メニュー・印刷プレビュー・Narratorの代替確認は自動DOM検証とLighthouseまでであり、M03/M05/M06/M07の手動合格にはしていない。

## コントラストと最終確認

実際のページで解決されたPandaカラートークンからWCAGの相対輝度比を計算した。[記録](final/contrast.json)。
本文/パネル16.67:1、補足/パネル9.95:1、リンク/パネル13.88:1、ボタン文字/緑背景15.05:1、フォーカス/ページ背景15.05:1。
通常文字4.5:1とフォーカス3:1を満たす。装飾用のカード境界線は入力コントロールの境界ではない。
印刷PDFは3ページを画像化して全ページを目視確認し、本文・表・URL・画像の欠落や横方向の切れがないことを確認した。長いカードはページをまたぐ。
最終のロゴ・robots.txt修正後にもbuild・lint・typecheck・原稿8件とLighthouse12回を確認した。E2Eの証跡はロゴ修正前の機能実装を対象とする。

## 性能

本番build、URL `http://127.0.0.1:4180/`、base=/、キャッシュ・ストレージをLighthouse既定で毎回クリア。
Lighthouse 13.4.1。mobile / desktopの標準設定、シミュレーションによるCPU・ネットワーク制限。
正確なuserAgent、OS、CPU slowdown、ネットワーク設定、日時は[全12結果](final/lighthouse.json) のsettings/environmentへ記録。
動き設定はPuppeteerのemulateMediaFeaturesで設定し、matchMediaの値を確認してからLighthouseの公式page引数へ渡した。
個別HTMLレポートは同じfinalフォルダの `mobile-normal-1.html` 等に保存。

| 条件（各3回の中央値） | Performance | Accessibility | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- |
| Mobile / 通常 | 100 | 100 | 1502.8 ms | 0 | 0 ms |
| Desktop / 通常 | 100 | 100 | 362.8 ms | 0 | 0 ms |
| Mobile / reduce | 99 | 100 | 1577.4 ms | 0 | 14.5 ms |
| Desktop / reduce | 100 | 100 | 362.7 ms | 0 | 0 ms |

[中央値JSON](final/medians.json)。Best Practices・SEOは全条件100。ロゴの不要なaria-labelを除去し、robots.txtを追加して再測定した。
SEO等の未達項目と最適化候補は全結果のfailuresへ保存。クライアント描画のため、クローラーが本文を取得できる保証はない。
これらはローカルのラボ指標であり実利用者のINP・配信速度・公開後の値ではない。

初回の通常表示はMobile中央値95、CLS 0.12945、Desktop CLS 0.03508だった。
タイムラインの末尾案内が初回追加で移動していたため、画面用に最初の読書領域600pxを確保して改善した。表示済みセクションの順序・本文は変更しない。
[改善前6回](lighthouse.json) / [改善後12回](final/lighthouse.json)。
改善前のreduce測定はPlaywrightコンテキストの媒体上書きを検知して停止しており、未計測値を混ぜていない。

| ファイル | 未圧縮 | gzip |
| --- | --- | --- |
| JS | 375,871 B | 116,859 B |
| CSS | 26,701 B | 7,592 B |
| 画像・favicon | 1,368 B | 725 B |
| HTML・robots.txt含む合計 | 405,172 B | 125,902 B |

gzipはNode zlibの標準設定で計算したファイルサイズ。HTTPヘッダーやキャッシュを含む実転送量ではない。
公開後の圧縮方式・転送量は未測定。

## 公開前の残作業

本原稿、連絡先、実績、デモURL、画像、OGP画像・公開URLを利用者が確定し、mockを個別に解除する。
GitHubログインはtoriniku-yumaと確認。`toriniku-yuma/portfolio2026` は未作成で、このフォルダにも.gitは存在しない。
公開先の作成・接続、Pages有効化、本原稿でのreleaseビルド、M08〜M10と公開後測定は未実施。
モック版の機能実装と公開ワークフローの準備を、公開完了とは区別する。
