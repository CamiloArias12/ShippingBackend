import {z} from 'zod';

export const AuthLoginReq = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type AuthLoginDto = z.infer<typeof AuthLoginReq>;

export const AuthResDto = z.object({
  token: z.string(),
});
export type AuthResDTO = z.infer<typeof AuthResDto>;

export const AuthCheckReq = z.object({
  token: z.string(),
});
export type AuthCheckReq = z.infer<typeof AuthCheckReq>;

