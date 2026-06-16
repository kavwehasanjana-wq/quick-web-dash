import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm, type UseFormReturn, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studentStepSchema,
  parentStepSchema,
  guardianStepSchema,
  buildStudentRow,
  buildParentRow,
  buildGuardianRow,
  DISTRICTS,
  PROVINCES,
  BLOOD_GROUPS,
  GENDERS,
  LANGUAGES,
  OCCUPATIONS,
  GRADES,
  type StudentStep,
  type ParentStep,
  type GuardianStep,
} from "@/lib/registration-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ChevronLeft, ChevronRight, ChevronsUpDown, Check, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// =========================================================================
// Hidden config — never shown to end user
// =========================================================================
const HIDDEN_INSTITUTE_CODE: string | undefined = undefined;
const SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxbF-2NijZuq9j6-afomO_zzF9jkMKDYXiDKtyqs2beKbFjeNhF6sj44zpe_2gTx0be/exec";

async function postRowToSheet(row: string[], ref: string) {
  try {
    await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ref, submittedAt: new Date().toISOString(), row }),
    });
  } catch (err) {
    console.error("Sheet submit failed", err);
  }
}

// =========================================================================
// Bilingual label
// =========================================================================
function BiLabel({ en, si, required, htmlFor }: { en: string; si: string; required?: boolean; htmlFor: string }) {
  return (
    <Label htmlFor={htmlFor} className="flex flex-col gap-0.5 leading-tight">
      <span className="text-xs uppercase tracking-wider text-foreground/85 font-semibold">
        {en}{required && <span className="ml-1 text-destructive">*</span>}
      </span>
      <span className="text-[11px] text-muted-foreground font-normal normal-case">{si}</span>
    </Label>
  );
}

function ErrText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive font-medium">{msg}</p>;
}

// Strip non-ASCII (blocks Sinhala / Tamil typing)
const stripNonAscii = (s: string) => s.replace(/[^\x20-\x7E]/g, "");

// =========================================================================
// Field primitives
// =========================================================================

interface BaseFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  en: string;
  si: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  className?: string;
}

function TextField<T extends FieldValues>({
  form, name, en, si, required, placeholder, hint, className, type = "text", asciiOnly = true,
}: BaseFieldProps<T> & { type?: string; asciiOnly?: boolean }) {
  const id = String(name);
  const err = (form.formState.errors as any)[name]?.message as string | undefined;
  const reg = form.register(name, asciiOnly ? {
    setValueAs: (v: unknown) => typeof v === "string" ? stripNonAscii(v) : v,
  } : undefined);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <BiLabel en={en} si={si} required={required} htmlFor={id} />
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        lang="en"
        inputMode={type === "email" ? "email" : type === "tel" ? "tel" : undefined}
        {...reg}
        onChange={(e) => {
          if (asciiOnly && type === "text") {
            const cleaned = stripNonAscii(e.target.value);
            if (cleaned !== e.target.value) e.target.value = cleaned;
          }
          reg.onChange(e);
        }}
        className="bg-paper border-foreground/25 focus-visible:ring-primary/40"
      />
      {hint && !err && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <ErrText msg={err} />
    </div>
  );
}

function SelectField<T extends FieldValues>({
  form, name, en, si, required, options, placeholder, className,
}: BaseFieldProps<T> & { options: readonly { value: string; label: string }[] }) {
  const id = String(name);
  const err = (form.formState.errors as any)[name]?.message as string | undefined;
  const value = form.watch(name) as string | undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <BiLabel en={en} si={si} required={required} htmlFor={id} />
      <Select value={value ?? ""} onValueChange={(v: string) => form.setValue(name, v as any, { shouldValidate: true })}>
        <SelectTrigger id={id} className="bg-paper border-foreground/25">
          <SelectValue placeholder={placeholder ?? "Select / තෝරන්න"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrText msg={err} />
    </div>
  );
}

