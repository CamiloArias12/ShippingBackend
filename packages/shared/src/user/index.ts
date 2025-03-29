import {z} from 'zod';
import v from 'validator';

export const UserCreateReq = z.object({
  name: z.string().min(1, { message: "name.required" }).max(50, { message: "name.maxLen" }),
  email: z.string().email({ message: "email.invalid" }).refine((value) => v.isEmail(value), { message: "email.invalid" }),
  password: z.string()
    .min(8, { message: "password.len" })
    .max(20, { message: "password.maxLen" })
    .refine((value) => /[A-Z]/.test(value), { message: "password.uppercase" })
    .refine((value) => /[a-z]/.test(value), { message: "password.lowercase" })
    .refine((value) => /[0-9]/.test(value), { message: "password.number" })
    .refine((value) => /[@$!%*?&#]/.test(value), { message: "password.specialChar" }),
});

export type UserCreateDto = z.infer<typeof UserCreateReq>;
