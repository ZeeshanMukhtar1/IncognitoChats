import { z } from 'zod';

export const ussernameValidation = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username cannot be more than 20 characters')
  .regex(/^[a-zA-Z0-9]*$/, 'Username must not contain special characters');

export const signupSchema = z.object({
  username: ussernameValidation,
  email: z.string().email({ message: 'invalid email adress ' }),
  password: z.string().min(6, { message: 'password must be at least 6 chars' }),
});
