export type FieldType = "text" | "email" | "phone" | "date" | "number" | "select" | "textarea" | "url" | "array" | "object";

export interface ProfileField {
  key: string;
  label: string;
  description: string;
  type: FieldType;
  category: string;
  options?: readonly string[];
  fields?: Record<string, Omit<ProfileField, "category">>;
  required?: boolean;
}

export const PROFILE_CATEGORIES = {
  BASIC: "Basic Information",
  CONTACT: "Contact Information",
  IDENTITY: "Identity & Documents",
  DEMOGRAPHICS: "Demographics",
  FAMILY: "Family & Relationships",
  EDUCATION: "Education",
  EMPLOYMENT: "Employment",
  FINANCIAL: "Financial Information",
  HEALTH: "Health & Medical",
  LIFESTYLE: "Lifestyle & Preferences",
  SOCIAL: "Social & Online Presence",
  LEGAL: "Legal & Compliance",
  EMERGENCY: "Emergency Information",
} as const;

const addressFields = {
  street: { key: "street", label: "Street Address", description: "Street and number", type: "text" as const },
  apartment: { key: "apartment", label: "Apartment/Unit", description: "Apt, suite, unit", type: "text" as const },
  city: { key: "city", label: "City", description: "City name", type: "text" as const },
  state: { key: "state", label: "State/Province", description: "State or province", type: "text" as const },
  postalCode: { key: "postalCode", label: "Postal Code", description: "ZIP or postal code", type: "text" as const },
  country: { key: "country", label: "Country", description: "Country name", type: "text" as const },
};

const emergencyContactFields = {
  name: { key: "name", label: "Name", description: "Contact name", type: "text" as const },
  phone: { key: "phone", label: "Phone", description: "Contact phone", type: "phone" as const },
  relationship: { key: "relationship", label: "Relationship", description: "Relationship to you", type: "text" as const },
  email: { key: "email", label: "Email", description: "Contact email", type: "email" as const },
};

