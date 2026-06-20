import { z } from "zod";

export const DISTRICTS = [
  "COLOMBO","GAMPAHA","KALUTARA","KANDY","MATALE","NUWARA_ELIYA","GALLE","MATARA","HAMBANTOTA",
  "JAFFNA","KILINOCHCHI","MANNAR","MULLAITIVU","VAVUNIYA","TRINCOMALEE","BATTICALOA","AMPARA",
  "KURUNEGALA","PUTTALAM","ANURADHAPURA","POLONNARUWA","BADULLA","MONARAGALA","RATNAPURA","KEGALLE",
] as const;

export const PROVINCES = [
  "WESTERN","CENTRAL","SOUTHERN","NORTHERN","EASTERN",
  "NORTH_WESTERN","NORTH_CENTRAL","UVA","SABARAGAMUWA",
] as const;

export const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"] as const;
export const GENDERS = ["MALE","FEMALE","OTHER"] as const;
export const LANGUAGES = [
  { value: "E", label: "English" },
  { value: "S", label: "Sinhala (සිංහල)" },
  { value: "T", label: "Tamil (தமிழ்)" },
] as const;

export const OCCUPATIONS = [
  // Education & Training
  "TEACHER","LECTURER","PRINCIPAL","TUITION_TEACHER","SCHOOL_COUNSELOR","TUITION_INSTITUTE_OWNER","LIBRARIAN",
  // Healthcare & Medical
  "NURSE","DOCTOR","PHARMACIST","LABORATORY_TECHNICIAN","MIDWIFE","DENTIST","VETERINARY_DOCTOR","PHARMACIST_ASSISTANT","MEDICAL_REPRESENTATIVE",
  // Engineering & Technical
  "ENGINEER","CIVIL_ENGINEER","ARCHITECT","QUANTITY_SURVEYOR","SURVEYOR","DRAFTSMAN","TECHNICIAN","AIR_CONDITIONING_TECHNICIAN","AUTO_ELECTRICIAN","MOBILE_TECHNICIAN","COMPUTER_TECHNICIAN","CCTV_INSTALLER",
  // IT & Technology
  "IT_OFFICER","SOFTWARE_DEVELOPER","WEB_DEVELOPER","GRAPHIC_DESIGNER","CONTENT_CREATOR","YOUTUBER","DATA_ENTRY_OPERATOR","SOCIAL_MEDIA_MARKETER",
  // Business & Finance
  "ACCOUNTANT","BANK_OFFICER","INSURANCE_AGENT","MARKETING_EXECUTIVE","ENTREPRENEUR","BUSINESS_OWNER","SHOP_OWNER","BOUTIQUE_OWNER","GROCERY_SHOP_OWNER","TAILORING_SHOP_OWNER","BEAUTY_SALON_OWNER","BARBER_SHOP_OWNER","CONSULTANT","MANAGER","SUPERVISOR","HR_OFFICER","HR_EXECUTIVE","PROCUREMENT_OFFICER",
  // Administrative & Clerical
  "CLERK","CASHIER","RECEPTIONIST","CASH_COLLECTOR","STORE_KEEPER","STORE_MANAGER","WAREHOUSE_ASSISTANT",
  // Sales & Customer Service
  "SALES_EXECUTIVE","SALESMAN","SHOP_ASSISTANT","CALL_CENTER_AGENT","CALL_CENTER_SUPERVISOR",
  // Transportation & Logistics
  "DRIVER","BUS_DRIVER","TUK_TUK_DRIVER","TAXI_DRIVER","HEAVY_VEHICLE_DRIVER","DELIVERY_RIDER","DELIVERY_PARTNER","DELIVERY_HELPER","DELIVERY_DISPATCHER","BUS_CONDUCTOR","DRIVER_ASSISTANT","CRANE_OPERATOR","FORKLIFT_OPERATOR","BUS_OWNER","VEHICLE_INSPECTOR","BOATMAN","FERRY_OPERATOR",
  // Agriculture & Farming
  "FARMER","TEA_ESTATE_WORKER","RUBBER_TAPPER","COCONUT_FARMER","PADDY_FARMER","SPICE_CULTIVATOR","VEGETABLE_CULTIVATOR","POULTRY_FARMER","LIVESTOCK_FARMER","DAIRY_FARMER",
  // Fishing & Marine
  "FISHERMAN","FISHER","NET_REPAIRER","FISH_SELLER",
  // Security & Defense
  "POLICE_OFFICER","SOLDIER","NAVY","AIR_FORCE","SECURITY_GUARD","SECURITY_SUPERVISOR","WATCHMAN",
  // Construction & Skilled Trades
  "MECHANIC","BUS_MECHANIC","LIGHT_VEHICLE_MECHANIC","ELECTRICIAN","PLUMBER","CARPENTER","MASON","WELDER","PAINTER_BUILDING","PAINTER_VEHICLE","CONSTRUCTION_WORKER",
  // Fashion & Beauty
  "TAILOR","DRESSMAKER","FASHION_DESIGNER","TAILORING_ASSISTANT","HAIRDRESSER","BEAUTICIAN","BARBER",
  // Food & Hospitality
  "CHEF","COOK","BAKER","PASTRY_CHEF","WAITER","WAITRESS","HOTEL_STAFF","TOUR_GUIDE",
  // Arts & Entertainment
  "ARTIST","MUSICIAN","DANCER","PHOTOGRAPHER","VIDEOGRAPHER","PHOTOGRAPHER_ASSISTANT","CAMERAMAN","ACTOR","ACTRESS","SINGER","MUSIC_TEACHER","PAINTER_ARTIST",
  // Fitness & Sports
  "GYM_INSTRUCTOR","SPORTS_COACH","FITNESS_TRAINER",
  // Domestic & Personal Services
  "HOUSEWIFE","HOUSEMAID","DOMESTIC_WORKER","GARDENER","CLEANER","JANITOR",
  // Manual Labor & General Work
  "FACTORY_WORKER","LABOURER","FRUIT_SELLER","STREET_VENDOR","SMALL_BUSINESS_VENDOR",
  // Government & Public Service
  "CIVIL_SERVANT","GOVERNMENT_OFFICER","GRAMA_NILADHARI","POSTMAN",
  // Legal & Professional Services
  "LAWYER","LEGAL_OFFICER",
  // Research & Academia
  "RESEARCHER","SCIENTIST",
  // Social & Community Services
  "SOCIAL_WORKER","NGO_WORKER","NGO_FIELD_OFFICER","VOLUNTEER_WORKER",
  // Religious & Spiritual
  "PRIEST","MONK","IMAM","RELIGIOUS_LEADER",
  // Media & Communication
  "JOURNALIST","REPORTER",
  // Property & Real Estate
  "LANDLORD","LANDLADY",
  // Student & Employment Status
  "STUDENT_SCHOOL","STUDENT_UNIVERSITY","RETIRED_PERSON","UNEMPLOYED",
] as const;

