import { z } from "zod";

export const nannySchema = z.object({
  // Bio Information
  full_name: z.string().min(1, "Full name is required"),
  images: z.array(z.instanceof(File)).min(1, "At least one image is required"),

  // Personal Details
  nationality: z.string().min(1, "Nationality is required"),
  religion: z.enum(["christian", "islam", "hindu", "pagan", "non_religious"], {
    errorMap: () => ({ message: "Please select a valid religion" }),
  }),
  tribe: z.string().min(1, "Tribe is required"),

  // Contact Information
  location: z.string().min(1, "Location is required"),
  // Phone must be exactly 9 digits (e.g., without country code, assuming country code is handled separately)
  phone: z.string().regex(/^\d{9}$/, "Phone number must be 9 digits"),
  contacts: z
    .array(
      z.object({
        name: z.string().min(1, "Contact name is required"),
        relationship: z.enum(
          ["spouse", "parent", "sibling", "child", "friend", "cousin", "other"],
          {
            errorMap: () => ({ message: "Please select a valid relationship" }),
          }
        ),
      })
    )
    .optional(),

  // Professional Information
  highest_education: z.enum(
    ["high_school", "associate", "bachelor", "master", "doctorate"],
    {
      errorMap: () => ({ message: "Please select your highest education level" }),
    }
  ),
  work_terms: z.enum(["full_time", "dayburg"], {
    errorMap: () => ({ message: "Please select a work term" }),
  }),
  salary_range: z.enum(["6k - 9k", "10k - 15k", "16k - 20k", "Above 20k"], {
    errorMap: () => ({ message: "Please select a salary range" }),
  }),
});

export type NannyFormValues = z.infer<typeof nannySchema>;

// Partial schemas for each step
export const bioSchema = nannySchema.pick({
  full_name: true,
  images: true,
});
export type BioFormValues = z.infer<typeof bioSchema>;

export const personalDetailsSchema = nannySchema.pick({
  nationality: true,
  religion: true,
  tribe: true,
});
export type PersonalDetailsFormValues = z.infer<typeof personalDetailsSchema>;

export const contactInfoSchema = nannySchema.pick({
  location: true,
  phone: true,
  contacts: true,
});
export type ContactInfoFormValues = z.infer<typeof contactInfoSchema>;

export const professionalInfoSchema = nannySchema.pick({
  highest_education: true,
  work_terms: true,
  salary_range: true,
});
export type ProfessionalInfoFormValues = z.infer<typeof professionalInfoSchema>;
