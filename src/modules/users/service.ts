import type { CreateUserInput, UpdateUserInput } from './types.js';
import { sanitizeUser } from './helpers.js';
import { usersRepository } from './repository.js';
import { hashPassword } from '../../lib/auth.js';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../shared/errors/app-errors.js';

export async function createUser(data: CreateUserInput) {
  const existing = await usersRepository.findByUsername(data.username);
  if (existing) {
    throw new ConflictError('User');
  }
  const hashedPassword = await hashPassword(data.password);
  const user = await usersRepository.createUser({ ...data, password: hashedPassword });

  if (!user) {
    throw new InternalServerError('Could not create user');
  }

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

export async function updateUser(id: string, data: UpdateUserInput) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  const updated = await usersRepository.update(id, data);
  if (!updated) {
    throw new InternalServerError('Could not update user');
  }
  return sanitizeUser(updated);
}

export async function deleteUser(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User');
  }
  const deleted = await usersRepository.delete(id);
  if (!deleted) {
    throw new InternalServerError('Could not delete user');
  }
  return { success: true };
}
