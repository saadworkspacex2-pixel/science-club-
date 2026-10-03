import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import LoginForm from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (isStaff(session)) redirect("/admin");
  if (session) redirect("/profile");
  return <LoginForm mode="admin" hint={{ u: "admin", p: "admin123" }} />;
}
