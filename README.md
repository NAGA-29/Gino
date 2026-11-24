# AI Instruction Registry

AI向けの Instruction / Skill / Rules を一元管理する、軽量な個人用ダッシュボード。

OpenAI Skills 専用ツールではなく、「AIに与える再利用可能な Instruction Asset」を管理する基盤として作っています。
Markdown は正本ではなく Export Format の一つとして扱います。設計は [docs/design.md](docs/design.md) を参照してください。

## MVP (Phase 1) で実装済みの機能

| 設計書のMVP成功条件 | 実装 |
| --- | --- |
| Instructionを登録できる | 構造化エディタ (General / Activation / Instructions / Tags) |
| いつ使用するInstructionなのか管理できる | Activation Rule (`when` / `whenNot` / `requiredContext` / `preferredContext`) |
| Version履歴を残せる | 本文を変更すると新Versionとして保存。SemVer の推奨 bump を表示 (Activation変更 → MAJOR) |
| 変更Diffを確認できる | Version間の Unified Diff と、セクション別 (Activation / Instruction / Body / Tag) Diff |
| ProjectごとにInstructionをまとめられる | Project Profile (General → Organization → Personal → Project → Experimental、同レイヤー内は priority 順) |
| MarkdownでExportできる | 単体 / 複数選択 / Project単位で Generic Markdown をプレビュー・コピー・ダウンロード |

その他: Dashboard (Scope / Status 別件数、最近の変更)、一覧の検索 (Name / Tag / Scope / Project / Status)、Lifecycle (draft → review → published → deprecated → archived)。

## 構成

```text
apps/
├── api/        Hono + Drizzle ORM + PostgreSQL
└── web/        React + Vite + TanStack Query + React Router + Mantine
packages/
├── schema/     Zod Schema (Frontend / Backend で共有)
├── domain/     SemVer, Diff, Project Profile の合成
├── exporters/  Exporter インターフェースと MarkdownExporter
└── shared/     共通型・ユーティリティ
```

## セットアップ

必要なもの: Node.js 22, pnpm 10, PostgreSQL 16 (Docker でも可)

```bash
pnpm install
```

```bash
docker compose up -d
```

```bash
pnpm db:migrate
```

```bash
pnpm db:seed
```

```bash
pnpm dev
```

- Web: http://localhost:5173 (`/api` は API に proxy されます)
- API: http://localhost:8787/api/v1

環境変数は `apps/api/.env.example` を参照してください (既定値でローカルの PostgreSQL に接続します)。

## テスト

API のテストは実際の PostgreSQL (`registry_test` データベース) に対して実行します。

```bash
docker compose exec postgres createdb -U postgres registry_test
```

```bash
pnpm test
```

```bash
pnpm typecheck
```

## API

Base: `/api/v1`。リクエスト/レスポンスの JSON は camelCase です。

| Method | Path | 説明 |
| --- | --- | --- |
| GET | `/instructions?q=&tag=&scope=&status=&projectId=` | 一覧・検索 |
| POST | `/instructions` | 作成 (初期Version込み) |
| GET / PUT / DELETE | `/instructions/:id` | 取得 / メタデータ更新 / 削除 |
| GET / POST | `/instructions/:id/versions` | Version一覧 (SemVer降順) / 新Version作成 (current になる) |
| GET | `/instructions/:id/versions/:version` | Version取得 (`v1.2.0` / `1.2.0` どちらも可) |
| GET | `/instructions/:id/diff?from=v1.2.0&to=v1.3.0` | Version間Diff |
| GET / POST | `/projects` | Project一覧 / 作成 |
| GET / PUT / DELETE | `/projects/:id` | 取得 / 更新 / 削除 |
| GET / POST | `/projects/:id/instructions` | Project Profile 取得 / 紐付け追加・更新 (enabled, priority) |
| DELETE | `/projects/:id/instructions/:instructionId` | 紐付け解除 |
| POST | `/exports` | `{ instructionIds?, projectId?, format: "markdown" }`。`?download=1` でファイルとして返す |
| GET | `/exports/formats` | 対応Format一覧 |
| GET | `/dashboard` | 集計 |

設計書からの差分:

- Version の本文 (`content`) には `instructions` (箇条書きルール) に加えて任意の `body` (Markdown) を持たせています。
- メタデータ (name, scope, status など) は上書き更新、本文 (Activation / Instructions / Body / Tags) の変更は新Versionとして保存します。
- MVP では SemVer の bump ルールは強制せず、形式チェックと同一番号の重複禁止のみ行います。推奨 bump はUIでヒントとして表示します。
- 便利のため `DELETE /projects/:id`、`GET /exports/formats`、`GET /dashboard` を追加しています。

## 今後 (Phase 2 以降)

実際に使って価値を感じた場合のみ追加します: Linter / Conflict Detection / Dependency / AI Review / Evaluation / 各AIサービス向け Exporter (OpenAI Skill, CLAUDE.md, Cursor Rules, AGENTS.md)。
新しい Export 形式は `packages/exporters` の `Exporter` インターフェースを実装して登録するだけで追加できます。
