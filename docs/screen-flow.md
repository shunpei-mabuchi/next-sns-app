# 画面遷移

本ドキュメントは、requirements.md と screens.md をもとに、画面間の遷移を整理する。

> 図中の表記: 四角 = 画面、角丸 = モーダル、六角形 = タブ（同一画面内の切り替え）。
> いいね・リポストは同一画面内で完結し、画面遷移として扱わない。リプライは投稿詳細へ遷移する。
> My Pageの投稿 / リプライ / いいね / リポストはタブとして扱う。
> Connect（フォロー・フォロワー一覧）も同一画面内のタブとして扱う。
> 投稿作成・パスワード変更はモーダルとして扱う。確認系もモーダルとして扱う。
> アプリシンボルから画面遷移させない。
> My PageアイコンからMy Pageへ遷移する。
> フッターは Canvas / Exploration / Inbox を基本とする。
> プロフィール編集・設定では通常フッターを表示しない。
> 管理者側はユーザー側と別レイアウトとする。
> センシティブ投稿の候補の選定ロジックは図に追加しない。

---

## 1. 認証フロー

アプリ起動時の認証状態確認と、ログイン関連の遷移を2つの図に分けて表す。パスワード再設定画面・ルートは将来仕様であり、MVPには含めない。

### 起動時の認証状態確認

```mermaid
flowchart TD
    Start([アプリ起動])
    AuthCheck{認証状態確認}
    Home[Canvas（ホーム・タイムライン）]
    Login[ログイン]
    Protected[アクセス対象の保護画面]
    Callback{安全なcallbackUrlがあるか}

    Start --> AuthCheck
    AuthCheck -->|認証済み| Home
    AuthCheck -->|未認証| Login
    Protected -->|未認証: callbackUrlを保持| Login
    Login -->|ログイン成功| Callback
    Callback -->|ある: 自サイト内の相対パス| Protected
    Callback -->|ない・不正| Home
```

### ログイン関連の遷移

```mermaid
flowchart TD
    Login[ログイン]
    Home[Canvas（ホーム・タイムライン）]

    Register[新規アカウント作成]
    Reset[パスワード再設定]

    Login -->|callbackUrlなし・不正| Home
    Login -->|新規登録| Register
    Login -->|再設定| Reset
    Register -.->|完了| Login
    Reset -.->|完了| Login
    Login -->|ログイン済みでlogin/signupへアクセス| Home
```

補足:
- 点線は、完了後にログインへ戻る遷移を表す
- 認証済みの場合はログインを経由せずCanvas（ホーム・タイムライン）へ進む
- ログイン成功時、安全な内部相対パスの `callbackUrl` があれば元の保護画面へ戻り、存在しない・不正な場合はCanvasへ進む
- 絶対URLや `//` 始まりなど、外部サイトへの遷移先は拒否する。検証の基本方針は [routing.md](./routing.md) を参照
- ログイン済みユーザーがパスワード再設定画面・ルートへアクセスした場合の扱いは、画面を実装する後工程でroutingの認証要件に従う
- ログイン状態の維持は画面遷移ではなく、起動時の認証状態確認で表現する
- 認証方式・セッション管理の詳細は後工程で検討
- 新規登録後はログインへ戻る。ログアウト成功後もログインへ遷移する

---

## 2. ユーザー側主要画面遷移

Canvas・Exploration・Inbox・投稿詳細・他ユーザープロフィールの間の画面遷移を、3つの図に分けて表す。

### ① Canvasからの画面遷移

```mermaid
flowchart TD
    Home[Canvas（ホーム・タイムライン）]
    PostDetail[投稿詳細]
    Profile[他ユーザープロフィール]

    Home -->|投稿選択 / リプライ選択| PostDetail
    Home -->|投稿者選択| Profile
```

### ② Exploration・Inboxからの画面遷移

```mermaid
flowchart TD
    Search[Exploration（検索）]
    Notification[Inbox（通知）]
    PostDetail[投稿詳細]
    Profile[他ユーザープロフィール]

    Search -->|投稿選択| PostDetail
    Search -->|ユーザー選択| Profile
    Notification -->|投稿関連通知選択| PostDetail
    Notification -->|フォロー通知選択| Profile
```

### ③ 投稿詳細・他ユーザープロフィール間の画面遷移

```mermaid
flowchart LR
    PostDetail[投稿詳細]
    Profile[他ユーザープロフィール]

    PostDetail -->|投稿者 / リプライ投稿者選択| Profile
    Profile -->|投稿選択| PostDetail
```

補足:
- いいね・リポストは同一画面内で完結し、画面遷移しない
- リプライを選択した場合は投稿詳細へ遷移する。リプライの入力・投稿は投稿詳細内で行い、リプライ専用画面は作成しない
- 投稿詳細と他ユーザープロフィールは相互に遷移できる
- My Pageへの遷移はヘッダーのMy Pageアイコンから行う（「8. 共通画面部品」参照）
- Canvas・Exploration・Inboxの切り替えはフッターで行う（「8. 共通画面部品」参照）
- 投稿作成モーダルの操作は「5. ユーザー側モーダル操作」に記載する

