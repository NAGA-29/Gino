# AI Instruction Registry 設計書

> Status: Draft  
> Goal: AI向けInstruction / Skill / Rulesを一元管理する軽量な個人用ダッシュボード  
> Initial Stack: Hono + React + PostgreSQL

---

## 1. 背景

OpenAI Skillsを含むAI向けInstruction機構は今後も発展する可能性がある一方で、
現在の名称・仕様・管理方式が将来そのまま残る保証はない。

そのため、本システムは **OpenAI Skills専用管理ツールにはしない**。

管理対象を一段抽象化し、

> AIに与える再利用可能なInstruction Assetを管理する基盤

として設計する。

OpenAI Skillsはその出力先・Adapterの一つとして扱う。

---

# 2. 基本方針

## 2.1 最初から大きく作らない

このプロジェクト自体が将来不要になる可能性も考慮し、
初期段階では短期間で作れる管理基盤に限定する。

初期MVPでは以下を重視する。

- Instructionの登録
- 使用条件の管理
- Version管理
- 差分確認
- Projectへの紐付け
- Markdown Export

以下は後回しにする。

- AI自動レビュー
- LLM Evaluation
- Embedding
- Vector DB
- 大量並列Evaluation
- Agent Runtime
- MCP Hosting

---

# 3. コンセプト

本システムではInstructionを単なるMarkdownではなく、
以下の情報を持つ資産として扱う。

```text
Instruction Asset
├── Metadata
├── Scope
├── Activation Rules
├── Instructions
├── Dependencies
├── Conflicts
├── Tests
├── Versions
└── Export Settings
```

Markdownは正本ではなく、外部サービス向けのExport Formatとして扱う。

---

# 4. 管理対象

初期段階では以下を想定する。

- OpenAI Skills
- AGENTS.md
- CLAUDE.md
- Cursor Rules
- System Prompt
- Project Prompt
- 独自Instruction

将来的には以下にも対応できる構造とする。

- Gemini
- GitHub Copilot
- MCP Workflow
- Agent Definition
- その他のAI向けルール形式

---

# 5. 技術スタック

## Frontend

```text
React
TypeScript
Vite
TanStack Query
React Router
```

UIライブラリ候補:

```text
shadcn/ui
Mantine
MUI
```

初期段階では開発速度を優先する。

---

## Backend

```text
TypeScript
Hono
Zod
Drizzle ORM
PostgreSQL
```

### Honoを採用する理由

現在の主要責務は以下。

```text
CRUD
Version管理
Diff
Project管理
Export
```

Python固有のAI・ML処理は初期段階では存在しない。

そのためFastAPIを採用するメリットは小さい。

Honoを利用することで、

- Backend / FrontendをTypeScriptで統一
- Zod Schemaを共有
- 実装量を減らせる
- 個人開発で高速にMVPを構築できる
- Cloudflare Workers等への展開も容易
- 将来不要になった場合の sunk cost を抑えられる

というメリットを得る。

---

# 6. Monorepo構成

```text
apps/
├── web/
│   └── React
│
└── api/
    └── Hono

packages/
├── domain/
├── schema/
├── exporters/
└── shared/
```

---

# 7. システム構成

```text
┌──────────────────────┐
│        React         │
│                      │
│ Dashboard            │
│ Instruction Editor   │
│ Diff Viewer          │
│ Project Settings     │
└──────────┬───────────┘
           │
           │ HTTP
           ▼
┌──────────────────────┐
│        Hono          │
│                      │
│ Instruction API      │
│ Version API          │
│ Project API          │
│ Export API           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

初期段階ではRedis・Queue・Workerは導入しない。

---

# 8. Domain

## 8.1 Instruction

AIへ与える再利用可能な指示。

例:

```text
API Design Review
Laravel Architecture Review
Security Review
Motion Studio Development
Go CLI Development
```

---

# 9. Scope

Instructionの適用範囲。

```text
GENERAL
PERSONAL
PROJECT
ORGANIZATION
EXPERIMENTAL
```

## GENERAL

広範囲で利用可能。

例:

```text
API Design Review
Security Review
SQL Review
```

## PERSONAL

個人の開発思想・好み・ルール。

## PROJECT

特定プロジェクト専用。

例:

```text
Motion Studio
Sample Web App
Sample Mobile App
Internal Tools
```

## EXPERIMENTAL

試験運用中のInstruction。

---

# 10. Instruction構造

```yaml
name: api-design-review

display_name: API Design Review

description: >
  API設計をレビューする。

scope: general

status: published

activation:
  when:
    - 新規APIを設計する
    - API仕様を変更する
    - REST API設計をレビューする

  when_not:
    - 単純なコード整形
    - UIのみの変更

