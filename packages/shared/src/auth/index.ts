import { z } from 'zod';

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthLoginReq:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address.
 *           example: user@example.com
 *           required: true
 *           minLength: 1
 *           errorMessage:
 *             email: validation.email.email
 *             nonempty: validation.email.nonempty
 *         password:
 *           type: string
 *           description: The user's password.
 *           example: password123
 *           required: true
 *           minLength: 8
 *           maxLength: 255
 *           errorMessage:
 *             len: password.email.len
 */
export const AuthLoginReq = z.object({
  email: z
    .string()
    .email({ message: "validation.email.email" })
    .nonempty("validation.email.nonempty"),
  password: z.string().min(8, { message: "password.email.len" }).max(255),
});
export type AuthLoginDto = z.infer<typeof AuthLoginReq>;

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResDto:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The authentication token.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export const AuthResDto = z.object({
  token: z.string(),
});
export type AuthResDto = z.infer<typeof AuthResDto>;

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthCheckReq:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The token to validate.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export const AuthCheckReq = z.object({
  token: z.string(),
});
export type AuthCheckReq = z.infer<typeof AuthCheckReq>;
