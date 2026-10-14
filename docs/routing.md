# ルーティング設計

本ドキュメントは、Next.js App Router を用いた PiBit のルーティング設計をまとめる。

---

## 1. ルーティング設計の目的

- 画面名（日本語）とURL（英語）の対応を一覧化し、実装時の基準とする。
- 認証・認可の要否と、画面ごとのアクセス制御の方針を明確にする。
- Route Group による共通レイアウトの分け方と、ファイルパスとの対応を示す。
- タブ・モーダルをURLでどう扱うかを決める。

---

## 2. 基本方針

- Next.js App Routerを使用する
- Server Componentを基本とする。Client Componentは必要な部分のみ分離して使用する（Client Componentを禁止するものではない）
- Footerは Server Component とし、`usePathname` による現在ページのアクティブ表示は採用しない
- 画面名・説明文は日本語、URLは英語で統一する
- 一般ユーザー画面と管理者画面を分離する
- PiBit の各画面は原則ログイン必須とする
- 管理者画面は管理者権限を必須とする
- Route Groupを使用して共通レイアウトを整理する
- タブの選択状態はクエリパラメータで管理する
- モーダルには独立したURLを設けない
- 既存の要件にない画面・機能は追加しない
- 本書には将来仕様のルートも含む。MVPへの採否は [mvp.md](./mvp.md) を参照し、ルート定義を実装済みとみなさない

---

## 3. 一般ユーザー側ルート一覧

| 画面名 | URL | 認証 |
|---|---|---|
| Canvas（ホーム・タイムライン） | `/` | 必須 |
| ログイン | `/login` | 不要 |
| 新規アカウント作成 | `/signup` | 不要 |
| パスワード再設定（将来仕様） | `/password/reset` | 不要 |
| 投稿詳細 | `/posts/[id]` | 必須 |
| Exploration（検索） | `/search` | 必須 |
| Inbox（通知） | `/notifications` | 必須 |
| My Page（マイページ） | `/mypage` | 必須 |
| 他ユーザープロフィール | `/users/[userId]` | 必須 |
| プロフィール編集 | `/mypage/edit` | 必須 |
| Connect（フォロー・フォロワー一覧） | `/mypage/follows` | 必須 |
| 設定 | `/settings` | 必須 |

---

## 4. 管理者側ルート一覧

| 画面名 | URL | 認証・権限 |
|---|---|---|
| 管理者ログイン | `/admin/login` | 管理者認証前に利用可能 |
| 管理者ダッシュボード | `/admin` | 管理者 |
| 管理者用ユーザー管理一覧 | `/admin/users` | 管理者 |
| 管理者用ユーザー詳細 | `/admin/users/[id]` | 管理者 |
| 管理者用投稿管理一覧 | `/admin/posts` | 管理者 |
| 管理者用投稿詳細 | `/admin/posts/[id]` | 管理者 |
| 管理者用センシティブ投稿管理一覧 | `/admin/sensitive` | 管理者 |
| 管理者用センシティブ投稿詳細 | `/admin/sensitive/[id]` | 管理者 |
| 管理者用操作履歴 | `/admin/audit-logs` | 管理者 |

---

## 5. 動的ルート・パラメータ設計

| URL | パラメータ | 意味 |
|---|---|---|
| `/posts/[id]` | `id` | 投稿を識別する ID |
| `/users/[userId]` | `userId` | 固定の公開ユーザーID（`@` を除いたもの） |
| `/admin/users/[id]` | `id` | 管理対象ユーザーの内部ID |
| `/admin/posts/[id]` | `id` | 管理対象投稿の ID |
| `/admin/sensitive/[id]` | `id` | センシティブ投稿の管理対象 ID |

### ユーザーの識別子

| 種類 | 内容 | URL での扱い |
|---|---|---|
| DB内部ID | データ管理用 | 一般ユーザー向けの公開プロフィール URL には使用しない |
| 公開ユーザーID | 例 `@A7K9X2M4`。自動生成・重複不可・変更不可 | `@` を除いて使用する |
| 表示名 | ユーザーが変更可能。重複を許可 | URL には使用しない |

- 例：`@A7K9X2M4` のプロフィールは `/users/A7K9X2M4`
- 管理者画面の `/admin/users/[id]` は内部IDを使用する（管理者専用で、管理者のみアクセス可能）
- 内部IDをURLに表示しないこと自体はセキュリティ対策とはみなさない。閲覧・操作の可否は、常にサーバー側（NestJS API）で認可を行って判断する