export const GRADES = [
  "GRADE_1","GRADE_2","GRADE_3","GRADE_4","GRADE_5","GRADE_6","GRADE_7",
  "GRADE_8","GRADE_9","GRADE_10","GRADE_11","GRADE_12","GRADE_13",
] as const;

const phoneRegex = /^(?:\+94|0)?7\d{8}$/;
const nicRegex = /^(?:\d{9}[VvXx]|\d{12})$/;
const postalRegex = /^\d{5}$/;
const asciiRegex = /^[\x20-\x7E]*$/; // printable ASCII only — blocks Sinhala/Tamil typing
const classroomRegex = /^[A-Za-z0-9 \-]{0,20}$/;

export const normalizePhone = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return "+94" + digits.slice(1);
  if (digits.length === 9 && digits.startsWith("7")) return "+94" + digits;
  if (digits.length === 11 && digits.startsWith("94")) return "+" + digits;
  return raw.startsWith("+") ? raw : "+" + digits;
};

// helper: ASCII-only string
const asciiString = (max: number, msg = "English letters & numbers only") =>
  z.string().trim().max(max).regex(asciiRegex, msg);

// ---------- Common user fields ----------
const userBase = z.object({
  firstName: asciiString(50).min(1, "Required"),
  lastName: asciiString(50).min(1, "Required"),
  nameWithInitials: asciiString(50).optional().or(z.literal("")),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: "Select gender" }) }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD").optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  phoneNumber: z.string().trim().regex(phoneRegex, "e.g. 0771234567").optional().or(z.literal("")),
  nic: z.string().trim().regex(nicRegex, "9 digits + V/X or 12 digits").optional().or(z.literal("")),
  addressLine1: asciiString(200).optional().or(z.literal("")),
  addressLine2: asciiString(200).optional().or(z.literal("")),
  city: asciiString(50).optional().or(z.literal("")),
  district: z.enum(DISTRICTS, { errorMap: () => ({ message: "Select district" }) }),
  province: z.enum(PROVINCES, { errorMap: () => ({ message: "Select province" }) }),
  postalCode: z.string().trim().regex(postalRegex, "5 digits").optional().or(z.literal("")),
  language: z.enum(["E","S","T"]).default("E"),
});

