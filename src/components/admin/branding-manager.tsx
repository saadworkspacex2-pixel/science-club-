"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, Palette, Info, RotateCcw } from "lucide-react";
import UploadField from "@/components/admin/upload-field";
import { Logo } from "@/components/logo";

type Branding = {
  clubLogo: string;
  schoolLogo: string;
  clubName: string;
  schoolName: string;
};

const EMPTY: Branding = { clubLogo: "", schoolLogo: "", clubName: "", schoolName: "" };

export default function BrandingManager() {
  const [form, setForm] = useState<Branding>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/branding");
        const data = await res.json();
        if (data.branding) setForm(data.branding);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k: keyof Branding, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_logo: form.clubLogo,
          school_logo: form.schoolLogo,
          club_name: form.clubName,
          school_name: form.schoolName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ ব্যর্থ");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch {
      setError("সংযোগ ত্রুটি");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand)" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
            <Palette className="h-5 w-5" style={{ color: "var(--brand)" }} />
          </span>
          ব্র্যান্ডিং ও লোগো
        </h1>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
          এখানে লোগো বদলালে পুরো ওয়েবসাইটের নেভিগেশন ও ফুটারে সঙ্গে সঙ্গে পরিবর্তন হবে।
        </p>
      </div>

      {/* Live preview */}
      <div className="glass-card mb-4 p-4 sm:mb-5 sm:p-5">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
          প্রিভিউ
        </p>
        <div className="flex items-center gap-3 rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
          <Logo size={40} src={form.clubLogo} alt="ক্লাব লোগো" />
          {form.schoolLogo && (
            <img src={form.schoolLogo} alt="স্কুল লোগো" className="h-9 w-9 rounded-[22%] object-contain" />
          )}
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[15px] font-bold tracking-tight">
              {form.clubName || "বিউএসএস সাইেন্স ক্লাব"}
            </span>
            <span className="block truncate text-[10.5px]" style={{ color: "var(--ink-3)" }}>
              {form.schoolName || "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ"}
            </span>
          </span>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5">
        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-1 text-[15px] font-bold">ক্লাব লোগো</h2>
          <p className="mb-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
            নেভিগেশন ও ফুটারে প্রধান লোগো। PNG (transparent) সবচেয়ে ভালো।
          </p>
          <UploadField
            value={form.clubLogo}
            onChange={(url) => set("clubLogo", url)}
            accept="image/*"
            kind="image"
          />
          {form.clubLogo && (
            <button
              onClick={() => set("clubLogo", "")}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-500"
            >
              <RotateCcw className="h-3.5 w-3.5" /> ডিফল্ট লোগোতে ফিরুন
            </button>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-1 text-[15px] font-bold">স্কুল লোগো</h2>
          <p className="mb-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
            ক্লাব লোগোর পাশে প্রতিষ্ঠানের লোগো দেখাবে (ঐচ্ছিক)।
          </p>
          <UploadField
            value={form.schoolLogo}
            onChange={(url) => set("schoolLogo", url)}
            accept="image/*"
            kind="image"
          />
          {form.schoolLogo && (
            <button
              onClick={() => set("schoolLogo", "")}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-500"
            >
              <RotateCcw className="h-3.5 w-3.5" /> সরিয়ে ফেলুন
            </button>
          )}
        </div>

        <label className="glass-card block p-5">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            ক্লাবের নাম
          </span>
          <input
            className="field"
            value={form.clubName}
            onChange={(e) => set("clubName", e.target.value)}
            placeholder="বিউএসএস সাইেন্স ক্লাব"
          />
        </label>

        <label className="glass-card block p-5">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            প্রতিষ্ঠানের নাম
          </span>
          <input
            className="field"
            value={form.schoolName}
            onChange={(e) => set("schoolName", e.target.value)}
            placeholder="বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ"
          />
        </label>
      </div>

      <div className="glass-card mt-5 flex items-start gap-3 p-4">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: "var(--brand)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          প্রতিটি হিরো স্লাইডে আলাদা <b>প্রতিযোগিতার লোগো</b> যোগ করতে{" "}
          <b>হিরো স্লাইড</b> সেকশনে যান — সেখানে আপলোড করা লোগো ব্যানারের কোণে দেখাবে।
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 mt-6">
        <button onClick={save} disabled={saving} className="btn-brand w-full !py-3.5 disabled:opacity-60">
          {saving ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : saved ? (
            <Check className="h-4.5 w-4.5" />
          ) : null}
          {saved ? "সংরক্ষিত হয়েছে ✓" : "পরিবর্তন সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}
