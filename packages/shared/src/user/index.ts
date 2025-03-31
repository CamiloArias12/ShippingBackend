import {z} from 'zod';
import v from 'validator';
import { DriverStatus, UserRole } from '../enums';
import { Driver } from '..';

/**
 * @swagger
 * components:
 *   schemas:
 *    UserCreateReq:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user.
 *           minLength: 1
 *           maxLength: 50
 *         email:
 *           type: string
 *           description: The email of the user.
 *           format: email
 *         password:
 *           type: string
 *           description: The password of the user.
 *           minLength: 8
 *           maxLength: 20
 *           pattern: "^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&#]).+$"
 */
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

/**
 * @swagger
 * components:
 *   schemas:
  *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the user.
 *         name:
 *           type: string
 *           description: The name of the user.
 *         email:
 *           type: string
 *           description: The email of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         role:
 *           type: string
 *           description: The role of the user.
 *           enum:
 *             - Admin
 *             - User
 *             - Driver
 *         driver:
 *           $ref: '#/components/schemas/Driver'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The creation timestamp.
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The last update timestamp.
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: The deletion timestamp.
 */
export type User= {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  driver: Driver;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