// ---------- Step 1: Student ----------
export const studentStepSchema = userBase.extend({
  studentId: asciiString(15).optional().or(z.literal("")),
  schoolRegistrationNumber: asciiString(20).optional().or(z.literal("")),
  birthCertificateNo: asciiString(50).optional().or(z.literal("")),
  grade: z.enum(GRADES, { errorMap: () => ({ message: "Select grade" }) }),
  classroom: z.string().trim().regex(classroomRegex, "e.g. A, B, 6-C (English & numbers)").min(1, "Required"),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  emergencyContact: z.string().trim().regex(phoneRegex, "e.g. 0771234567").optional().or(z.literal("")),
  medicalConditions: asciiString(500).optional().or(z.literal("")),
  allergies: asciiString(500).optional().or(z.literal("")),
});

// ---------- Step 2/3: Parent ----------
export const parentSchema = userBase.extend({
  occupation: z.enum(OCCUPATIONS, { errorMap: () => ({ message: "Select occupation" }) }),
  workplace: asciiString(100).optional().or(z.literal("")),
  workPhone: z.string().trim().regex(phoneRegex, "e.g. 0771234567").optional().or(z.literal("")),
  educationLevel: asciiString(100).optional().or(z.literal("")),
});

export const parentSkipSchema = z.object({
  skipReason: asciiString(200, "English letters & numbers only").min(3, "Provide a reason"),
});

export const parentStepSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("provide") }).merge(parentSchema),
  z.object({ mode: z.literal("skip") }).merge(parentSkipSchema),
]);

export const guardianStepSchema = parentSchema;

export type StudentStep = z.infer<typeof studentStepSchema>;
export type ParentStep = z.infer<typeof parentStepSchema>;
export type GuardianStep = z.infer<typeof guardianStepSchema>;

export interface BuildPayloadInput {
  student: StudentStep;
  father: ParentStep;
  mother: ParentStep;
  guardian?: GuardianStep;
  instituteCode?: string;
}

const stripEmpty = <T extends Record<string, any>>(o: T): Partial<T> => {
  const out: any = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === "" || v === undefined || v === null) continue;
    out[k] = v;
  }
  return out;
};

const userPayload = (u: any) => stripEmpty({
  firstName: u.firstName,
  lastName: u.lastName,
  nameWithInitials: u.nameWithInitials || `${u.firstName?.[0] ?? ""}.${u.lastName ?? ""}`,
  gender: u.gender,
  dateOfBirth: u.dateOfBirth,
  email: u.email,
  phoneNumber: normalizePhone(u.phoneNumber),
  nic: u.nic,
  addressLine1: u.addressLine1,
  addressLine2: u.addressLine2,
  city: u.city,
  district: u.district,
  province: u.province,
  country: "Sri Lanka",
  postalCode: u.postalCode,
  language: u.language || "E",
});

