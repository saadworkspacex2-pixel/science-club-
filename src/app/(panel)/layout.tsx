import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getSession, isStaff } from "@/lib/auth";
import AdminShell from "@/components/admin/shell";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!isStaff(session)) redirect("/admin/login");

  const [{ c: pending }] = await db
    .select({ c: count() })
    .from(applications)
    .where(eq(applications.status, "pending"));

  return (
    <AdminShell userName={session!.n} role={session!.r} pending={pending}>
      {children}
    </AdminShell>
  );
}
