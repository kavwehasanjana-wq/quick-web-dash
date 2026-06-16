import { createFileRoute } from "@tanstack/react-router";
import { StudentRegistrationForm } from "@/components/registration/StudentRegistrationForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Suraksha · 2026/2027 — Data Entry Form" },
      { name: "description", content: "Suraksha system data entry form for the academic year 2026/2027." },
      { property: "og:title", content: "Suraksha · 2026/2027 — Data Entry Form" },
      { property: "og:description", content: "Suraksha system data entry form for the academic year 2026/2027." },
    ],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <Header />
      </div>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12 print:px-0 print:py-0 print:max-w-none">
        <div className="print:hidden">
          <FormPreamble />
        </div>
        <div className="mt-8 print:mt-0">
          <StudentRegistrationForm />
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b border-foreground/10 bg-card/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-5 text-center">
        <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground/90">
          Suraksha · 2026 / 2027
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          සුරක්ෂා පද්ධතිය සඳහා 2026 – 2027 වර්ෂ සඳහා දත්ත ඇතුළත් කිරීමේ පත්‍රිකාව
        </p>
      </div>
    </header>
  );
}

function FormPreamble() {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
            Data Entry Form — Academic Year 2026 / 2027
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            2026 – 2027 වර්ෂ සඳහා දත්ත ඇතුළත් කිරීමේ පත්‍රිකාව
          </p>
        </div>
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground shrink-0 pt-1">
          SCHEDULE I
        </p>
      </div>

      <div className="border-2 border-destructive/50 bg-destructive/5 rounded-sm px-6 py-5 text-center">
        <p className="text-2xl sm:text-3xl font-bold tracking-wide text-destructive">
          CLOSING DATE: 2026 / 06 / 20
        </p>
        <p className="text-lg sm:text-xl font-bold text-destructive/90 mt-2">
          අවසන් දිනය : 2026 / 06 / 20
        </p>
      </div>

      <div className="space-y-3 border border-foreground/15 bg-secondary/40 rounded-sm px-5 py-4">
        <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
          This form is to be completed in respect of every student covered under the Suraksha Scheme. All particulars furnished must be true and correct. Submission of false information will result in legal action.
        </p>
        <p className="text-sm sm:text-base font-bold text-foreground/90 leading-relaxed">
          සුරක්ෂා ක්‍රමය යටතේ ආවරණය වන සෑම ශිෂ්‍යයෙකු සඳහාම මෙම පත්‍රිකාව සම්පූර්ණ කළ යුතුය. ඉදිරිපත් කරන සියලු තොරතුරු සත්‍ය හා නිවැරදි විය යුතුය. අසත්‍ය තොරතුරු ඇතුළත් කිරීම නීතිමය ක්‍රියාමාර්ග වලට හේතු වේ.
        </p>
      </div>

      <ul className="list-disc pl-5 space-y-1.5 text-sm text-foreground/85 leading-relaxed">
        <li>
          Fields marked <strong>*</strong> are mandatory.{" "}
          <span className="text-muted-foreground">· * සලකුණු කළ කොටස් අනිවාර්ය වේ.</span>
        </li>
        <li>
          All entries must be made in <strong>English letters and numbers only.</strong>{" "}
          <span className="text-muted-foreground">· සියලු තොරතුරු ඉංග්‍රීසි අකුරු හා ඉලක්කම් වලින් පමණක් ඇතුළත් කරන්න.</span>
        </li>
        <li>
          If a parent&apos;s information is unavailable, a Guardian must be furnished.{" "}
          <span className="text-muted-foreground">· මව්පියන්ගේ තොරතුරු නොමැති නම්, භාරකරුවෙකු පිළිබඳ විස්තර ඇතුළත් කළ යුතුය.</span>
        </li>
      </ul>
    </div>
  );
}
