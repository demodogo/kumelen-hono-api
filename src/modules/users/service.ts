import type { CreateUserInput, UpdateUserInput } from './types.js';
import { sanitizeUser } from './helpers.js';
import { usersRepository } from './repository.js';
import { hashPassword } from '../../lib/auth.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../shared/errors/app-errors.js';
import { appLogsRepository } from '../logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';

export async function createUser(authedId: string, data: CreateUserInput) {
  const existing = await usersRepository.findByUsername(data.username);
  if (existing) {
    throw new ConflictError('User');
  }
  const hashedPassword = await hashPassword(data.password);
  const user = await usersRepository.createUser({ ...data, password: hashedPassword });

  if (!user) {
    throw new InternalServerError('Could not create user');
  }

  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.USER,
    entityId: user.id,
  });

  return sanitizeUser(user);
}

export async function getById(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  return sanitizeUser(user);
}

export async function getAll() {
  const users = await usersRepository.findAll();
  return users.map(sanitizeUser);
}

export async function updateUser(authedId: string, id: string, data: UpdateUserInput) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  const updated = await usersRepository.update(id, data);
  if (!updated) {
    throw new InternalServerError('Could not update user');
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.UPDATE,
    entity: EntityType.USER,
    entityId: id,
  });
  return sanitizeUser(updated);
}

export async function deleteUser(authedId: string, id: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  const deleted = await usersRepository.delete(id);
  if (!deleted) {
    throw new InternalServerError('Could not delete user');
  }
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.DELETE,
    entity: EntityType.USER,
    entityId: id,
  });
  return { success: true };
}
