import {z} from 'zod';

export const AuthLoginReq = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type AuthLoginReq = z.infer<typeof AuthLoginReq>;

export const AuthLogoutReq = z.object({
  ownerId: z.number(),
});
export type AuthLogoutReq = z.infer<typeof AuthLogoutReq>;

export const AuthResponseDTO = z.object({
  token: z.string(),
});
export type AuthResponseDTO = z.infer<typeof AuthResponseDTO>;

export const AuthCheckReq = z.object({
  token: z.string(),
});
export type AuthCheckReq = z.infer<typeof AuthCheckReq>;

export const AuthCheckRes = z.object({
  isValid: z.boolean(),
});
export type AuthCheckRes = z.infer<typeof AuthCheckRes>;
