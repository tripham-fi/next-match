import z from "zod";

export const profileEditSchema = z.object({
  name: z.string().min(1, { error: "name is required" }),
  description: z.string().min(1, { error: "description is required" }),
  city: z.string().min(1, { error: "city is required" }),
  country: z.string().min(1, { error: "country is required" }),
});

export type ProfileEditSchema = z.infer<typeof profileEditSchema>;
