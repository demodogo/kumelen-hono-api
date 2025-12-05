import { env } from '../../config/env.js';
import type { User } from '@prisma/client';
import type { LoginUserInput } from './types.js';
import { AuthError } from './errors.js';
import { comparePassword, hashPassword } from '../../lib/auth.js';
import { SignJWT } from 'jose';
import { usersRepository } from '../users/repository.js';
import { sanitizeUser } from '../users/helpers.js';
import { authRepository } from './repository.js';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

function buildTokenPayload(user: User) {
  return {
    sub: user.id,
    username: user.username,
    role: user.role,
  };
}

export async function loginUser(data: LoginUserInput) {
  const user = await usersRepository.findByUsername(data.username);
  if (!user) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
  }
  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
  }

  const token = await new SignJWT(buildTokenPayload(user))
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return { token, user: sanitizeUser(user) };
}

export async function changePassword(id: string, password: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new AuthError('NOT_FOUND', 'User not found', 404);
  }
  const hashedPassword = await hashPassword(password);
  await authRepository.changePassword(id, hashedPassword);
  return { success: true };
}
