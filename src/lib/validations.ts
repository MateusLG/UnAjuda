import { z } from "zod";

// Password validation schema with strong requirements
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(
    /[^A-Za-z0-9]/,
    "A senha deve conter pelo menos um caractere especial"
  );

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido")
  .toLowerCase();

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "O nome de usuário deve ter no mínimo 3 caracteres")
  .max(30, "O nome de usuário deve ter no máximo 30 caracteres")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "O nome de usuário deve conter apenas letras, números, _ e -"
  );

// Full name validation
export const fullNameSchema = z
  .string()
  .min(2, "O nome deve ter no mínimo 2 caracteres")
  .max(100, "O nome deve ter no máximo 100 caracteres")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "O nome deve conter apenas letras e espaços");

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
});

// Signup form schema
export const signupSchema = z
  .object({
    username: usernameSchema,
    full_name: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Password recovery schema
export const passwordRecoverySchema = z.object({
  email: emailSchema,
});

// Question creation schema
export const questionSchema = z.object({
  title: z
    .string()
    .min(10, "O título deve ter no mínimo 10 caracteres")
    .max(200, "O título deve ter no máximo 200 caracteres"),
  content: z
    .string()
    .min(20, "O conteúdo deve ter no mínimo 20 caracteres")
    .max(5000, "O conteúdo deve ter no máximo 5000 caracteres"),
  category_id: z.string().uuid("Categoria inválida"),
});

// Answer creation schema
export const answerSchema = z.object({
  content: z
    .string()
    .min(10, "A resposta deve ter no mínimo 10 caracteres")
    .max(5000, "A resposta deve ter no máximo 5000 caracteres"),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  username: usernameSchema,
  full_name: fullNameSchema,
  bio: z
    .string()
    .max(500, "A biografia deve ter no máximo 500 caracteres")
    .optional()
    .nullable(),
  avatar_url: z.string().url("URL de avatar inválida").optional().nullable(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type PasswordRecoveryFormData = z.infer<typeof passwordRecoverySchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type AnswerFormData = z.infer<typeof answerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