---

## 6. クエリパラメータ設計

### タブ

| URL | `tab` の値 | 初期値 |
|---|---|---|
| `/mypage` | `posts` / `replies` / `likes` / `reposts` | `posts` |
| `/users/[userId]` | `posts` / `replies` / `likes` / `reposts` | `posts` |
| `/mypage/follows` | `following` / `followers` | `following` |

例：
- `/mypage?tab=likes`
- `/users/A7K9X2M4?tab=replies`
- `/mypage/follows?tab=followers`

### 動作

- `tab` が存在しない場合、または不正な値の場合は初期タブを表示する
- タブ切り替え時は URL のクエリパラメータを更新する
- タブ切り替えは画面遷移ではなく、同一画面内の切り替えである
- マイページのフォロー数を選択した場合は `tab=following`、フォロワー数を選択した場合は `tab=followers` で一覧へ遷移する

### 検討事項（未確定のため確定しない）

| 対象 | 内容 |
|---|---|
| 検索 | ユーザー / 投稿の切り替え、検索キーワード、並び順（新しい順 / 人気順）のパラメータ名と値 |
| 管理者の各一覧 | 検索・絞り込み・並び替えのパラメータ |
| ページネーション | 方式（ページネーション / 無限スクロール）が未決定のため、パラメータも未確定 |

---

## 7. 認証・アクセス制御

### 動作

1. アプリ起動時にログイン状態を確認する
2. 未ログインで保護された画面にアクセスした場合、`/login` へリダイレクトする
3. ログイン成功後は、原則として元のアクセス先へ戻す
4. 戻り先が指定されていない場合はホームへ遷移する
5. ログイン済みユーザーがログイン・新規登録画面（`/login` `/signup`）にアクセスした場合はホーム `/` へリダイレクトする。パスワード再設定（`/password/reset`）は将来仕様であり、画面実装時には同様にホームへリダイレクトする
6. 管理者未認証の場合は `/admin/login` へ遷移する
7. 管理者として認証済みのユーザーが `/admin/login` にアクセスした場合は `/admin` へリダイレクトする
8. 管理者権限のないユーザーが管理者専用画面へアクセスした場合は 403 相当のアクセス拒否とする（一般ユーザーとしてログイン済みでも、管理者権限がなければ許可しない）
9. 存在しない投稿・ユーザー・URL は 404 として扱う
10. ログイン中のユーザーが自分自身の公開ユーザーIDで `/users/[userId]` にアクセスした場合は `/mypage` へリダイレクトする
11. Next.js 側だけでなく、NestJS の API 側でも認証・認可を検証する

### 元のアクセス先への復帰

元のアクセス先の受け渡しには、例として `callbackUrl` を利用する。

```
/posts/123
  → /login?callbackUrl=%2Fposts%2F123
  → ログイン成功
  → /posts/123
```

- 戻り先 URL は安全に検証し、自サイト内の相対パスのみ許可する。絶対 URL・外部origin・`//` 始まりのURLなど、外部サイトへの不正なリダイレクトにつながる値は拒否する
- `callbackUrl` が無い、または検証に失敗した場合はホームへ遷移する

### 画面ごとの扱い

| 区分 | 対象 | 未ログイン時 | ログイン済み時 |
|---|---|---|---|
| 認証不要 | `/login` `/signup` | 表示 | `/` へリダイレクト |
| 認証不要（将来仕様） | `/password/reset` | 画面・ルートは将来仕様として維持。MVP対象外 | 画面実装時に `/` へリダイレクトする方針 |
| 認証必須 | 一般ユーザーの上記以外 | `/login?callbackUrl=...` へ | 表示 |
| 管理者認証前 | `/admin/login` | 表示 | 管理者認証済みなら `/admin` へリダイレクト |
| 管理者 | `/admin` 配下（`/admin/login` を除く） | `/admin/login` へ | 管理者のみ表示。管理者以外は 403 相当 |

### パスワード再設定とパスワード変更

- `/password/reset` は将来仕様の画面・ルートであり、MVPでは実装しない
- 将来画面を実装する場合、未ログインユーザーには画面を表示し、ログイン済みユーザーは `/` へリダイレクトする
- ログイン中のパスワード変更は、`/settings` のパスワード変更モーダルで行う

### 自分自身の公開プロフィールURL