export function buildPayloads(input: BuildPayloadInput) {
  const { student, father, mother, guardian, instituteCode } = input;

  const parentBody = (p: ParentStep) => {
    if (p.mode === "skip") return null;
    return {
      ...userPayload(p),
      userType: "USER_WITHOUT_STUDENT" as const,
      parentData: stripEmpty({
        occupation: p.occupation,
        workplace: p.workplace,
        workPhone: normalizePhone(p.workPhone),
        educationLevel: p.educationLevel,
      }),
      ...(instituteCode ? { institute: { instituteCode } } : {}),
    };
  };

  const fatherBody = parentBody(father);
  const motherBody = parentBody(mother);
  const guardianBody = guardian ? {
    ...userPayload(guardian),
    userType: "USER_WITHOUT_STUDENT" as const,
    parentData: stripEmpty({
      occupation: guardian.occupation,
      workplace: guardian.workplace,
      workPhone: normalizePhone(guardian.workPhone),
      educationLevel: guardian.educationLevel,
    }),
    ...(instituteCode ? { institute: { instituteCode } } : {}),
  } : null;

  const studentBody = {
    ...userPayload(student),
    userType: "USER_WITHOUT_PARENT" as const,
    studentData: stripEmpty({
      studentId: student.studentId,
      schoolRegistrationNumber: student.schoolRegistrationNumber,
      birthCertificateNo: student.birthCertificateNo,
      grade: student.grade,
      classroom: student.classroom,
      bloodGroup: student.bloodGroup,
      emergencyContact: normalizePhone(student.emergencyContact),
      medicalConditions: student.medicalConditions,
      allergies: student.allergies,
      fatherPhoneNumber: father.mode === "provide" ? normalizePhone(father.phoneNumber) : undefined,
      motherPhoneNumber: mother.mode === "provide" ? normalizePhone(mother.phoneNumber) : undefined,
      guardianPhoneNumber: guardian ? normalizePhone(guardian.phoneNumber) : undefined,
      fatherSkipReason: father.mode === "skip" ? father.skipReason : undefined,
      motherSkipReason: mother.mode === "skip" ? mother.skipReason : undefined,
    }),
    ...(instituteCode ? { institute: { instituteCode } } : {}),
  };

  return { studentBody, fatherBody, motherBody, guardianBody };
}

const userHeaders = (prefix: string) => [
  `${prefix} First Name`,
  `${prefix} Last Name`,
  `${prefix} Name with Initials`,
  `${prefix} Gender`,
  `${prefix} Date of Birth`,
  `${prefix} Email`,
  `${prefix} Phone Number`,
  `${prefix} NIC`,
  `${prefix} Address Line 1`,
  `${prefix} Address Line 2`,
  `${prefix} City`,
  `${prefix} District`,
  `${prefix} Province`,
  `${prefix} Postal Code`,
  `${prefix} Language`,
];

const parentHeaders = (prefix: string) => [
  ...userHeaders(prefix),
  `${prefix} Occupation`,
  `${prefix} Workplace`,
  `${prefix} Work Phone`,
  `${prefix} Education Level`,
];

export const SHEET_HEADERS = [
  "Reference",
  "Submitted At",
  ...userHeaders("Student"),
  "Student School/Index No.",
  "Student School Registration No.",
  "Student Birth Certificate No.",
  "Student Grade",
  "Student Classroom",
  "Student Blood Group",
  "Student Emergency Contact",
  "Student Medical Conditions",
  "Student Allergies",
  ...parentHeaders("Mother"),
  ...parentHeaders("Father"),
  ...parentHeaders("Guardian"),
  "Mother Skip Reason",
  "Father Skip Reason",
];

export function flattenPayloadToRow(input: BuildPayloadInput): string[] {
  const { student, father, mother, guardian } = input;

  const f = father.mode === "provide" ? father : null;
  const m = mother.mode === "provide" ? mother : null;
  const g = guardian ?? null;

  const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));

  const userCols = (u: any) => [
    s(u.firstName),
    s(u.lastName),
    s(u.nameWithInitials || `${u.firstName?.[0] ?? ""}.${u.lastName ?? ""}`),
    s(u.gender),
    s(u.dateOfBirth),
    s(u.email),
    s(u.phoneNumber),
    s(u.nic),
    s(u.addressLine1),
    s(u.addressLine2),
    s(u.city),
    s(u.district),
    s(u.province),
    s(u.postalCode),
    s(u.language || "E"),
  ];

  const parentCols = (p: any) => [
    ...userCols(p),
    s(p.occupation),
    s(p.workplace),
    s(p.workPhone),
    s(p.educationLevel),
  ];

  return [
    ...userCols(student),
    s(student.studentId),
    s(student.schoolRegistrationNumber),
    s(student.birthCertificateNo),
    s(student.grade),
    s(student.classroom),
    s(student.bloodGroup),
    s(student.emergencyContact),
    s(student.medicalConditions),
    s(student.allergies),
    ...(m ? parentCols(m) : Array(19).fill("")),
    ...(f ? parentCols(f) : Array(19).fill("")),
    ...(g ? parentCols(g) : Array(19).fill("")),
    s(mother.mode === "skip" ? mother.skipReason : ""),
    s(father.mode === "skip" ? father.skipReason : ""),
  ];
}

