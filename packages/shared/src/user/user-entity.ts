import {z} from 'zod';
import v from 'validator';

export const UserEntity = z.object({
  id: z.number().optional(),
  firstName: z.string().min(1, {message: 'El nombre es obligatorio.'}),
  lastName: z.string().min(1, {message: 'El apellido es obligatorio.'}),
  email: z.string().email(),
  phoneNumber: z
    .string()
    .refine(v.isMobilePhone, {message: 'Debes proporcionar un número de teléfono válido.'}),
});

export type UserEntity = z.infer<typeof UserEntity>;
