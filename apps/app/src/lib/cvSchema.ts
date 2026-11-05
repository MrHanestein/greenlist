import { z } from "zod";

// Canonical parsed-CV shape. Every downstream feature (scoring, cover
// letters, autofill field-mapping, video pitch) reads from this — parse
// once, reuse everywhere.
export const CvProfileSchema = z.object({
  contact: z.object({
    fullName: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  }),
  visa: z.object({
    status: z.string().optional(), // e.g. "Graduate visa", "Skilled Worker visa", "settled"
    requiresSponsorship: z.boolean().optional(),
  }).optional(),
  workHistory: z.array(z.object({
    company: z.string(),
    title: z.string(),
    startDate: z.string(), // "YYYY-MM"
    endDate: z.string().nullable(), // null = current
    description: z.string().optional(),
    highlights: z.array(z.string()).default([]),
  })),
  education: z.array(z.object({
    institution: z.string(),
    qualification: z.string(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })),
  skills: z.array(z.string()),
});

export type CvProfileData = z.infer<typeof CvProfileSchema>;
