import {z} from 'zod';
import v from 'validator';

export const UserReq = z.object({
  name: z.string().min(1, {message: 'name-required'}),
  email: z.string().email( {message: 'email-required'}).refine((value) => v.isEmail(value), {
    message: 'email-invalid',
  }),

  password: z.string().min(8, {message: 'password-required'}),

});




