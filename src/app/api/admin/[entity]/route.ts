import { NextRequest, NextResponse } from "next/server";
import { ilike, or, asc, type Column } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession, isStaff, hashPassword } from "@/lib/auth";
import { ENTITY_MAP } from "@/lib/server-entities";
import { syncAchievementMembers, getMemberIdMap } from "@/lib/achievement-members";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ entity: string }> };

function sanitize(rows: Record<string, unknown>[], special?: string) {
  if (special !== "users") return rows;
  return rows.map(({ passwordHash: _p, ...rest }) => rest);
}

function pickBody(cfg: (typeof ENTITY_MAP)[string], body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const key of cfg.writable) {
    if (!(key in body)) continue;
    let v = body[key];
    if (cfg.ints?.includes(key)) {
      v = v === "" || v === null || v === undefined ? null : Number(v);
    } else if (cfg.bools?.includes(key)) {
      v = Boolean(v);
    } else if (typeof v === "string") {
      v = v.trim();
    }
    data[key] = v;
  }
  return data;
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const orderCol = (cfg.order ?? asc(cfg.table.id)) as never;
  const table = cfg.table as never;

  let rows: unknown[];
  if (q && cfg.search?.length) {
    const p = `%${q}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = await (db.select().from(table as any) as any)
      .where(or(...cfg.search.map((c: Column) => ilike(c, p))))
      .orderBy(orderCol);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = await (db.select().from(table as any) as any).orderBy(orderCol);
  }

  let out = sanitize(rows as Record<string, unknown>[], cfg.special);
  if (entity === "achievements") {
    const map = await getMemberIdMap(out.map((r) => Number(r.id)));
    out = out.map((r) => ({ ...r, memberIds: map.get(Number(r.id)) ?? [] }));
  }

  return NextResponse.json({ rows: out });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });
  if (entity === "messages") return NextResponse.json({ error: "সমর্থিত নয়" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = pickBody(cfg, body);

  if (cfg.special === "users") {
    const password = String(body.password || "");
    if (password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }
    (data as Record<string, unknown>).passwordHash = hashPassword(password);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await (db.insert(cfg.table as any) as any).values(data).returning();
    if (entity === "achievements" && Array.isArray(body.memberIds)) {
      await syncAchievementMembers(Number((row as { id: number }).id), body.memberIds as number[]);
    }
    return NextResponse.json({ row: sanitize([row as Record<string, unknown>], cfg.special)[0] });
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes("unique") ? "এই মানটি আগে থেকেই আছে" : "ত্রুটি হয়েছে";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