// Returns one row per person (student, father, mother, guardian) so each is
// appended as a separate row in the Google Sheet.
export function flattenPayloadToRows(input: BuildPayloadInput, ref: string): string[][] {
  const { student, father, mother, guardian } = input;
  const s = (v: unknown) => (v === undefined || v === null ? "" : String(v));
  const ts = new Date().toISOString();

  const userCols = (u: any) => [
    s(u.firstName),
    s(u.lastName),
    s(u.nameWithInitials || `${u.firstName?.[0] ?? ""}.${u.lastName ?? ""}`),
    s(u.gender),
    s(u.dateOfBirth),
    s(u.email),
    s(u.phoneNumber),
    s(u.nic),
    s(u.addressLine1),
    s(u.addressLine2),
    s(u.city),
    s(u.district),
    s(u.province),
    s(u.postalCode),
    s(u.language || "E"),
  ];

  const rows: string[][] = [];

  rows.push([
    ref, ts, "STUDENT",
    ...userCols(student),
    s(student.studentId),
    s(student.schoolRegistrationNumber),
    s(student.birthCertificateNo),
    s(student.grade),
    s(student.classroom),
    s(student.bloodGroup),
    s(student.emergencyContact),
    s(student.medicalConditions),
    s(student.allergies),
    "", "", "", "", // occupation/workplace/workPhone/educationLevel (parent-only)
    "", // skipReason
  ]);

  const parentRow = (role: string, p: any) => [
    ref, ts, role,
    ...userCols(p),
    "", "", "", "", "", "", "", "", // student-only cols
    s(p.occupation),
    s(p.workplace),
    s(p.workPhone),
    s(p.educationLevel),
    "",
  ];

  const skipRow = (role: string, reason: string) => [
    ref, ts, role,
    ...Array(15).fill(""),
    "", "", "", "", "", "", "", "",
    "", "", "", "",
    s(reason),
  ];

  if (father.mode === "provide") rows.push(parentRow("FATHER", father));
  else rows.push(skipRow("FATHER", father.skipReason));

  if (mother.mode === "provide") rows.push(parentRow("MOTHER", mother));
  else rows.push(skipRow("MOTHER", mother.skipReason));

  if (guardian) rows.push(parentRow("GUARDIAN", guardian));

  return rows;
}

// ---------- Per-step row builders (match flattenPayloadToRows column layout) ----------
const _s = (v: unknown) => (v === undefined || v === null ? "" : String(v));
const _userCols = (u: any) => [
  _s(u.firstName), _s(u.lastName),
  _s(u.nameWithInitials || `${u.firstName?.[0] ?? ""}.${u.lastName ?? ""}`),
  _s(u.gender), _s(u.dateOfBirth), _s(u.email), _s(u.phoneNumber), _s(u.nic),
  _s(u.addressLine1), _s(u.addressLine2), _s(u.city),
  _s(u.district), _s(u.province), _s(u.postalCode), _s(u.language || "E"),
];

export function buildStudentRow(student: StudentStep, ref: string): string[] {
  return [
    ref, new Date().toISOString(), "STUDENT",
    ..._userCols(student),
    _s(student.studentId), _s(student.schoolRegistrationNumber), _s(student.birthCertificateNo), _s(student.grade),
    _s(student.classroom), _s(student.bloodGroup), _s(student.emergencyContact),
    _s(student.medicalConditions), _s(student.allergies),
    "", "", "", "",
    "",
  ];
}

export function buildParentRow(role: "FATHER" | "MOTHER", parent: ParentStep, ref: string): string[] {
  const ts = new Date().toISOString();
  if (parent.mode === "skip") {
    return [
      ref, ts, role,
      ...Array(15).fill(""),
      "", "", "", "", "", "", "", "",
      "", "", "", "",
      _s(parent.skipReason),
    ];
  }
  return [
    ref, ts, role,
    ..._userCols(parent),
    "", "", "", "", "", "", "", "",
    _s(parent.occupation), _s(parent.workplace), _s(parent.workPhone), _s(parent.educationLevel),
    "",
  ];
}

export function buildGuardianRow(guardian: GuardianStep, ref: string): string[] {
  return [
    ref, new Date().toISOString(), "GUARDIAN",
    ..._userCols(guardian),
    "", "", "", "", "", "", "", "",
    _s(guardian.occupation), _s(guardian.workplace), _s(guardian.workPhone), _s(guardian.educationLevel),
    "",
  ];
}