instructions:
  - REST semanticsを確認する
  - HTTP status codeを確認する
  - Resource namingを確認する

tags:
  - api
  - backend
  - architecture
```

---

# 11. Activation Rule

このシステムではInstruction本文だけでなく、

> いつ使うべきか

を重要な管理対象とする。

初期構造:

```text
when
when_not
required_context
preferred_context
```

例:

```yaml
activation:

  when:
    - Hono APIを新規設計する
    - REST APIレビューを行う

  when_not:
    - React Componentのみ変更する

  required_context:
    - backend

  preferred_context:
    - typescript
```

---

# 12. Project Profile

Project単位で利用するInstructionをまとめる。

例:

```text
Motion Studio
```

```yaml
instructions:

  general:
    - api-review
    - security-review

  personal:
    - personal-development-policy

  project:
    - motion-studio
    - motion-processing
```

最終的なInstruction集合は以下から構成する。

```text
General
+
Personal
+
Project
+
Task Specific
```

---

# 13. Lifecycle

```text
DRAFT
REVIEW
PUBLISHED
DEPRECATED
ARCHIVED
```

基本フロー:

```text
Draft
  ↓
Review
  ↓
Published
  ↓
Deprecated
  ↓
Archived
```

個人利用が中心のため、初期MVPではReview状態は必須ではない。

---

# 14. Version管理

Instruction変更履歴を保存する。

```text
Instruction
   │
   ├── v1.0.0
   ├── v1.1.0
   ├── v1.2.0
   └── v2.0.0
```

SemVerを基本とする。

## PATCH

誤字修正・文章修正。

## MINOR

Instruction追加など後方互換性のある変更。

## MAJOR

AIの利用条件や挙動を大きく変更する変更。

特にActivation Rule変更はMajor候補とする。

ただし初期MVPではVersion番号を手動入力可能とし、
厳密なSemVer enforcementは行わない。

---

# 15. Diff Viewer

Version間差分を確認する。

```diff
activation:

- Backend開発時に利用
+ API境界・Domain構造を設計または変更する場合に利用
```

初期段階ではテキストDiffで十分とする。

将来的には、

```text
Instruction Diff
Activation Diff
Dependency Diff
Test Diff
```

を個別表示する。

---

# 16. Export

CanonicalなInstructionから各AI向け形式を生成する。

```text
Canonical Instruction
          │
          ▼
       Exporter
          │
 ┌────────┼──────────┐
 ▼        ▼          ▼

OpenAI    Claude     Cursor

Skill     CLAUDE.md  Rule
```

初期MVPでは以下のみ実装する。

```text
Generic Markdown
```

OpenAI Skill等の個別対応は必要性が確認できてから追加する。

---

# 17. Exporter構造

```text
Exporter
├── MarkdownExporter
├── OpenAISkillExporter
├── ClaudeExporter
├── CursorExporter
└── AgentsMdExporter
```

MVP:

```text
MarkdownExporter
```

のみ。

---

# 18. Dashboard

例:

```text
Instructions
──────────────────────

Total             42

General           15
Personal           8
Project            14
Experimental       5
```

Recent Changes:

```text
API Review
v2.1.0

Go CLI
v1.4.2

Motion Studio
v1.3.0
```

---

# 19. Instruction一覧

表示項目:

```text
Name
Scope
Version
Status
Project
Updated At
```

検索条件:

```text
Name
Tag
Scope
Project
Status
```

---

# 20. Instruction詳細

```text
API Design Review

v2.1.0

Published

────────────────────

Overview

Activation

Instructions

Versions

Projects

Export
```

---

# 21. Editor

構造化UIを基本とする。

```text
General

Name
Description
Scope
Status
```

```text
Activation

When
When Not
Required Context
Preferred Context
```

```text
Instructions

Markdown Editor
```

```text
Tags
```

---

# 22. Database

## instructions

```text
id
name
display_name
description
scope
status
current_version_id
created_at
updated_at
```

---

## instruction_versions

```text
id
instruction_id
version
content
change_summary
created_at
```

`content`はJSONBを利用する。

例:

```json
{
  "activation": {
    "when": [],
    "when_not": [],
    "required_context": [],
    "preferred_context": []
  },
  "instructions": [],
  "tags": []
}
```

---

## projects

```text
id
name
description
created_at
updated_at
```

---

## project_instructions

```text
project_id
instruction_id
enabled
priority
```

---

# 23. API

Base:

```text
/api/v1
```

## Instructions

```text
GET    /instructions
POST   /instructions

