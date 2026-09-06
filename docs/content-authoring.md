# 原稿の作成と検証

## ファイルと表示単位

content/直下のUTF-8の .md を公開原稿として扱い、1ファイルを1つの表示セクションにする。
長い経歴等は複数ファイルへ分割する。本文の各段落を分解せず、セクション単位で初回スクロール演出する。
ファイル名は管理用で、表示順はorder、表示履歴とURLアンカーはidで決まる。
一度公開したidは文言変更やファイル名変更で変えない。

ページ全体のh1はUI側。セクションのh2はtitleから描画し、本文の小見出しは `###` から始める。
日付が不明な場合は省略する。年数、担当範囲、測定値、リンク先を推測して埋めない。

## Frontmatter契約

YAMLのトップレベルはオブジェクトとし、必須項目を省略・文字列変換で補完しない。

| 項目 | 必須 | 検証と用途 |
| --- | --- | --- |
| id | はい | 空でない文字列。形式は ^[a-z][a-z0-9-]*$、全ファイルで一意。セクションIDとアンカー |
| type | はい | profile / career / skills / project / about のいずれか |
| order | はい | JavaScriptで安全に扱える整数。負数も可。表示順 |
| title | はい | 空白だけでない文字列。セクション見出し |
| summary | いいえ | 指定時は空白だけでない文字列。プレーンテキストの概要 |
| links | いいえ | labelとhrefだけを持つオブジェクトの配列。空配列可 |
| skills | いいえ | skills型のみ。name（重複しない技術名）とlevel（0〜100の数値）の配列 |

linksのlabel / hrefは空白だけでない文字列。未知の項目、YAMLの重複キー、型違いはエラーにする。
orderの同値は許可し、order昇順 → idのASCII昇順で安定して整列する。
本文は空白のみを不可とし、全体0件もビルドエラーにする。
内部UIはmain等のIDを使い、原稿idでmain / top / navigation / related-links / card-designs / design-headingを使うのは禁止する。

## URL・Markdownの許可範囲

以下は本プロジェクトで選んだ初期の制約。frontmatterだけでなく本文にも適用する。

| 対象 | 許可 |
| --- | --- |
| links.href、本文リンク、自動リンク、参照リンク | https:// の絶対URL、宛先付きmailto:、存在するコンテンツへの #id |
| 本文画像 | public/images/に実在するファイルを論理パス /images/... で参照。代替テキスト必須 |
| その他 | 拒否 |

http:、javascript:、data:、file:、プロトコル相対URL、任意の相対リンクは許可しない。
ユーザー情報付きHTTPS URL、制御文字、バックスラッシュ、画像パスの親ディレクトリ参照も拒否する。
URLは正規表現だけで判断せずURLパーサーでscheme等を確認し、内部アンカーと画像は専用の分岐で検証する。
本文のリンクはMarkdown構文木上で解析し、参照リンクの定義先・画像も検証する。無効な参照定義もエラーにする。
mailtoの到達性は自動保証できないので、公開する宛先を手動確認する。

原稿画像の /images/... は公開ドメインのルートへのURLではない。検証済みパスを描画時にimport.meta.env.BASE_URLと結合し、GitHub Pagesのサブパスに対応する。
例えばbaseが /REPO/ なら /REPO/images/... として表示する。原稿にはリポジトリ名を含めず、検証はpublic/images/の実ファイルに対して行う。
HTTPS・mailto・#idは書き換えない。詳細は [deployment.md](deployment.md) を参照。

