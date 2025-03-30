import { z } from 'zod';

export const AuthLoginReq = z.object({
  email: z
    .string()
    .email({message:"validation.email.email"})
    .nonempty("validation.email.nonempty"),
  password: z.string().min(8, { message: "password.email.len" }).max(255),
});
export type AuthLoginDto = z.infer<typeof AuthLoginReq>;

export const AuthResDto = z.object({
  token: z.string(),
});
export type AuthResDto = z.infer<typeof AuthResDto>;

export const AuthCheckReq = z.object({
  token: z.string(),
});
export type AuthCheckReq = z.infer<typeof AuthCheckReq>;