---

## 3. My Page・プロフィール周辺の画面遷移

My Pageを起点とした画面遷移を表す。タブやモーダルの内部処理は含めない。

```mermaid
flowchart LR
    MyPage[My Page（マイページ）]
    ProfileEdit[プロフィール編集]
    Settings[設定]
    FollowList[Connect（フォロー・フォロワー一覧）]
    PostDetail[投稿詳細]
    Profile[他ユーザープロフィール]

    MyPage -->|プロフィール編集を選択| ProfileEdit
    MyPage -->|設定を選択| Settings
    MyPage -->|フォロー数 / フォロワー数を選択| FollowList
    MyPage -->|タブ内の投稿選択| PostDetail

    FollowList -->|ユーザー選択| Profile
    Profile -->|投稿選択| PostDetail

    ProfileEdit -->|保存成功| MyPage
    ProfileEdit -->|キャンセル| MyPage
```

補足:
- プロフィール編集のキャンセルはMy Pageへ戻る。未保存の変更がある場合は変更破棄確認モーダルを経由する（「5. ユーザー側モーダル操作」参照）
- プロフィール編集画面はMVP対象だが、プロフィール画像・ヘッダー画像の変更処理は対象外
- 設定内の操作はモーダルであり、「5. ユーザー側モーダル操作」に記載する
- My Pageのタブの構造は「4. My Page・Connect一覧の内部構成」に記載する

---

## 4. My Page・Connect一覧の内部構成

画面遷移ではなく、画面内部の構成を表す。六角形はタブであり、独立画面ではない。

### My Pageのアクティビティタブ

```mermaid
flowchart LR
    subgraph MyPage[My Page（マイページ）]
        TabPosts{{Piece（投稿）}}
        TabReplies{{Letter（リプライ）}}
        TabLikes{{Resonance（いいね）}}
        TabReposts{{Spread（リポスト）}}
    end
    PostDetail[投稿詳細]

    TabPosts -->|投稿選択| PostDetail
    TabReplies -->|投稿選択| PostDetail
    TabLikes -->|投稿選択| PostDetail
    TabReposts -->|投稿選択| PostDetail
```

### Connect（フォロー・フォロワー一覧）のタブ

```mermaid
flowchart LR
    MyPage[My Page（マイページ）]
    subgraph FollowList[Connect（フォロー・フォロワー一覧）]
        FollowTab{{Connect（フォロー）}}
        FollowerTab{{フォロワー}}
    end
    Profile[他ユーザープロフィール]

    MyPage -->|フォロー数を選択| FollowTab
    MyPage -->|フォロワー数を選択| FollowerTab
    FollowTab -->|ユーザー選択| Profile
    FollowerTab -->|ユーザー選択| Profile
```

補足:
- タブの切り替えは画面遷移ではない。各タブ内の投稿を選択した場合のみ投稿詳細へ遷移する
- Connect（フォロー・フォロワー一覧）は1画面で、フォロー数選択時はフォロータブ、フォロワー数選択時はフォロワータブを初期表示する
- 他ユーザープロフィールのフォロー数・フォロワー数は表示のみで、一覧へは遷移しない

---

## 5. ユーザー側モーダル操作

モーダルの開閉と戻り先を表す。すべてのモーダルは独立画面ではない。

### 投稿作成モーダル

※ 元の画面とは、投稿作成モーダルを開いた既存の画面を指します。新しい独立画面ではありません。

```mermaid
flowchart LR
    Origin[モーダルを開いた元の画面]
    PostCreate(投稿作成モーダル)

    Origin -->|投稿作成を選択| PostCreate
    PostCreate -->|投稿成功: モーダルを閉じて投稿を反映| Origin
    PostCreate -->|キャンセル: モーダルを閉じる| Origin
```

- 通常ユーザー画面から開く共通モーダルであり、独立したURLや画面を持たない
- 「元の画面」は新しい画面ではなく、モーダルを開いた画面を指す。Canvasへの固定遷移は行わない

### プロフィール編集

```mermaid
flowchart LR
    ProfileEdit[プロフィール編集]
    MyPage[My Page（マイページ）]
    DiscardModal(変更破棄確認モーダル)

    ProfileEdit -->|キャンセル: 未保存変更なし| MyPage
    ProfileEdit -->|キャンセル: 未保存変更あり| DiscardModal
    DiscardModal -->|破棄確定| MyPage
    DiscardModal -->|編集継続| ProfileEdit
```

### 設定

