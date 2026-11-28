/**
 * 開発用サンプルデータ。設計書に出てくる例をそのまま登録する。
 *   pnpm db:seed
 * 既存データがある場合はスキップする (--force で全削除して再投入)。
 */
import { sql } from "drizzle-orm";
import { createApp } from "../app";
import { env } from "../env";
import { createDb } from "./client";

const { db, close } = createDb(env.databaseUrl);
const app = createApp({ db });

async function call<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await app.request(`/api/v1${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

async function main() {
  const force = process.argv.includes("--force");
  const [{ n }] = (await db.execute(sql`select count(*)::int as n from instructions`)) as unknown as [{ n: number }];
  if (n > 0 && !force) {
    console.log(`instructions already has ${n} rows. use --force to reset.`);
    return;
  }
  if (force) {
    await db.execute(sql`truncate table project_instructions, projects, instruction_versions, instructions cascade`);
  }

  const apiReview = await call("POST", "/instructions", {
    name: "api-design-review",
    displayName: "API Design Review",
    description: "API設計をレビューする。",
    scope: "general",
    status: "published",
    version: "1.0.0",
    changeSummary: "Initial version",
    content: {
      activation: {
        when: ["Backend開発時に利用"],
        whenNot: ["単純なコード整形", "UIのみの変更"],
        requiredContext: ["backend"],
        preferredContext: ["typescript"],
      },
      instructions: ["REST semanticsを確認する", "Resource namingを確認する"],
      tags: ["api", "backend", "architecture"],
    },
  });
  await call("POST", `/instructions/${apiReview.id}/versions`, {
    version: "1.1.0",
    changeSummary: "HTTP status codeの確認を追加",
    content: {
      activation: apiReview.currentVersion.content.activation,
      instructions: ["REST semanticsを確認する", "HTTP status codeを確認する", "Resource namingを確認する"],
      tags: ["api", "backend", "architecture"],
    },
  });
  await call("POST", `/instructions/${apiReview.id}/versions`, {
    version: "2.0.0",
    changeSummary: "Activation Ruleを明確化",
    content: {
      activation: {
        when: ["API境界・Domain構造を設計または変更する場合に利用", "新規APIを設計する", "REST APIレビューを行う"],
        whenNot: ["単純なコード整形", "UIのみの変更"],
        requiredContext: ["backend"],
        preferredContext: ["typescript"],
      },
      instructions: ["REST semanticsを確認する", "HTTP status codeを確認する", "Resource namingを確認する"],
      tags: ["api", "backend", "architecture"],
    },
  });

  const security = await call("POST", "/instructions", {
    name: "security-review",
    displayName: "Security Review",
    description: "認証・認可・入力検証・秘密情報の扱いをレビューする。",
    scope: "general",
    status: "published",
    content: {
      activation: { when: ["認証・認可を変更する", "外部入力を扱うコードを追加する"], whenNot: ["ドキュメントのみの変更"] },
      instructions: ["入力はすべて境界で検証する", "秘密情報をログ・コミットに含めない", "権限チェックの漏れを確認する"],
      tags: ["security"],
    },
  });

  await call("POST", "/instructions", {
    name: "sql-review",
    displayName: "SQL Review",
    scope: "general",
    status: "published",
    content: {
      activation: { when: ["SQL・マイグレーションを追加/変更する"] },
      instructions: ["インデックスの有無を確認する", "N+1を避ける", "破壊的マイグレーションは段階的に行う"],
      tags: ["sql", "database"],
    },
  });

  const policy = await call("POST", "/instructions", {
    name: "personal-development-policy",
    displayName: "Personal Development Policy",
    description: "個人の開発思想・好み・ルール。",
    scope: "personal",
    status: "published",
    content: {
      activation: { when: ["すべての開発タスク"] },
      instructions: ["最初から大きく作らない", "まず作る → 自分で使う → 不便を記録する → 必要な機能だけ追加する", "コミットは細かく分ける"],
      tags: ["policy"],
    },
  });

  const goCli = await call("POST", "/instructions", {
    name: "go-cli-development",
    displayName: "Go CLI Development",
    scope: "general",
    status: "published",
    version: "1.4.2",
    content: {
      activation: { when: ["Go製CLIを開発する"], requiredContext: ["go"] },
      instructions: ["cobraでサブコマンドを構成する", "エラーはwrapして返す"],
      tags: ["go", "cli"],
    },
  });

  const motion = await call("POST", "/instructions", {
    name: "motion-studio",
    displayName: "Motion Studio Development",
    description: "サンプルプロジェクト Motion Studio 固有のルール。",
    scope: "project",
    status: "published",
    version: "1.3.0",
    content: {
      activation: { when: ["Motion Studioのコードを変更する"], requiredContext: ["motion"] },
      instructions: ["モーションデータの座標系・単位を明示する", "既存のモーションデータ形式との互換性を壊さない"],
      tags: ["motion"],
    },
  });

  const motionProcessing = await call("POST", "/instructions", {
    name: "motion-processing",
    displayName: "Motion Processing",
    scope: "project",
    status: "review",
    content: {
      activation: { when: ["モーションのフィルタ・補間処理を実装する"] },
      instructions: ["フレームレート依存の処理を避ける"],
      tags: ["motion"],
    },
  });

  await call("POST", "/instructions", {
    name: "llm-eval-draft",
    displayName: "LLM Evaluation (Draft)",
    scope: "experimental",
    status: "draft",
    content: { instructions: ["評価観点を列挙する"], tags: ["eval"] },
  });

  const motionStudio = await call("POST", "/projects", { name: "Motion Studio", description: "モーションを扱うサンプルプロジェクト" });
  for (const [i, priority] of [
    [apiReview, 10],
    [security, 0],
    [policy, 0],
    [motion, 10],
    [motionProcessing, 0],
  ] as const) {
    await call("POST", `/projects/${motionStudio.id}/instructions`, { instructionId: i.id, priority });
  }

  const cli = await call("POST", "/projects", { name: "Go CLI Tools", description: "" });
  for (const i of [goCli, policy, security]) {
    await call("POST", `/projects/${cli.id}/instructions`, { instructionId: i.id });
  }

  console.log("seeded sample data");
}

try {
  await main();
} finally {
  await close();
}
