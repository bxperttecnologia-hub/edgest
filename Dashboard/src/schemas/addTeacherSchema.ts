import { z } from "zod";

export const addTeacherSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  contact: z
    .string()
    .regex(/^9\d{8}$/, "Número inválido (ex: 9xxxxxxxx)"),
});

export type AddTeacherFormData = z.infer<typeof addTeacherSchema>;