見出し、段落、リスト、表、引用、強調、コードブロック、リンク、画像を使える。
GFMの表などはremark-gfmで扱う。HTMLノードはビルド時に拒否し、実行時にもskipHtmlを指定する。
コードブロック内のHTMLやReactコードの文字列は説明として表示可能だが実行しない。
MDX、rehype-raw、dangerouslySetInnerHTML、任意のプラグイン追加による実行は許可しない。
URL変換を無条件の恒等関数にして安全な既定処理を無効にしない。[react-markdown公式](https://github.com/remarkjs/react-markdown)

外部リンクは初期実装では同じタブで開く。別タブを採用する場合は開くことを表示し、rel=noopener noreferrerを付ける。

## 検証・生成処理

1. content/*.mdを列挙し、frontmatterと本文を解析する。YAML・Markdownの独自パーサーは作らず、実装時に選定したライブラリを用いる。
2. 必須項目、型、未知項目、重複キー、本文、HTML、URLを検証する。
3. 全IDを集め、重複と内部アンカーの参照先、画像の実在を検証する。
4. orderとidで整列し、frontmatter項目とbodyFile参照を持つJSON配列、および本文の独立したMarkdownファイルを生成する。
5. すべて成功した場合だけsrc/generated/content.jsonを更新する。失敗時はファイル名・項目・理由を表示して非ゼロ終了し、古いJSONでビルドを続けない。

JSONに本文文字列は格納しない。src/generated/bodies/*.mdをViteのraw importで読み、react-markdownへ渡す。編集するのはcontent/*.mdのみ。
生成物はバージョン管理から除外し、開発開始前とビルド前に必ず再生成する。
開発中の原稿編集は生成後にページを再読み込みして確認する。本文を自動ポーリングで差し替える仕組みは作らない。
YAML解析等のビルド依存をブラウザー側からimportしない。

ビルドは原稿の構造・URL・画像を検証する。原稿の完成度を示すフラグや専用の公開判定は設けない。ページにはモック注意書きを表示しない。
スキーマ検証はURLの到達性や情報の正確さを保証しない。リンク先・原稿の事実・個人情報は別途確認する。

## コピー用の雛形

以下は資料内の例であり、付属原稿や実績ではない。実装時に必要なものをcontent/へコピーする。
example.comは仮URLであり公開前に差し替える。

```markdown
---
id: project-sample
type: project
order: 40
title: "作例タイトル（要差し替え）"
summary: "何を作ったかを1〜2文で記載"
links:
  - label: "デモ（仮URL）"
    href: "https://example.com/demo"
  - label: "ソース（仮URL）"
    href: "https://example.com/source"
---

### 概要

解決した課題、想定利用者、できることを記載する。

### 担当範囲

- 自分が担当した設計・実装・検証を明記する。

### 使用技術

- 使用した技術と採用理由を記載する。
```

| 用途 | id例 / type / order例 | 本文の構成 |
| --- | --- | --- |
| 自己紹介 | profile / profile / 10 | 公開名、専門分野、短い紹介 |
| 経歴 | career-01 / career / 20 | 取り組み、担当、成果。既知なら期間 |
| スキル | skills / skills / 30 | 分野・技術・経験内容の表。未確認の経験年数は書かない |
| 作例 | project-sample / project / 40 | 概要、担当範囲、使用技術、デモ・ソース |
| 補足・連絡先 | contact / about / 50 | 公開可能な連絡方法、公開プロフィールへのリンク |

複数の作例はそれぞれ独立したidで追加する。
連絡先はabout型を使い、type: contactは使わない。サイト外の技術デモはlinksで参照する。

## 本原稿への差し替え

1. idと構造を維持して本文・title・summary・linksを更新する。
2. 作例の担当範囲、公開可能な実績・個人情報、URLと画像の利用許可を確認する。
3. 事実確認と仮文言の削除を完了する。
4. 原稿検証と公開用ビルドを通し、長文・表・スマートフォン・リンク遷移を確認する。
5. UIコードを変更せず更新できたことを [verification.md](verification.md) に記録する。
## モック実装の収録原稿（2026-09-06）

content/01-profile.md〜05-contact.mdに5typeのモックを用意した。public/images/project-preview.svgは差し替え用のオリジナル仮素材。原稿のリンクにあるexample.comは実デモではない。
画像は16:9の固定領域に全体を収める。原稿から任意のレイアウトや縦横比を指定する項目は設けていない。
パーサーはyaml + unified/remark-parse/remark-gfm。未知のfrontmatterキーやYAML重複キー、生HTML、h1/h2本文見出し、リンク・画像の許可範囲をビルドで検証する。画像は実ファイルを要求し、ディレクトリやimages外へのシンボリックリンクも拒否する。

## スキルバーの編集

content/03-skills.mdの先頭に技術名と数値を記載する。本文は区切り線の下へ普通のMarkdownで書く。ReactやJSONを編集する必要はない。現在の値はユーザー承認のモック値で、公開前に実際の自己評価へ変更する。

```yaml
skills:
  - name: React
    level: 80
  - name: TypeScript
    level: 75
```
