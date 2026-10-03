import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSession, isStaff } from "@/lib/auth";
import { BRANDING_KEYS, getBranding } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
  return NextResponse.json({ branding: await getBranding() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const entries = BRANDING_KEYS.filter((k) => k in body).map((k) => ({
    key: k,
    value: String(body[k] ?? "").trim(),
  }));

  if (!entries.length) {
    return NextResponse.json({ error: "কোনো পরিবর্তন পাওয়া যায়নি" }, { status: 400 });
  }

  for (const e of entries) {
    await db
      .insert(settings)
      .values(e)
      .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
  }

  return NextResponse.json({ ok: true, branding: await getBranding() });
}