function ComboField<T extends FieldValues>({
  form, name, en, si, required, options, placeholder, className,
}: BaseFieldProps<T> & { options: readonly { value: string; label: string }[] }) {
  const id = String(name);
  const err = (form.formState.errors as any)[name]?.message as string | undefined;
  const value = form.watch(name) as string | undefined;
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <BiLabel en={en} si={si} required={required} htmlFor={id} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            role="combobox"
            aria-expanded={open}
            className="flex h-9 w-full items-center justify-between rounded-md border border-foreground/25 bg-paper px-3 py-2 text-sm text-left ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <span className={cn("truncate", !selected && "text-muted-foreground")}>
              {selected ? selected.label : (placeholder ?? "Select / තෝරන්න")}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[260px]" align="start">
          <Command>
            <CommandInput placeholder="Search / සොයන්න..." />
            <CommandList>
              <CommandEmpty>No matches.</CommandEmpty>
              <CommandGroup>
                {options.map((o) => (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    onSelect={() => {
                      form.setValue(name, o.value as any, { shouldValidate: true });
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 size-4", value === o.value ? "opacity-100" : "opacity-0")} />
                    {o.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <ErrText msg={err} />
    </div>
  );
}

function TextareaField<T extends FieldValues>({ form, name, en, si, placeholder, className }: BaseFieldProps<T>) {
  const id = String(name);
  const err = (form.formState.errors as any)[name]?.message as string | undefined;
  const reg = form.register(name, {
    setValueAs: (v: unknown) => typeof v === "string" ? stripNonAscii(v) : v,
  });
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <BiLabel en={en} si={si} htmlFor={id} />
      <Textarea
        id={id}
        placeholder={placeholder}
        rows={3}
        {...reg}
        onChange={(e) => {
          const cleaned = stripNonAscii(e.target.value);
          if (cleaned !== e.target.value) e.target.value = cleaned;
          reg.onChange(e);
        }}
        className="bg-paper border-foreground/25"
      />
      <ErrText msg={err} />
    </div>
  );
}

// =========================================================================
// Option lists
// =========================================================================

const titleize = (v: string) =>
  v.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const districtSi: Record<string, string> = {
  COLOMBO: "කොළඹ", GAMPAHA: "ගම්පහ", KALUTARA: "කළුතර", KANDY: "මහනුවර", MATALE: "මාතලේ",
  NUWARA_ELIYA: "නුවරඑළිය", GALLE: "ගාල්ල", MATARA: "මාතර", HAMBANTOTA: "හම්බන්තොට",
  JAFFNA: "යාපනය", KILINOCHCHI: "කිලිනොච්චිය", MANNAR: "මන්නාරම", MULLAITIVU: "මුලතිව්",
  VAVUNIYA: "වවුනියාව", TRINCOMALEE: "ත්‍රිකුණාමලය", BATTICALOA: "මඩකලපුව", AMPARA: "අම්පාර",
  KURUNEGALA: "කුරුණෑගල", PUTTALAM: "පුත්තලම", ANURADHAPURA: "අනුරාධපුරය", POLONNARUWA: "පොළොන්නරුව",
  BADULLA: "බදුල්ල", MONARAGALA: "මොණරාගල", RATNAPURA: "රත්නපුර", KEGALLE: "කෑගල්ල",
};
const provinceSi: Record<string, string> = {
  WESTERN: "බස්නාහිර", CENTRAL: "මධ්‍යම", SOUTHERN: "දකුණු", NORTHERN: "උතුරු", EASTERN: "නැගෙනහිර",
  NORTH_WESTERN: "වයඹ", NORTH_CENTRAL: "උතුරු මැද", UVA: "ඌව", SABARAGAMUWA: "සබරගමුව",
};
const genderSi: Record<string, string> = { MALE: "පුරුෂ", FEMALE: "ස්ත්‍රී", OTHER: "වෙනත්" };

const districtOpts = DISTRICTS.map((v) => ({ value: v, label: `${titleize(v)} / ${districtSi[v]}` }));
const provinceOpts = PROVINCES.map((v) => ({ value: v, label: `${titleize(v)} / ${provinceSi[v]}` }));
const genderOpts = GENDERS.map((v) => ({ value: v, label: `${titleize(v)} / ${genderSi[v]}` }));
const bloodOpts = BLOOD_GROUPS.map((v) => ({ value: v, label: v }));
const occupationOpts = OCCUPATIONS.map((v) => ({ value: v, label: titleize(v) }));
const languageOpts = LANGUAGES.map((l) => ({ value: l.value, label: l.label }));
const gradeOpts = GRADES.map((v) => {
  const n = v.replace("GRADE_", "");
  return { value: v, label: `Grade ${n} / ${n} ශ්‍රේණිය` };
});

// =========================================================================
// Section
// =========================================================================

function Section({ title, titleSi, num, children }: { title: string; titleSi: string; num: string; children: React.ReactNode }) {
  return (
    <section className="border border-foreground/15 bg-card/60 rounded-sm">
      <header className="flex items-center gap-3 border-b border-foreground/15 bg-secondary/60 px-5 py-2.5">
        <span className="gov-form-number text-xs text-primary font-bold">{num}</span>
        <div className="flex flex-col leading-tight">
          <h3 className="font-serif text-sm font-semibold tracking-wide uppercase text-foreground/90">{title}</h3>
          <span className="text-[11px] text-muted-foreground">{titleSi}</span>
        </div>
      </header>
      <div className="p-5 grid grid-cols-1 md:grid-cols-6 gap-x-4 gap-y-4">
        {children}
      </div>
    </section>
  );
}

// =========================================================================
// Shared user-info sections (for student & parents)
// =========================================================================

function UserInfoSections<T extends FieldValues>({ form, includeNic = true }: { form: UseFormReturn<T>; includeNic?: boolean }) {
  const f = form as unknown as UseFormReturn<any>;
  return (
    <>
      <Section num="A.1" title="Personal Particulars" titleSi="පුද්ගලික තොරතුරු">
        <TextField form={f} name="firstName" en="First name" si="මුල් නම" required className="md:col-span-3" />
        <TextField form={f} name="lastName" en="Last name" si="වාසගම" required className="md:col-span-3" />
        <TextField form={f} name="nameWithInitials" en="Name with initials" si="මුලකුරු සමග නම" placeholder="e.g. K. Perera" className="md:col-span-3" />
        <SelectField form={f} name="gender" en="Gender" si="ස්ත්‍රී / පුරුෂ භාවය" required options={genderOpts} className="md:col-span-2" />
        <TextField form={f} name="dateOfBirth" en="Date of birth" si="උපන් දිනය" type="date" asciiOnly={false} className="md:col-span-1" />
        {includeNic && (
          <TextField form={f} name="nic" en="N.I.C. number" si="ජාතික හැඳුනුම්පත් අංකය" hint="9 digits + V/X, or 12 digits" className="md:col-span-3" />
        )}
        <SelectField form={f} name="language" en="Preferred language" si="කැමති භාෂාව" options={languageOpts} className="md:col-span-3" />
      </Section>

      <Section num="A.2" title="Contact Details" titleSi="සම්බන්ධතා විස්තර">
        <TextField form={f} name="phoneNumber" en="Mobile number" si="ජංගම දුරකථන අංකය" placeholder="07XXXXXXXX" className="md:col-span-3" />
        <TextField form={f} name="email" en="E-mail" si="විද්‍යුත් තැපෑල" type="email" className="md:col-span-3" />
        <TextField form={f} name="addressLine1" en="Address line 1" si="ලිපිනය - පෙළ 1" className="md:col-span-6" />
        <TextField form={f} name="addressLine2" en="Address line 2" si="ලිපිනය - පෙළ 2" className="md:col-span-6" />
        <TextField form={f} name="city" en="City / Town" si="නගරය / ගම" className="md:col-span-2" />
        <ComboField form={f} name="district" en="District" si="දිස්ත්‍රික්කය" required options={districtOpts} className="md:col-span-2" />
        <ComboField form={f} name="province" en="Province" si="පළාත" required options={provinceOpts} className="md:col-span-2" />
        <TextField form={f} name="postalCode" en="Postal code" si="තැපැල් කේතය" placeholder="00300" className="md:col-span-2" />
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <BiLabel en="Country" si="රට" htmlFor="country" />
          <Input id="country" value="Sri Lanka" readOnly className="bg-muted/60 border-foreground/15 text-foreground/70" />
        </div>
      </Section>
    </>
  );
}

// =========================================================================
// Step 1 — Student
// =========================================================================

function StudentStepForm({ defaultValues, onNext }: {
  defaultValues?: Partial<StudentStep>;
  onNext: (v: StudentStep) => void;
}) {
  const form = useForm<StudentStep>({
    resolver: zodResolver(studentStepSchema) as any,
    defaultValues: { language: "E", ...defaultValues } as any,
    mode: "onBlur",
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
      <UserInfoSections form={form} includeNic={false} />

      <Section num="A.3" title="Student Particulars" titleSi="ශිෂ්‍ය තොරතුරු">
        <SelectField form={form} name={"grade" as any} en="Grade" si="ශ්‍රේණිය" required options={gradeOpts} className="md:col-span-3" />
        <ComboField form={form} name={"classroom" as any} en="Classroom" si="පන්ති කාමරය" required options={classroomOpts} className="md:col-span-3" />
        <TextField form={form} name={"studentId" as any} en="School / Index No." si="පාසල් / දර්ශක අංකය" className="md:col-span-3" />
        <TextField form={form} name={"birthCertificateNo" as any} en="Birth certificate no." si="උප්පැන්න සහතික අංකය" className="md:col-span-3" />
        <SelectField form={form} name={"bloodGroup" as any} en="Blood group" si="රුධිර කාණ්ඩය" options={bloodOpts} className="md:col-span-2" />
        <TextField form={form} name={"emergencyContact" as any} en="Emergency contact" si="හදිසි අවස්ථා දුරකථන" placeholder="07XXXXXXXX" className="md:col-span-4" />
        <TextareaField form={form} name={"medicalConditions" as any} en="Medical conditions" si="වෛද්‍ය තත්ත්වයන්" className="md:col-span-3" />
        <TextareaField form={form} name={"allergies" as any} en="Allergies" si="අසාත්මිකතා" className="md:col-span-3" />
      </Section>

      <StepNav onlyNext />
    </form>
  );
}

// =========================================================================
// Parent step
// =========================================================================

function ParentStepForm({
  role, roleSi, defaultValues, onNext, onBack,
}: {
  role: "Father" | "Mother";
  roleSi: string;
  defaultValues?: Partial<ParentStep>;
  onNext: (v: ParentStep) => void;
  onBack: () => void;
}) {
  const initialMode = (defaultValues as any)?.mode ?? "provide";
  const form = useForm<ParentStep>({
    resolver: zodResolver(parentStepSchema) as any,
    defaultValues: { mode: initialMode, language: "E", ...(defaultValues as any) } as any,
    mode: "onBlur",
  });
  const mode = form.watch("mode" as any) as "provide" | "skip";

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
      <div className="rounded-sm border border-foreground/15 bg-accent/30 px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-foreground/70 mb-2">
          {role}'s information / {roleSi} පිළිබඳ තොරතුරු
        </p>
        <RadioGroup
          value={mode}
          onValueChange={(v: string) => form.setValue("mode" as any, v as any, { shouldValidate: true })}
          className="flex flex-col sm:flex-row gap-3"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="provide" id={`${role}-provide`} />
            <span className="text-sm">Provide details / විස්තර ඇතුළත් කරන්න</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem value="skip" id={`${role}-skip`} />
            <span className="text-sm">Information unavailable / තොරතුරු නොමැත</span>
          </label>
        </RadioGroup>
      </div>

      {mode === "provide" ? (
        <>
          <UserInfoSections form={form} />
          <Section num="B" title={`${role} — Employment`} titleSi={`${roleSi} — රැකියාව`}>
            <ComboField form={form} name={"occupation" as any} en="Occupation" si="රැකියාව" required options={occupationOpts} className="md:col-span-3" />
            <TextField form={form} name={"workplace" as any} en="Workplace" si="සේවා ස්ථානය" className="md:col-span-3" />
            <TextField form={form} name={"workPhone" as any} en="Work phone" si="කාර්යාල දුරකථන" placeholder="07XXXXXXXX" className="md:col-span-3" />
          </Section>
        </>
      ) : (
        <Section num="B" title={`Reason information is unavailable`} titleSi="තොරතුරු නොමැති වීමට හේතුව">
          <TextareaField form={form} name={"skipReason" as any} en="Reason" si="හේතුව" placeholder="e.g. Deceased, abroad, separated" className="md:col-span-6" />
        </Section>
      )}

      <StepNav onBack={onBack} />
    </form>
  );
}

// =========================================================================
// Guardian step
// =========================================================================

function GuardianStepForm({
  defaultValues, onNext, onBack,
}: {
  defaultValues?: Partial<GuardianStep>;
  onNext: (v: GuardianStep) => void;
  onBack: () => void;
}) {
  const form = useForm<GuardianStep>({
    resolver: zodResolver(guardianStepSchema) as any,
    defaultValues: { language: "E", ...defaultValues } as any,
    mode: "onBlur",
  });
  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-5">
      <div className="rounded-sm border border-foreground/15 bg-accent/30 px-5 py-3">
        <p className="text-sm">
          A <strong>Guardian</strong> must be registered as one parent's information is unavailable.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          මව්පියන්ගෙන් එක් අයෙකුගේ තොරතුරු නොමැති නිසා, <strong>භාරකරු</strong> පිළිබඳ විස්තර අවශ්‍ය වේ.
        </p>
      </div>
      <UserInfoSections form={form} />
      <Section num="C" title="Guardian — Employment" titleSi="භාරකරු — රැකියාව">
        <ComboField form={form} name={"occupation" as any} en="Occupation" si="රැකියාව" required options={occupationOpts} className="md:col-span-3" />
        <TextField form={form} name={"workplace" as any} en="Workplace" si="සේවා ස්ථානය" className="md:col-span-3" />
        <TextField form={form} name={"workPhone" as any} en="Work phone" si="කාර්යාල දුරකථන" placeholder="07XXXXXXXX" className="md:col-span-3" />
      </Section>
      <StepNav onBack={onBack} />
    </form>
  );
}

// =========================================================================
// Step nav
// =========================================================================

function StepNav({ onBack, onlyNext }: { onBack?: () => void; onlyNext?: boolean }) {
  return (
    <div className="flex items-center justify-between pt-2">
      {!onlyNext && onBack ? (
        <Button type="button" variant="outline" onClick={onBack} className="gap-1">
          <ChevronLeft className="size-4" /> Back / ආපසු
        </Button>
      ) : <span />}
      <Button type="submit" className="gap-1">
        Submit / යොමු කරන්න <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

// =========================================================================
// Stepper
// =========================================================================

function Stepper({ steps, current }: { steps: { en: string; si: string }[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.en} className="flex items-center">
            <div className="flex items-center gap-2">
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold gov-form-number",
                active && "bg-primary text-primary-foreground border-primary",
                done && "bg-gold/80 text-foreground border-gold",
                !active && !done && "bg-paper text-muted-foreground border-foreground/25",
              )}>
                {done ? <CheckCircle2 className="size-4" /> : String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col leading-tight">
                <span className={cn(
                  "text-xs uppercase tracking-wider font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}>{s.en}</span>
                <span className="text-[10px] text-muted-foreground">{s.si}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <span className="mx-3 h-px w-6 sm:w-12 bg-foreground/20" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// =========================================================================
// Main form
// =========================================================================

type Stage = "student" | "father" | "mother" | "guardian" | "done";

export function StudentRegistrationForm() {
  const [stage, setStage] = useState<Stage>("student");
  const [student, setStudent] = useState<StudentStep | null>(null);
  const [father, setFather] = useState<ParentStep | null>(null);
  const [mother, setMother] = useState<ParentStep | null>(null);
  const [guardian, setGuardian] = useState<GuardianStep | null>(null);
  const [ref, setRef] = useState(() => "SRK-" + Math.random().toString(36).slice(2, 9).toUpperCase());
  const [finalRef, setFinalRef] = useState<string | null>(null);

  // Success popup between steps
  const [successOpen, setSuccessOpen] = useState(false);
  const [successFor, setSuccessFor] = useState<{ en: string; si: string; nextEn: string; nextSi: string } | null>(null);
  const afterSuccess = useRef<(() => void) | null>(null);

  const guardianRequired = (father?.mode === "skip") || (mother?.mode === "skip");
  const baseSteps = [
    { en: "Student", si: "ශිෂ්‍යයා" },
    { en: "Father", si: "පියා" },
    { en: "Mother", si: "මව" },
  ];
  const steps = guardianRequired || stage === "guardian" || guardian
    ? [...baseSteps, { en: "Guardian", si: "භාරකරු" }]
    : baseSteps;

  const currentIndex =
    stage === "student" ? 0 :
    stage === "father" ? 1 :
    stage === "mother" ? 2 :
    stage === "guardian" ? 3 : steps.length;

  const resetAll = () => {
    setStudent(null); setFather(null); setMother(null); setGuardian(null);
    setStage("student");
    setFinalRef(null);
    setRef("SRK-" + Math.random().toString(36).slice(2, 9).toUpperCase());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const showSuccess = (
    saved: { en: string; si: string },
    next: { en: string; si: string },
    advance: () => void,
  ) => {
    setSuccessFor({ en: saved.en, si: saved.si, nextEn: next.en, nextSi: next.si });
    afterSuccess.current = () => { advance(); scrollTop(); };
    setSuccessOpen(true);
  };

  // Auto-close success dialog and advance to next step
  useEffect(() => {
    if (!successOpen) return;
    const t = window.setTimeout(() => {
      setSuccessOpen(false);
      const fn = afterSuccess.current;
      afterSuccess.current = null;
      if (fn) window.setTimeout(fn, 150);
    }, 1600);
    return () => window.clearTimeout(t);
  }, [successOpen]);

  if (stage === "done" && finalRef) {
    return <ApplicationReceived referenceCode={finalRef} onNew={resetAll} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-foreground/15 bg-card px-5 py-4">
        <Stepper steps={steps} current={currentIndex} />
      </div>

      {stage === "student" && (
        <StudentStepForm
          defaultValues={student ?? undefined}
          onNext={(v) => {
            setStudent(v);
            void postRowToSheet(buildStudentRow(v, ref), ref);
            showSuccess(
              { en: "Student", si: "ශිෂ්‍යයා" },
              { en: "Father", si: "පියා" },
              () => setStage("father"),
            );
          }}
        />
      )}
      {stage === "father" && (
        <ParentStepForm
          role="Father" roleSi="පියා"
          defaultValues={father ?? undefined}
          onBack={() => setStage("student")}
          onNext={(v) => {
            setFather(v);
            void postRowToSheet(buildParentRow("FATHER", v, ref), ref);
            showSuccess(
              { en: "Father", si: "පියා" },
              { en: "Mother", si: "මව" },
              () => setStage("mother"),
            );
          }}
        />
      )}
      {stage === "mother" && (
        <ParentStepForm
          role="Mother" roleSi="මව"
          defaultValues={mother ?? undefined}
          onBack={() => setStage("father")}
          onNext={(v) => {
            setMother(v);
            void postRowToSheet(buildParentRow("MOTHER", v, ref), ref);
            const needGuardian = father?.mode === "skip" || v.mode === "skip";
            if (needGuardian) {
              showSuccess(
                { en: "Mother", si: "මව" },
                { en: "Guardian", si: "භාරකරු" },
                () => setStage("guardian"),
              );
            } else {
              setFinalRef(ref);
              setStage("done");
              scrollTop();
            }
          }}
        />
      )}
      {stage === "guardian" && (
        <GuardianStepForm
          defaultValues={guardian ?? undefined}
          onBack={() => setStage("mother")}
          onNext={(v) => {
            setGuardian(v);
            void postRowToSheet(buildGuardianRow(v, ref), ref);
            setFinalRef(ref);
            setStage("done");
            scrollTop();
          }}
        />
      )}

      <SuccessDialog
        open={successOpen}
        saved={successFor}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}

// =========================================================================
// Professional inter-step success dialog
// =========================================================================

function SuccessDialog({
  open, saved, onClose,
}: {
  open: boolean;
  saved: { en: string; si: string; nextEn: string; nextSi: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md text-center border-foreground/15 bg-card shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success ring-4 ring-success/10 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="size-9" strokeWidth={2.25} />
        </div>
        <DialogTitle className="font-serif text-2xl text-foreground mt-2">
          Saved Successfully
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          {saved ? `${saved.en} details have been recorded.` : "Details have been recorded."}
          <br />
          <span className="text-xs">තොරතුරු සාර්ථකව සුරක්ෂිත කර ඇත.</span>
        </DialogDescription>
        {saved && (
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-2">
            Opening {saved.nextEn} form · {saved.nextSi} පත්‍රිකාව විවෘත වෙමින්…
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// Application Received page — shown after final submit
// =========================================================================

function ApplicationReceived({ referenceCode, onNew }: { referenceCode: string; onNew: () => void }) {
  return (
    <div className="rounded-sm border border-foreground/15 bg-card px-6 py-12 text-center print:border-none print:py-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 text-primary">
        <CheckCircle2 className="size-9" strokeWidth={2.25} />
      </div>
      <h2 className="font-serif text-3xl text-primary mt-6">
        Application Received
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        අයදුම්පත ලැබී ඇත
      </p>
      <p className="text-sm text-foreground/80 mt-6">
        Please retain the reference number below for future correspondence.
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        ඉදිරි කටයුතු සඳහා පහත අංකය සුරක්ෂිතව තබා ගන්න.
      </p>
      <p className="gov-form-number text-2xl font-bold tracking-[0.25em] mt-6">
        {referenceCode}
      </p>
      <div className="mt-8 flex items-center justify-center gap-3 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" /> Print / මුද්‍රණය
        </Button>
        <Button type="button" onClick={onNew} className="gap-2">
          New application / නව අයදුම්පතක්
        </Button>
      </div>
    </div>
  );
}


