import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import ProjectsFilter from "@/components/projects-filter";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "প্রকল্প ইতিহাস",
  description: "সাইেন্স ক্লাবের সফল, চলমান, ব্যর্থ ও ভবিষ্যৎ প্রকল্পসমূহের পূর্ণ ইতিহাস।",
};

export default async function ProjectsPage() {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder));

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="উদ্ভাবন"
        title="প্রকল্প ইতিহাস"
        desc="প্রতিটি প্রকল্প একেকটি শিক্ষা — সফলটা অনুপ্রেরণা দেয়, ব্যর্থটা পথ দেখায়।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <Reveal>
            <ProjectsFilter projects={rows} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
