import { env } from '../../config/env.js';
import { EntityType, LogAction, type User } from '@prisma/client';
import type { LoginUserInput } from './types.js';
import { comparePassword, hashPassword } from '../../lib/auth.js';
import { SignJWT } from 'jose';
import { usersRepository } from '../users/repository.js';
import { sanitizeUser } from '../users/helpers.js';
import { authRepository } from './repository.js';
import { NotFoundError, UnauthorizedError } from '../../shared/errors/app-errors.js';
import { appLogsRepository } from '../logs/repository.js';

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
    throw new UnauthorizedError();
  }
  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError();
  }

  const token = await new SignJWT(buildTokenPayload(user))
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  await appLogsRepository.createLog({
    userId: user.id,
    action: LogAction.LOGIN,
    entity: EntityType.AUTH,
    entityId: user.id,
  });
  return { token, user: sanitizeUser(user) };
}

export async function changePassword(id: string, password: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  const hashedPassword = await hashPassword(password);
  await authRepository.changePassword(id, hashedPassword);
  appLogsRepository.createLog({
    userId: user.id,
    action: LogAction.UPDATE,
    entity: EntityType.USER,
    entityId: user.id,
    details: `Changed password for user ${user.id}`,
  });
  return { success: true };
}
