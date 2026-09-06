# GitHub Pagesへの公開手順

GitHub Pages用ワークフローを実装済み。ローカルGitのoriginはgithub:toriniku-yuma/portfolio2026.gitに設定済み。以前のアカウント確認時には対象リポジトリは存在しなかったが、現在のリモート実在・Pages設定は未確認。この作業ではpush・デプロイは行っていない。

## 初期構成

GitHub PagesからViteのdistを配信する。GitHub Actionsで検証・公開用ビルドを行い、distだけをPages用アーティファクトとして公開する。
トップページとハッシュアンカーのみを採用する。ハッシュはサーバーへ送られず、アプリが受け取って表示位置を決定する。
GitHub Pagesは静的ホスティングである。[GitHub Pages公式](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

パスベースのSPAフォールバックを前提にしない。初期範囲では404.htmlによるリダイレクト回避策も導入しない。
将来パスルーターを採用する場合は、直接アクセス・更新時の404を解決する配信設計を先に決める。

## 公開URLとViteのbase

| 公開形式 | URL例 | base |
| --- | --- | --- |
| ユーザー／Organizationサイト | https://OWNER.github.io/ | / |
| プロジェクトサイト | https://OWNER.github.io/REPO/ | /REPO/ |
| 独自ドメインのルートで公開 | https://example.com/ | / |

公開名はKawakami Shunki（川上駿季）とし、PCでログイン済みのGitHubを公開先準備時に参照して所有者・対象リポジトリ・公開ブランチを確認する。確認した公開URLに合わせてvite.config.tsへ設定する。
ローカルフォルダ名からリポジトリ名を決めつけない。末尾のスラッシュも含める。[Vite公式GitHub Pages手順](https://vite.dev/guide/static-deploy.html#github-pages)

JS/CSS等に加え、実行時に生成する画像URLにもbaseを適用する。
Markdown中の /images/... は原稿上の論理パスとし、検証済み画像だけ描画時にimport.meta.env.BASE_URLと結合する。
例えばbaseが /REPO/ なら /images/sample.png を /REPO/images/sample.png に変換する。
原稿へリポジトリ名を埋め込まず、HTTPS・mailto・#idにはbaseを付けない。
Viteは任意のMarkdown文字列を自動で書き換える前提にしない。[Vite公式Public Base Path](https://vite.dev/guide/build.html#public-base-path)

## GitHub Actionsの実装方針

実装時に .github/workflows/deploy.yml を作成し、Settings → Pages → Build and deploymentのSourceをGitHub Actionsにする。
docsは実装資料の保存場所であり、Pagesの公開ディレクトリには指定しない。公開対象はdist。

- 対象ブランチへのpushとworkflow_dispatchを入口とする。ブランチ名はリポジトリ作成時に確定する。
- checkout、固定したNode・pnpmのセットアップ、pnpm install --frozen-lockfile、検証、pnpm run buildの順に実行する。
- pnpmのバージョンはpackage.jsonのpackageManager、依存はpnpm-lock.yamlに合わせる。セットアップActionは導入時の公式手順を確認して固定し、依存導入を二重実行しない。[pnpm公式CI手順](https://pnpm.io/continuous-integration)
- frozen-lockfileで失敗したら依存宣言とlockfileの不整合を修正し、CIでlockfileを自動更新して通さない。[pnpm install公式](https://pnpm.io/cli/install)
- actions/configure-pages、actions/upload-pages-artifact、actions/deploy-pagesを利用し、アップロード対象をdistに限定する。
- contents: readを基本に、デプロイジョブへpages: writeとid-token: writeを設定する。environmentはgithub-pages。
- buildとdeployを分ける場合はneedsで成功したbuildへの依存を設定する。失敗したビルドや別実行の古いdistを公開しない。
- Pages公開のconcurrencyを設定し、同じ公開先へ複数のデプロイを並行実行しない。
- ActionsのバージョンまたはコミットSHAは導入時に確認して固定する。

権限・アーティファクト・ジョブの接続は [GitHub公式カスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) を参照。
ワークフローは .github/workflows/deploy.yml に実装済み。push / pull_requestで検証し、公開はリポジトリのdefault_branchへのpushまたはそのブランチでの手動実行に限定する。configure-pagesのbase_pathをVITE_BASE_PATHへ渡して通常ビルドと本番E2Eを実施する。原稿の完成度にかかわらずbuildを使用し、事実確認と仮文言の除去は公開前に手動で行う。

## 本原稿の正式公開前チェック

- [verification.md](verification.md)の公開条件を満たす。仮URL・仮文言を除去する。
- 経歴、画像、個人情報、連絡先、共同制作の担当範囲を公開してよいか確認する。
- デモ・ソース・公開プロフィールへのリンクをブラウザーで開き、閲覧者の認証状態でも到達できるか確認する。
- index.htmlのtitle・description・共通OGPを本内容へ変更する。OGP画像と公開URLはbaseを含む正しい絶対HTTPS URLにする。
- baseと公開URLが一致し、JS/CSS・Markdown画像・faviconが公開パス配下で取得できることを確認する。
- distへ秘密情報や不要なファイルを含めない。Viteでクライアントへ組み込む環境変数に秘密を置かない。
- 公開対象のコミット、成果物、依存バージョンを記録する。前回正常版があれば復旧用に識別できるようにする。

構造・URL・画像は自動検証し、事実確認・到達性・公開範囲は人による確認と分ける。
SNSプレビューで本文や個別作例の動的OGPまで保証しない。

## 実装後の公開手順

1. 対象リポジトリ、公開ブランチ、公開URL、baseを確定する。
2. 確定したNode・pnpm環境でpnpm install --frozen-lockfileを実行する。
3. lint、型検査、原稿テスト、E2E、buildを実行する。
4. pnpm run previewで公開時と同じbase配下のdistを確認する。Pages固有の配信確認は公開後にも行う。
5. PagesのSourceとワークフローを設定し、正式な公開作業の依頼範囲に従って対象ブランチのpushまたは手動実行で公開する。
6. Actionsの成功と公開URLを確認し、トップ、#idの直接アクセス、更新、戻る・進む、JS/CSS/画像、印刷、外部デモを確認する。
7. 実施日時、公開URL、コミット、Actions実行URL、検証結果を本資料とverificationへ追記する。

実装後、READMEへ実際に検証したローカルコマンドと公開ワークフローの起動方法を記載する。
この資料では未導入コマンドの成功や公開URLを仮定しない。

## 復旧

不具合が出た場合は公開ブランチ上で原因変更をrevertする等により前回正常版の内容を復元し、同じPagesワークフローで検証・再ビルド・再公開する。
公開URLやbaseが変更されている場合は現行設定との整合を確認する。
再公開後にトップ・資産・ハッシュ・デモへの到達を再確認する。
初回公開で正常な旧版がない場合は、修正版の公開までの扱いを記録し、復旧済みとみなさない。

## 公開記録

| 項目 | 現在 |
| --- | --- |
| 所有者 / リポジトリ / 公開ブランチ | toriniku-yuma / originはportfolio2026.git（リモート実在未確認） / ローカルmain（公開ブランチ未確定） |
| 公開URL / base | 公開URL未確定。ローカル / と /REPO/ を検証済み |
| コミット / Actions実行URL | 未公開 |
| 公開日時 | 未公開 |
| 公開後検証 | 未実施 |
| 前回正常版 | なし（初回公開前） |

## 参照資料の扱い

2026-09-06に公開先をGitHub Pagesへ訂正し、上記の公式資料を確認した。
実装時は実際に採用するVite・Actionsのバージョンでも再確認する。
