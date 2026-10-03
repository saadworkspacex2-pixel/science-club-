import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, MapPin, CalendarDays, Trophy, Medal, Quote } from "lucide-react";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { MetaItem } from "@/components/cards";
import { bn } from "@/lib/utils";
import { getTeamForAchievement } from "@/lib/achievement-members";
import { Users } from "lucide-react";
import { Monogram } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [a] = await db.select().from(achievements).where(eq(achievements.id, Number(id))).limit(1);
  return a ? { title: a.title, description: a.subtitle || "" } : { title: "অর্জন" };
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [a] = await db.select().from(achievements).where(eq(achievements.id, Number(id))).limit(1);
  if (!a) notFound();

  const team = await getTeamForAchievement(a.id);
  const photos = Array.isArray(a.photos) ? a.photos.filter((u) => typeof u === "string" && u) : [];

  return (
    <article className="mx-auto max-w-5xl pb-24 pt-24 sm:pb-20 sm:pt-28">
      <div className="px-4 sm:px-5">
        <Reveal>
          <Link href="/achievements" className="chip mb-8 !py-2 transition-all hover:scale-[1.04]">
            <ArrowRight className="h-4 w-4" /> সব অর্জন
          </Link>
          {a.eventName && <span className="chip mb-4 ml-2 !py-2">{a.eventName}</span>}
          <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight">
            {a.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {a.date && <MetaItem icon={<CalendarDays className="h-4 w-4" style={{ color: "var(--brand)" }} />} label={a.date} />}
            {a.location && <MetaItem icon={<MapPin className="h-4 w-4" style={{ color: "var(--brand)" }} />} label={a.location} />}
            <MetaItem icon={<Trophy className="h-4 w-4 text-amber-500" />} label={`${bn(a.prizes)}টি পুরস্কার`} />
            <MetaItem icon={<Medal className="h-4 w-4 text-orange-500" />} label={`${bn(a.medals)}টি মেডেল`} />
          </div>
        </Reveal>
      </div>

      {a.coverImage && (
        <Reveal delay={120} className="mt-8 px-4 sm:mt-10 sm:px-5">
          <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
            <img src={a.coverImage} alt={a.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>
      )}

      <div className="px-4 sm:px-5">
        {a.subtitle && (
          <Reveal delay={180}>
            <div className="glass-card mt-8 p-5 sm:mt-10 sm:p-9">
              <Quote className="h-6 w-6" style={{ color: "var(--brand)" }} />
              <p className="mt-4 text-[clamp(1.05rem,2vw,1.3rem)] font-medium leading-[1.7]">
                {a.subtitle}
              </p>
            </div>
          </Reveal>
        )}

        {a.description && (
          <Reveal delay={240}>
            <div className="mt-10 space-y-5 text-[16px]" style={{ color: "var(--ink-2)" }}>
              <h2 className="text-[clamp(1.3rem,2.6vw,1.8rem)] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                পুরো গল্পটা
              </h2>
              {a.description.split("\n").filter(Boolean).map((p: string, i: number) => (
                <p key={i} className="leading-[1.9]">{p}</p>
              ))}
            </div>
          </Reveal>
        )}

        {team.length > 0 && (
          <Reveal delay={260}>
            <section className="mt-10">
              <h2 className="mb-4 flex items-center gap-2.5 text-[clamp(1.2rem,2.4vw,1.6rem)] font-bold tracking-tight">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]" style={{ color: "var(--brand)" }}>
                  <Users className="h-4.5 w-4.5" />
                </span>
                আমাদের দল
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {team.map((t) => (
                  <Link
                    key={t.id}
                    href={`/members/${t.id}`}
                    className="glass-card hover-lift flex items-center gap-3 p-3 sm:p-4"
                  >
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.name} className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-12 sm:w-12" />
                    ) : (
                      <Monogram name={t.name} size={48} />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold">{t.name}</span>
                      <span className="block truncate text-[11px]" style={{ color: "var(--ink-3)" }}>
                        {t.role}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {photos.length > 0 && (
          <Reveal delay={300}>
            <div className="mt-12">
              <h2 className="mb-6 text-[clamp(1.3rem,2.6vw,1.8rem)] font-bold tracking-tight">
                ইভেন্টের ছবি
              </h2>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {photos.map((u: string, i: number) => (
                  <div key={i} className="overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
                    <img src={u} alt={`${a.title} ${i + 1}`} className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
