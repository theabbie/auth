import * as z from "zod";
import { PROFILE_FIELDS } from "../profile-fields";
import { isValidPhoneNumber } from "libphonenumber-js";

const phoneValidator = z.string().refine(
  (phone) => {
    if (!phone) return true;
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  },
  { message: "Invalid phone number" }
);

const urlValidator = z.string().url("Invalid URL").or(z.literal(""));

const addressSchema = z.object({
  street: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
}).optional();

const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: phoneValidator.optional(),
  relationship: z.string().optional(),
  email: z.string().email().optional(),
}).optional();

export function generateProfileSchema() {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  Object.entries(PROFILE_FIELDS).forEach(([key, field]) => {
    let validator: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        validator = z.string().email("Invalid email");
        break;
      case "phone":
        validator = phoneValidator;
        break;
      case "url":
        validator = urlValidator;
        break;
      case "date":
        validator = z.string();
        break;
      case "number":
        validator = z.number();
        break;
      case "select":
        if (field.options && field.options.length > 0) {
          const [first, ...rest] = field.options;
          validator = z.enum([first, ...rest] as [string, ...string[]]);
        } else {
          validator = z.string();
        }
        break;
      case "array":
        validator = z.array(z.any());
        break;
      case "object":
        if (key === "address" || key === "mailingAddress") {
          validator = addressSchema;
        } else if (key === "emergencyContact" || key === "secondaryEmergencyContact") {
          validator = emergencyContactSchema;
        } else {
          validator = z.record(z.string(), z.any());
        }
        break;
      case "textarea":
      case "text":
      default:
        validator = z.string();
        break;
    }

    if (!field.required) {
      validator = validator.optional();
    }

    schemaFields[key] = validator;
  });

  return z.object(schemaFields);
}

export const profileSchema = generateProfileSchema();

export type ProfileData = z.infer<typeof profileSchema>;
