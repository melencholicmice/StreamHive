import { z } from 'zod';
import { TimeStampType } from 'src/core/timestampMixin';

export const createUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

export type createUserDto = z.infer<typeof createUserSchema>;

export type createUserResponseDto = Omit<createUserDto, 'password'> &
  TimeStampType & { id: string };
