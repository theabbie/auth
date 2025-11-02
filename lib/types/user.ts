export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  nickname?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  
  gender?: string;
  pronouns?: string;
  ethnicity?: string;
  race?: string;
  religion?: string;
  languagesSpoken?: string[];
  primaryLanguage?: string;
  
  secondaryEmail?: string;
  phone?: string;
  secondaryPhone?: string;
  workPhone?: string;
  address?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  mailingAddress?: {
    street?: string;
    apartment?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  
  nationality?: string;
  citizenship?: string[];
  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;
  nationalId?: string;
  socialSecurityNumber?: string;
  taxId?: string;
  driversLicense?: string;
  driversLicenseState?: string;
  driversLicenseExpiry?: string;
  
  maritalStatus?: string;
  spouseName?: string;
  anniversaryDate?: string;
  numberOfChildren?: number;
  children?: any[];
  motherName?: string;
  fatherName?: string;
  parentNames?: string[];
  siblings?: any[];
  
  education?: any[];
  highestDegree?: string;
  fieldOfStudy?: string;
  university?: string;
  graduationYear?: number;
  gpa?: number;
  certifications?: any[];
  licenses?: any[];
  
  occupation?: string;
  company?: string;
  industry?: string;
  employmentStatus?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  workExperience?: any[];
  yearsOfExperience?: number;
  salary?: number;
  salaryCurrency?: string;
  skills?: string[];
  resume?: string;
  portfolio?: string;
  
  annualIncome?: number;
  incomeSource?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  creditScore?: number;
  netWorth?: number;
  investmentAccounts?: any[];
  cryptoWallets?: any[];
  
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  disabilities?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  primaryPhysician?: string;
  organDonor?: string;
  
  smokingStatus?: string;
  drinkingStatus?: string;
  dietaryPreferences?: string[];
  hobbies?: string[];
  interests?: string[];
  favoriteBooks?: string[];
  favoriteMovies?: string[];
  favoriteMusic?: string[];
  petOwner?: string;
  pets?: any[];
  vehicleOwner?: string;
  vehicles?: any[];
  travelFrequency?: string;
  
  website?: string;
  blog?: string;
  linkedIn?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
  tiktok?: string;
  discord?: string;
  telegram?: string;
  whatsapp?: string;
  
  criminalRecord?: string;
  militaryService?: string;
  militaryBranch?: string;
  militaryRank?: string;
  veteranStatus?: string;
  securityClearance?: string;
  politicalAffiliation?: string;
  voterRegistration?: string;
  
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
    email?: string;
  };
  secondaryEmergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
    email?: string;
  };
}

export interface Session {
  sessionId: string;
  uid: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
}

export interface PhoneVerification {
  uid: string;
  phone: string;
  verificationId: string;
  createdAt: string;
  expiresAt: string;
}