ログイン中のユーザーが自分自身の公開ユーザーIDで `/users/[userId]` にアクセスした場合は `/mypage` へリダイレクトする。`tab` が指定されている場合は値を引き継ぐ。

| アクセス | 結果 |
|---|---|
| 自分自身の公開ID | `/mypage` へリダイレクト |
| 他ユーザーの公開ID | 他ユーザープロフィールを表示 |
| 存在しない公開ID | 404 |

例：
- `/users/A7K9X2M4` → `/mypage`
- `/users/A7K9X2M4?tab=likes` → `/mypage?tab=likes`

公開IDの照合は、ログイン中のユーザー情報を基準に行う。

認証方式・Cookie（管理者の認証方式を含む）などの具体的な実装は、現時点では未確定とする。

---

## 8. Route Group・共通レイアウト設計

| グループ | 用途 | 対象 |
|---|---|---|
| `(auth)` | 認証画面 | ログイン・新規登録・パスワード再設定 |
| `(user)` | 一般ユーザーの認証・共通処理 | 一般ユーザーの保護画面全体 |
| `(main)` | 通常ヘッダー・フッターを表示する画面 | Canvas・投稿詳細・Exploration・Inbox・My Page・Connect 一覧・他ユーザープロフィール |
| `(sub)` | 専用ヘッダーを使用し、通常フッターを表示しない画面 | プロフィール編集・設定 |
| `admin/(protected)` | 管理者専用画面 | 管理者ログイン以外の `/admin` 配下 |

### 通常画面（`(main)`）

- ヘッダー：左側にアプリシンボル（表示のみ、画面遷移なし）、右側に My Page アイコン（`/mypage` へ遷移）
- フッター：Canvas / Exploration / Inbox（通知には未読バッジを表示可能）

### プロフィール編集・設定（`(sub)`）

- 専用ヘッダー：戻るボタンと画面タイトル
- 通常フッターなし

### 管理者画面

- 一般ユーザーとは別のレイアウトを使用する
- サイドバーによる画面遷移（ダッシュボード / ユーザー管理 / 投稿管理 / センシティブ投稿管理 / 操作履歴）
- 管理者情報とログアウト操作を配置する

---

## 9. App Routerディレクトリ構成

以下は設計上の構成（実装予定を含む）である。2026-10 時点で実装済みのファイルは次のとおり。

| 状態 | ファイル |
|---|---|
| 実装済み | `layout.tsx`、`(auth)/login/page.tsx`、`(auth)/signup/page.tsx`、`(user)/layout.tsx`、`(user)/(main)/layout.tsx`、`(user)/(main)/page.tsx` |
| 未実装（ディレクトリのみ・空） | `(user)/(sub)/` |
| 未実装（実装予定） | 上記以外のすべて |

```
frontend/src/app/
├── layout.tsx
├── (auth)/
│   ├── login/page.tsx                 → /login
│   ├── signup/page.tsx                → /signup
│   └── password/reset/page.tsx        → /password/reset
├── (user)/
│   ├── layout.tsx                     認証確認など一般ユーザー共通処理
│   ├── (main)/
│   │   ├── layout.tsx                 通常ヘッダー・フッター
│   │   ├── page.tsx                   → /
│   │   ├── posts/[id]/page.tsx        → /posts/[id]
│   │   ├── search/page.tsx            → /search
│   │   ├── notifications/page.tsx     → /notifications
│   │   ├── mypage/page.tsx            → /mypage
│   │   ├── mypage/follows/page.tsx    → /mypage/follows
│   │   └── users/[userId]/page.tsx    → /users/[userId]
│   └── (sub)/
│       ├── layout.tsx                 専用ヘッダー（フッターなし）
│       ├── mypage/edit/page.tsx       → /mypage/edit
│       └── settings/page.tsx          → /settings
└── admin/
    ├── login/page.tsx                 → /admin/login
    └── (protected)/
        ├── layout.tsx                 管理者レイアウト・権限確認
        ├── page.tsx                   → /admin
        ├── users/page.tsx             → /admin/users
        ├── users/[id]/page.tsx        → /admin/users/[id]
        ├── posts/page.tsx             → /admin/posts
        ├── posts/[id]/page.tsx        → /admin/posts/[id]
        ├── sensitive/page.tsx         → /admin/sensitive
        ├── sensitive/[id]/page.tsx    → /admin/sensitive/[id]
        └── audit-logs/page.tsx        → /admin/audit-logs
```

