import * as z from "zod";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import { profileSchema } from "./profile-schema";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const setPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const phoneSchema = z.string().refine(
  (phone) => {
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  },
  { message: "Invalid phone number" }
);

export const userProfileSchema = profileSchema;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
