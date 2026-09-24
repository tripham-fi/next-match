import z from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, { error: "The name is required" }),
    email: z.email(),
    password: z
      .string()
      .min(6, {
        error: "Password must be at least 6 characters",
      })
      .max(16, {
        error: "Password must not be over 16 characters",
      }),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The password does not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
