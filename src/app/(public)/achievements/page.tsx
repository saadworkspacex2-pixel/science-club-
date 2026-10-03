import { asc } from "drizzle-orm";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { AchievementCard } from "@/components/cards";
import { Reveal } from "@/components/motion";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "অর্জনসমূহ",
  description: "বিউএসএস সাইেন্স ক্লাবের জাতীয় ও আন্তর্জাতিক পুরস্কার, মেডেল ও সাফল্যের গল্প।",
};

export default async function AchievementsPage() {
  const rows = await db.select().from(achievements).orderBy(asc(achievements.sortOrder));

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="গর্বের মুহূর্ত"
        title="আমাদের অর্জনসমূহ"
        desc="প্রতিটি পুরস্কারের পেছনে আছে অসংখ্য পরীক্ষা, ভুল আর নতুন করে ওঠার গল্প।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {rows.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 90}>
                <AchievementCard a={a} big />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