GET    /instructions/{id}
PUT    /instructions/{id}
DELETE /instructions/{id}
```

## Versions

```text
GET  /instructions/{id}/versions
GET  /instructions/{id}/versions/{version}
POST /instructions/{id}/versions
```

## Diff

```text
GET /instructions/{id}/diff
```

Query:

```text
from=v1.2.0
to=v1.3.0
```

## Projects

```text
GET    /projects
POST   /projects

GET    /projects/{id}
PUT    /projects/{id}

GET    /projects/{id}/instructions
POST   /projects/{id}/instructions
DELETE /projects/{id}/instructions/{instruction_id}
```

## Export

```text
POST /exports
```

Request:

```json
{
  "instruction_ids": [],
  "format": "markdown"
}
```

---

# 24. Backend構成

```text
apps/api/src/

├── index.ts
│
├── routes/
│   ├── instructions.ts
│   ├── projects.ts
│   └── exports.ts
│
├── services/
│   ├── instruction-service.ts
│   ├── project-service.ts
│   └── export-service.ts
│
├── repositories/
│
└── db/
```

初期段階では過剰なDDDは行わない。

ただし、

```text
Route
Service
Repository
```

程度の責務分離は維持する。

---

# 25. Frontend構成

```text
apps/web/src/

├── app/
├── pages/
├── features/
│   ├── instruction/
│   ├── project/
│   └── export/
├── components/
├── api/
└── hooks/
```

Feature単位で整理する。

---

# 26. Shared Schema

Frontend / Backend間でZod Schemaを共有する。

```text
packages/schema/
```

例:

```ts
export const InstructionSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  scope: z.enum([
    "general",
    "personal",
    "project",
    "organization",
    "experimental"
  ])
})
```

目的:

```text
Frontend validation
        ↓
Shared Zod Schema
        ↓
Backend validation
```

---

# 27. MVP

Phase 1では以下のみ実装する。

```text
Instruction CRUD

Scope

Activation Rule

Version管理

Version Diff

Project Profile

Markdown Export
```

これを最初の完成ラインとする。

---

# 28. Phase 2

MVPを実際に使い、
価値があると判断できた場合のみ追加する。

```text
Skill / Instruction Linter

Conflict Detection

Dependency

AI Review

変更Proposal
```

---

# 29. Phase 3

さらに必要性が確認できた場合のみ実装する。

```text
Evaluation

Trigger Matching

Regression Test

Playground
```

---

# 30. Phase 4

各AIサービス向けAdapterを増やす。

```text
OpenAI Skill Export

CLAUDE.md Export

Cursor Rules Export

AGENTS.md Export
```

---

# 31. 将来的なAI処理

大量Evaluation等が必要になった場合でも、
Hono APIを置き換える必要はない。

```text
Hono API
   │
   ├── PostgreSQL
   │
   └── Queue
          │
          ▼
     Evaluation Worker
```

Workerの実装技術は用途に応じて選択する。

候補:

```text
Go
Python
TypeScript
```

Python固有のAIライブラリが必要になった場合のみPython Workerを追加する。

---

# 32. 非目標

初期段階では以下を実装しない。

```text
独自LLM
独自Agent Runtime
Chat UI
Vector DB
Embedding Search
MCP Server Hosting
Prompt Marketplace
複雑なWorkflow Engine
Organization IAM
```

このシステムの責務は、

> AIそのものを実行すること

ではない。

責務は、

> AIに渡すInstructionを管理・Version管理・整理・Exportすること

とする。

---

# 33. MVP成功条件

以下が成立すればMVP成功。

```text
Instructionを登録できる

いつ使用するInstructionなのか管理できる

Version履歴を残せる

変更Diffを確認できる

ProjectごとにInstructionをまとめられる

MarkdownでExportできる
```

AI機能がゼロでもMVPとして成立する。

---

# 34. 開発方針

このプロジェクトは長期存続を前提にしない。

OpenAI Skillsや各AI Agentの仕様変更を観察しながら、
実際に自分が使って価値を感じる機能だけ追加する。

したがって、

```text
まず作る
↓
自分で使う
↓
不便を記録する
↓
必要な機能だけ追加する
```

を基本サイクルとする。

最初から将来のAgent Platformを作ろうとしない。

---

# 35. 現時点での判断

初期構成:

```text
React
+
Hono
+
PostgreSQL
```

必要に応じて:

```text
Drizzle ORM
Zod
TanStack Query
```

を利用する。

この構成なら、
OpenAI Skillsという仕組み自体が将来変化・縮小・廃止された場合でも、
開発コストを比較的小さく抑えられる。

また、このシステムが継続して有用だった場合には、
Instruction Registryから

```text
AI Configuration Registry
```

へ発展させる余地を残す。