- Route Group（`(auth)` `(user)` `(main)` `(sub)` `(protected)`）はフォルダ名を丸括弧で囲んだもので、URL には含まれない
- `admin` は丸括弧のない通常のフォルダであり、URL に `/admin` が含まれる

### ルート競合の確認

| 確認項目 | 結果 |
|---|---|
| 同一 URL を解決する `page.tsx` の重複 | なし（全 21 ルートの URL はすべて異なる） |
| `/` | `(user)/(main)/page.tsx` のみ（`app/page.tsx` は作成しない） |
| `/mypage` と `/mypage/edit` / `/mypage/follows` | `mypage/page.tsx` は `(main)`、`mypage/edit` は `(sub)`、`mypage/follows` は `(main)`。親フォルダが別の Route Group でも URL は別で競合しない |
| `/admin` と `/admin/login` | `admin/(protected)/page.tsx` は `/admin`、`admin/login/page.tsx` は `/admin/login`。重複なし |
| 静的ルートと動的ルート | `/users/[userId]` と `/mypage` 等は階層が異なり競合しない。`/admin/users` と `/admin/users/[id]` も別階層 |
| `/users/[userId]` と予約語 | `users` 直下に静的ルートは作らない方針とする |

---

## 10. モーダルとURLの関係

以下の操作は独立した URL を作成せず、画面内の状態として管理する。モーダルは画面ではない。

| 操作 | 開く画面 |
|---|---|
| 投稿作成 | 通常ユーザー画面（共通モーダル） |
| 投稿削除確認 | Canvas（ホーム・タイムライン）、投稿詳細など、自分の投稿・リプライの削除操作を行う画面 |
| プロフィール編集の破棄確認 | `/mypage/edit` |
| パスワード変更 | `/settings` |
| ログアウト確認 | `/settings` |
| アカウント削除確認 | `/settings` |
| 管理者の利用停止・利用停止解除・アカウント削除・投稿削除・非表示などの確認 | 管理者用の各詳細画面 |

- 投稿削除（一般ユーザー側）：
  - 自分の投稿・自分のリプライは削除可能。他ユーザーの投稿・リプライは削除不可
  - 削除前に確認モーダルを表示する（独立した URL を持たない）
  - 削除権限は NestJS API 側でも検証する
  - 管理者による投稿削除は管理者機能（管理者用投稿詳細）として別に扱う
- モーダルを閉じたあとは、モーダルを開いた画面に戻る（投稿作成成功後にホームへ固定遷移しない）
- モーダルの詳細仕様は screens.md / screen-flow.md を参照する

---

## 11. エラー・例外時のルーティング

| 状況 | 扱い |
|---|---|
| 未ログインで保護画面へアクセス | `/login?callbackUrl=...` へリダイレクト |
| ログイン済みで `/login` `/signup` へアクセス | `/` へリダイレクト |
| ログイン済みで `/password/reset` へアクセス（将来画面の実装時） | `/` へリダイレクト |
| 自分自身の公開IDで `/users/[userId]` へアクセス | `/mypage` へリダイレクト（`tab` は引き継ぐ） |
| 存在しない公開IDで `/users/[userId]` へアクセス | 404 |
| 管理者未認証で管理者画面へアクセス | `/admin/login` へリダイレクト |
| 管理者認証済みで `/admin/login` へアクセス | `/admin` へリダイレクト |
| 管理者権限のないユーザー（一般ユーザーとしてログイン済みを含む）が管理者画面へアクセス | 403 相当のアクセス拒否 |
| 存在しない投稿・ユーザー・URL | 404 |
| 他ユーザーの投稿・リプライの削除操作 | 不可（NestJS API 側でも拒否） |
| 不正な `tab` 値 | 初期タブを表示 |
| 不正な `callbackUrl` | 無視してホームへ遷移 |
| API / DB エラー | 適切なエラー表示とする（詳細は後工程） |

- 表示用の `not-found` / エラー画面の構成（`not-found.tsx` `error.tsx` 等）は実装時に決める

---

## 12. 未確定事項・今後の検討項目

- 認証方式・Cookie・セッション管理の具体的な実装
- 検索（ユーザー / 投稿、キーワード、並び順）のクエリパラメータ
- 各一覧の絞り込み・並び替え・ページネーションのパラメータ（ページネーション / 無限スクロールの方式を含む）
- 管理者の権限管理の詳細
- 403 / 404 / エラー画面の具体的な構成