```mermaid
flowchart LR
    Settings[設定]
    Login[ログイン]
    PasswordModal(パスワード変更モーダル)
    LogoutModal(ログアウト確認モーダル)
    DeleteModal(アカウント削除確認モーダル)

    Settings -->|パスワード変更を選択| PasswordModal
    PasswordModal -->|保存成功 / キャンセル| Settings
    Settings -->|ログアウトを選択| LogoutModal
    LogoutModal -->|成功| Login
    LogoutModal -->|キャンセル| Settings
    Settings -->|アカウント削除を選択| DeleteModal
    DeleteModal -->|成功| Login
    DeleteModal -->|キャンセル| Settings
```

---

## 6. 管理者側画面遷移

管理者側の画面構成と画面間の遷移を表す。管理操作と確認モーダルは含めない。管理者側はユーザー側と別レイアウトで構成する。管理者機能は将来仕様として維持し、MVP対象外とする。

### ① 基本画面構成

```mermaid
flowchart TD
    AdminLogin[管理者ログイン] --> Dashboard[管理者ダッシュボード]

    Dashboard --> UserMgmt[ユーザー管理]
    Dashboard --> PostMgmt[投稿管理]
    Dashboard --> SensitiveMgmt[センシティブ投稿管理]
    Dashboard --> AuditLog[操作履歴]

    UserMgmt --> UserDetail[管理者用ユーザー詳細]
    PostMgmt --> PostDetail[管理者用投稿詳細]
    SensitiveMgmt --> SensitiveDetail[センシティブ投稿詳細]
```

### ② 詳細画面への直接遷移

```mermaid
flowchart LR
    Dashboard[管理者ダッシュボード]
    UserDetail[管理者用ユーザー詳細]
    PostDetail[管理者用投稿詳細]

    Dashboard -->|最近登録されたユーザーを選択| UserDetail
    Dashboard -->|最近の投稿を選択| PostDetail
    UserDetail -->|投稿履歴を選択| PostDetail
```

補足:
- 詳細画面の基本的な戻り先は元の管理一覧である（管理者用ユーザー詳細 → ユーザー管理、管理者用投稿詳細 → 投稿管理、センシティブ投稿詳細 → センシティブ投稿管理）
- 管理者ダッシュボードから直接遷移した場合の戻り先は未決定であり、固定しない
- 管理操作と確認モーダルは「7. 管理者側操作フロー」に記載する

---

## 7. 管理者側操作フロー

管理者による操作と確認モーダルを表す。操作は画面ではなく、確認モーダルも独立画面ではない。

### 管理者用ユーザー詳細・管理者用投稿詳細

```mermaid
flowchart LR
    UserDetail[管理者用ユーザー詳細]
    UserDetail -->|利用停止| M1(利用停止確認モーダル)
    UserDetail -->|利用停止解除| M2(利用停止解除確認モーダル)
    UserDetail -->|アカウント削除| M3(アカウント削除確認モーダル)

    PostDetail[管理者用投稿詳細]
    PostDetail -->|投稿削除| M4(投稿削除確認モーダル)
```

### センシティブ投稿詳細

```mermaid
flowchart LR
    SensitiveDetail[センシティブ投稿詳細]
    SensitiveMgmt[センシティブ投稿管理]
    HideModal(非表示確認モーダル)
    DeleteModal(削除確認モーダル)

    SensitiveDetail -->|問題なし| SensitiveMgmt
    SensitiveDetail -->|非表示| HideModal
    SensitiveDetail -->|削除| DeleteModal
    HideModal -->|処理完了| SensitiveMgmt
    DeleteModal -->|処理完了| SensitiveMgmt
    HideModal -->|キャンセル| SensitiveDetail
    DeleteModal -->|キャンセル| SensitiveDetail
```

補足:
- 管理者用ユーザー詳細・管理者用投稿詳細の確認モーダル後の表示・遷移は未決定であり、ここでは定めない
- センシティブ投稿の候補の選定方法は図に含めない

---

## 8. 共通画面部品

ヘッダー・フッターの構成と遷移先を表す。

```mermaid
flowchart LR
    subgraph Header[ヘッダー]
        AppSymbol[アプリシンボル: 表示専用]
        MyPageIcon[My Pageアイコン]
    end
    MyPageIcon -->|選択| MyPage[My Page（マイページ）]

    subgraph Footer[フッター]
        HomeNav[Canvas（ホーム）]
        SearchNav[Exploration（検索）]
        NotificationNav[Inbox（通知）]
    end
    HomeNav --> Home[Canvas（ホーム・タイムライン）]
    SearchNav --> Search[Exploration（検索）]
    NotificationNav --> Notification[Inbox（通知）]
```

補足:
- ヘッダー: アプリシンボルを左端、My Pageアイコンを右端に配置する。アプリシンボルは表示専用で、クリック・画面遷移を持たない。My PageアイコンはMy Pageへ遷移する
- フッター: Canvas / Exploration / Inbox の共通ナビゲーションで、通常ユーザー画面で利用する。プロフィール編集・設定では通常フッターを表示しない。通知には未読バッジを表示可能とする
- 投稿作成: 共通の投稿作成モーダルとして利用し、独立画面ではない。操作フローは「5. ユーザー側モーダル操作」に記載する
