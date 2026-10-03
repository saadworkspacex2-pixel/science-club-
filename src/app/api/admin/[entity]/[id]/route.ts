import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getSession, isStaff, hashPassword } from "@/lib/auth";
import { ENTITY_MAP } from "@/lib/server-entities";
import { syncAchievementMembers } from "@/lib/achievement-members";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ entity: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity, id } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
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

  if (cfg.special === "users" && body.password) {
    const password = String(body.password);
    if (password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }
    data.passwordHash = hashPassword(password);
  }

  if (entity === "achievements" && Array.isArray(body.memberIds)) {
    await syncAchievementMembers(Number(id), body.memberIds as number[]);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ row: { id: Number(id) } });
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await (db.update(cfg.table as any) as any)
      .set(data)
      .where(eq(cfg.table.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
    if (cfg.special === "users") {
      const rec = row as Record<string, unknown>;
      delete rec.passwordHash;
    }
    return NextResponse.json({ row });
  } catch (e: unknown) {
    const msg = e instanceof Error && e.message.includes("unique") ? "এই মানটি আগে থেকেই আছে" : "ত্রুটি হয়েছে";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity, id } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db.delete(cfg.table as any) as any).where(eq(cfg.table.id, Number(id)));
  return NextResponse.json({ ok: true });
}