export const PROFILE_FIELDS: Record<string, ProfileField> = {
  name: { key: "name", label: "Full Name", description: "Your complete legal name", type: "text", category: PROFILE_CATEGORIES.BASIC },
  firstName: { key: "firstName", label: "First Name", description: "Your given name", type: "text", category: PROFILE_CATEGORIES.BASIC },
  middleName: { key: "middleName", label: "Middle Name", description: "Your middle name(s)", type: "text", category: PROFILE_CATEGORIES.BASIC },
  lastName: { key: "lastName", label: "Last Name", description: "Your family name or surname", type: "text", category: PROFILE_CATEGORIES.BASIC },
  preferredName: { key: "preferredName", label: "Preferred Name", description: "Name you prefer to be called", type: "text", category: PROFILE_CATEGORIES.BASIC },
  nickname: { key: "nickname", label: "Nickname", description: "Your nickname or alias", type: "text", category: PROFILE_CATEGORIES.BASIC },
  dateOfBirth: { key: "dateOfBirth", label: "Date of Birth", description: "Your birth date", type: "date", category: PROFILE_CATEGORIES.BASIC },
  placeOfBirth: { key: "placeOfBirth", label: "Place of Birth", description: "City and country where you were born", type: "text", category: PROFILE_CATEGORIES.BASIC },
  
  gender: { key: "gender", label: "Gender", description: "Your gender identity", type: "select", category: PROFILE_CATEGORIES.DEMOGRAPHICS, options: ["male", "female", "non_binary", "other", "prefer_not_to_say"] },
  pronouns: { key: "pronouns", label: "Pronouns", description: "Your preferred pronouns", type: "text", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  ethnicity: { key: "ethnicity", label: "Ethnicity", description: "Your ethnic background", type: "text", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  race: { key: "race", label: "Race", description: "Your racial identity", type: "text", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  religion: { key: "religion", label: "Religion", description: "Your religious affiliation", type: "text", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  languagesSpoken: { key: "languagesSpoken", label: "Languages Spoken", description: "Languages you can speak", type: "array", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  primaryLanguage: { key: "primaryLanguage", label: "Primary Language", description: "Your native or primary language", type: "text", category: PROFILE_CATEGORIES.DEMOGRAPHICS },
  
  email: { key: "email", label: "Email Address", description: "Your primary email", type: "email", category: PROFILE_CATEGORIES.CONTACT, required: true },
  secondaryEmail: { key: "secondaryEmail", label: "Secondary Email", description: "Alternative email address", type: "email", category: PROFILE_CATEGORIES.CONTACT },
  phone: { key: "phone", label: "Phone Number", description: "Your primary phone number", type: "phone", category: PROFILE_CATEGORIES.CONTACT },
  secondaryPhone: { key: "secondaryPhone", label: "Secondary Phone", description: "Alternative phone number", type: "phone", category: PROFILE_CATEGORIES.CONTACT },
  workPhone: { key: "workPhone", label: "Work Phone", description: "Your work phone number", type: "phone", category: PROFILE_CATEGORIES.CONTACT },
  address: { key: "address", label: "Address", description: "Your residential address", type: "object", category: PROFILE_CATEGORIES.CONTACT, fields: addressFields },
  mailingAddress: { key: "mailingAddress", label: "Mailing Address", description: "Address for receiving mail", type: "object", category: PROFILE_CATEGORIES.CONTACT, fields: addressFields },
  
  nationality: { key: "nationality", label: "Nationality", description: "Your country of citizenship", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  citizenship: { key: "citizenship", label: "Citizenship", description: "Countries where you hold citizenship", type: "array", category: PROFILE_CATEGORIES.IDENTITY },
  passportNumber: { key: "passportNumber", label: "Passport Number", description: "Your passport number", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  passportExpiry: { key: "passportExpiry", label: "Passport Expiry", description: "Passport expiration date", type: "date", category: PROFILE_CATEGORIES.IDENTITY },
  passportCountry: { key: "passportCountry", label: "Passport Issuing Country", description: "Country that issued your passport", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  nationalId: { key: "nationalId", label: "National ID", description: "National identification number", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  socialSecurityNumber: { key: "socialSecurityNumber", label: "Social Security Number", description: "SSN or equivalent", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  taxId: { key: "taxId", label: "Tax ID", description: "Tax identification number", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  driversLicense: { key: "driversLicense", label: "Driver's License", description: "Driver's license number", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  driversLicenseState: { key: "driversLicenseState", label: "License State", description: "State/region that issued license", type: "text", category: PROFILE_CATEGORIES.IDENTITY },
  driversLicenseExpiry: { key: "driversLicenseExpiry", label: "License Expiry", description: "License expiration date", type: "date", category: PROFILE_CATEGORIES.IDENTITY },
  
  maritalStatus: { key: "maritalStatus", label: "Marital Status", description: "Your relationship status", type: "select", category: PROFILE_CATEGORIES.FAMILY, options: ["single", "married", "divorced", "widowed", "separated", "domestic_partnership", "prefer_not_to_say"] },
  spouseName: { key: "spouseName", label: "Spouse Name", description: "Name of your spouse/partner", type: "text", category: PROFILE_CATEGORIES.FAMILY },
  anniversaryDate: { key: "anniversaryDate", label: "Anniversary Date", description: "Wedding or partnership anniversary", type: "date", category: PROFILE_CATEGORIES.FAMILY },
  numberOfChildren: { key: "numberOfChildren", label: "Number of Children", description: "How many children you have", type: "number", category: PROFILE_CATEGORIES.FAMILY },
  children: { key: "children", label: "Children", description: "Information about your children", type: "array", category: PROFILE_CATEGORIES.FAMILY },
  motherName: { key: "motherName", label: "Mother's Name", description: "Your mother's full name", type: "text", category: PROFILE_CATEGORIES.FAMILY },
  fatherName: { key: "fatherName", label: "Father's Name", description: "Your father's full name", type: "text", category: PROFILE_CATEGORIES.FAMILY },
  parentNames: { key: "parentNames", label: "Parent Names", description: "Names of your parents/guardians", type: "array", category: PROFILE_CATEGORIES.FAMILY },
  siblings: { key: "siblings", label: "Siblings", description: "Information about siblings", type: "array", category: PROFILE_CATEGORIES.FAMILY },
  
  education: { key: "education", label: "Education", description: "Your educational background", type: "array", category: PROFILE_CATEGORIES.EDUCATION },
  highestDegree: { key: "highestDegree", label: "Highest Degree", description: "Highest level of education completed", type: "select", category: PROFILE_CATEGORIES.EDUCATION, options: ["high_school", "associate", "bachelor", "master", "doctorate", "professional", "none"] },
  fieldOfStudy: { key: "fieldOfStudy", label: "Field of Study", description: "Your major or area of study", type: "text", category: PROFILE_CATEGORIES.EDUCATION },
  university: { key: "university", label: "University/College", description: "Name of your university", type: "text", category: PROFILE_CATEGORIES.EDUCATION },
  graduationYear: { key: "graduationYear", label: "Graduation Year", description: "Year you graduated", type: "number", category: PROFILE_CATEGORIES.EDUCATION },
  gpa: { key: "gpa", label: "GPA", description: "Grade point average", type: "number", category: PROFILE_CATEGORIES.EDUCATION },
  certifications: { key: "certifications", label: "Certifications", description: "Professional certifications", type: "array", category: PROFILE_CATEGORIES.EDUCATION },
  licenses: { key: "licenses", label: "Professional Licenses", description: "Professional licenses held", type: "array", category: PROFILE_CATEGORIES.EDUCATION },
  
  occupation: { key: "occupation", label: "Occupation", description: "Your current job title", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  company: { key: "company", label: "Company", description: "Your current employer", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  industry: { key: "industry", label: "Industry", description: "Industry you work in", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  employmentStatus: { key: "employmentStatus", label: "Employment Status", description: "Your current employment status", type: "select", category: PROFILE_CATEGORIES.EMPLOYMENT, options: ["employed", "self_employed", "unemployed", "student", "retired", "other"] },
  jobTitle: { key: "jobTitle", label: "Job Title", description: "Your official job title", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  department: { key: "department", label: "Department", description: "Department you work in", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  employeeId: { key: "employeeId", label: "Employee ID", description: "Your employee identification number", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  startDate: { key: "startDate", label: "Start Date", description: "When you started current job", type: "date", category: PROFILE_CATEGORIES.EMPLOYMENT },
  endDate: { key: "endDate", label: "End Date", description: "When you left the job", type: "date", category: PROFILE_CATEGORIES.EMPLOYMENT },
  workExperience: { key: "workExperience", label: "Work Experience", description: "Your employment history", type: "array", category: PROFILE_CATEGORIES.EMPLOYMENT },
  yearsOfExperience: { key: "yearsOfExperience", label: "Years of Experience", description: "Total years of work experience", type: "number", category: PROFILE_CATEGORIES.EMPLOYMENT },
  salary: { key: "salary", label: "Salary", description: "Your current salary", type: "number", category: PROFILE_CATEGORIES.EMPLOYMENT },
  salaryCurrency: { key: "salaryCurrency", label: "Salary Currency", description: "Currency of your salary", type: "text", category: PROFILE_CATEGORIES.EMPLOYMENT },
  skills: { key: "skills", label: "Skills", description: "Your professional skills", type: "array", category: PROFILE_CATEGORIES.EMPLOYMENT },
  resume: { key: "resume", label: "Resume/CV", description: "Link to your resume", type: "url", category: PROFILE_CATEGORIES.EMPLOYMENT },
  portfolio: { key: "portfolio", label: "Portfolio", description: "Link to your portfolio", type: "url", category: PROFILE_CATEGORIES.EMPLOYMENT },
  
  annualIncome: { key: "annualIncome", label: "Annual Income", description: "Your yearly income", type: "number", category: PROFILE_CATEGORIES.FINANCIAL },
  incomeSource: { key: "incomeSource", label: "Income Source", description: "Primary source of income", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  bankName: { key: "bankName", label: "Bank Name", description: "Your primary bank", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  accountNumber: { key: "accountNumber", label: "Account Number", description: "Bank account number", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  routingNumber: { key: "routingNumber", label: "Routing Number", description: "Bank routing number", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  iban: { key: "iban", label: "IBAN", description: "International bank account number", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  swiftCode: { key: "swiftCode", label: "SWIFT Code", description: "Bank SWIFT/BIC code", type: "text", category: PROFILE_CATEGORIES.FINANCIAL },
  creditScore: { key: "creditScore", label: "Credit Score", description: "Your credit score", type: "number", category: PROFILE_CATEGORIES.FINANCIAL },
  netWorth: { key: "netWorth", label: "Net Worth", description: "Your total net worth", type: "number", category: PROFILE_CATEGORIES.FINANCIAL },
  investmentAccounts: { key: "investmentAccounts", label: "Investment Accounts", description: "Your investment accounts", type: "array", category: PROFILE_CATEGORIES.FINANCIAL },
  cryptoWallets: { key: "cryptoWallets", label: "Crypto Wallets", description: "Cryptocurrency wallet addresses", type: "array", category: PROFILE_CATEGORIES.FINANCIAL },
  
  bloodType: { key: "bloodType", label: "Blood Type", description: "Your blood type", type: "select", category: PROFILE_CATEGORIES.HEALTH, options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] },
  height: { key: "height", label: "Height", description: "Your height", type: "number", category: PROFILE_CATEGORIES.HEALTH },
  weight: { key: "weight", label: "Weight", description: "Your weight", type: "number", category: PROFILE_CATEGORIES.HEALTH },
  allergies: { key: "allergies", label: "Allergies", description: "Known allergies", type: "array", category: PROFILE_CATEGORIES.HEALTH },
  medications: { key: "medications", label: "Medications", description: "Current medications", type: "array", category: PROFILE_CATEGORIES.HEALTH },
  medicalConditions: { key: "medicalConditions", label: "Medical Conditions", description: "Chronic or ongoing conditions", type: "array", category: PROFILE_CATEGORIES.HEALTH },
  disabilities: { key: "disabilities", label: "Disabilities", description: "Any disabilities", type: "array", category: PROFILE_CATEGORIES.HEALTH },
  insuranceProvider: { key: "insuranceProvider", label: "Insurance Provider", description: "Health insurance company", type: "text", category: PROFILE_CATEGORIES.HEALTH },
  insurancePolicyNumber: { key: "insurancePolicyNumber", label: "Policy Number", description: "Insurance policy number", type: "text", category: PROFILE_CATEGORIES.HEALTH },
  primaryPhysician: { key: "primaryPhysician", label: "Primary Physician", description: "Your primary doctor", type: "text", category: PROFILE_CATEGORIES.HEALTH },
  organDonor: { key: "organDonor", label: "Organ Donor", description: "Organ donor status", type: "select", category: PROFILE_CATEGORIES.HEALTH, options: ["yes", "no", "undecided"] },
  
  smokingStatus: { key: "smokingStatus", label: "Smoking Status", description: "Do you smoke", type: "select", category: PROFILE_CATEGORIES.LIFESTYLE, options: ["never", "former", "current", "prefer_not_to_say"] },
  drinkingStatus: { key: "drinkingStatus", label: "Drinking Status", description: "Alcohol consumption", type: "select", category: PROFILE_CATEGORIES.LIFESTYLE, options: ["never", "occasionally", "regularly", "prefer_not_to_say"] },
  dietaryPreferences: { key: "dietaryPreferences", label: "Dietary Preferences", description: "Your diet type", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  hobbies: { key: "hobbies", label: "Hobbies", description: "Your hobbies and interests", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  interests: { key: "interests", label: "Interests", description: "Things you're interested in", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  favoriteBooks: { key: "favoriteBooks", label: "Favorite Books", description: "Books you love", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  favoriteMovies: { key: "favoriteMovies", label: "Favorite Movies", description: "Movies you love", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  favoriteMusic: { key: "favoriteMusic", label: "Favorite Music", description: "Music genres or artists", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  petOwner: { key: "petOwner", label: "Pet Owner", description: "Do you have pets", type: "select", category: PROFILE_CATEGORIES.LIFESTYLE, options: ["yes", "no"] },
  pets: { key: "pets", label: "Pets", description: "Information about your pets", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  vehicleOwner: { key: "vehicleOwner", label: "Vehicle Owner", description: "Do you own a vehicle", type: "select", category: PROFILE_CATEGORIES.LIFESTYLE, options: ["yes", "no"] },
  vehicles: { key: "vehicles", label: "Vehicles", description: "Vehicles you own", type: "array", category: PROFILE_CATEGORIES.LIFESTYLE },
  travelFrequency: { key: "travelFrequency", label: "Travel Frequency", description: "How often you travel", type: "select", category: PROFILE_CATEGORIES.LIFESTYLE, options: ["never", "rarely", "occasionally", "frequently", "very_frequently"] },
  
  website: { key: "website", label: "Website", description: "Your personal website", type: "url", category: PROFILE_CATEGORIES.SOCIAL },
  blog: { key: "blog", label: "Blog", description: "Your blog URL", type: "url", category: PROFILE_CATEGORIES.SOCIAL },
  linkedIn: { key: "linkedIn", label: "LinkedIn", description: "LinkedIn profile URL", type: "url", category: PROFILE_CATEGORIES.SOCIAL },
  twitter: { key: "twitter", label: "Twitter/X", description: "Twitter/X handle", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  facebook: { key: "facebook", label: "Facebook", description: "Facebook profile URL", type: "url", category: PROFILE_CATEGORIES.SOCIAL },
  instagram: { key: "instagram", label: "Instagram", description: "Instagram handle", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  github: { key: "github", label: "GitHub", description: "GitHub username", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  youtube: { key: "youtube", label: "YouTube", description: "YouTube channel URL", type: "url", category: PROFILE_CATEGORIES.SOCIAL },
  tiktok: { key: "tiktok", label: "TikTok", description: "TikTok handle", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  discord: { key: "discord", label: "Discord", description: "Discord username", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  telegram: { key: "telegram", label: "Telegram", description: "Telegram username", type: "text", category: PROFILE_CATEGORIES.SOCIAL },
  whatsapp: { key: "whatsapp", label: "WhatsApp", description: "WhatsApp number", type: "phone", category: PROFILE_CATEGORIES.SOCIAL },
  
  criminalRecord: { key: "criminalRecord", label: "Criminal Record", description: "Any criminal history", type: "select", category: PROFILE_CATEGORIES.LEGAL, options: ["yes", "no", "prefer_not_to_say"] },
  militaryService: { key: "militaryService", label: "Military Service", description: "Military service history", type: "select", category: PROFILE_CATEGORIES.LEGAL, options: ["yes", "no", "prefer_not_to_say"] },
  militaryBranch: { key: "militaryBranch", label: "Military Branch", description: "Branch of military service", type: "text", category: PROFILE_CATEGORIES.LEGAL },
  militaryRank: { key: "militaryRank", label: "Military Rank", description: "Highest rank achieved", type: "text", category: PROFILE_CATEGORIES.LEGAL },
  veteranStatus: { key: "veteranStatus", label: "Veteran Status", description: "Are you a veteran", type: "select", category: PROFILE_CATEGORIES.LEGAL, options: ["yes", "no", "prefer_not_to_say"] },
  securityClearance: { key: "securityClearance", label: "Security Clearance", description: "Government security clearance level", type: "text", category: PROFILE_CATEGORIES.LEGAL },
  politicalAffiliation: { key: "politicalAffiliation", label: "Political Affiliation", description: "Political party affiliation", type: "text", category: PROFILE_CATEGORIES.LEGAL },
  voterRegistration: { key: "voterRegistration", label: "Voter Registration", description: "Voter registration status", type: "select", category: PROFILE_CATEGORIES.LEGAL, options: ["registered", "not_registered", "prefer_not_to_say"] },
  
  emergencyContact: { key: "emergencyContact", label: "Emergency Contact", description: "Primary emergency contact", type: "object", category: PROFILE_CATEGORIES.EMERGENCY, fields: emergencyContactFields },
  secondaryEmergencyContact: { key: "secondaryEmergencyContact", label: "Secondary Emergency Contact", description: "Backup emergency contact", type: "object", category: PROFILE_CATEGORIES.EMERGENCY, fields: emergencyContactFields },
};

export function getFieldsByCategory(category: string): ProfileField[] {
  return Object.values(PROFILE_FIELDS).filter(field => field.category === category);
}

export function getFieldByKey(key: string): ProfileField | undefined {
  return PROFILE_FIELDS[key];
}
