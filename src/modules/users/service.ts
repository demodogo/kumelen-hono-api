import type { CreateUserInput, UpdateUserInput } from './schemas.js';
import { sanitizeUser } from './helpers.js';
import { usersRepository } from './repository.js';
import { UserError } from './errors.js';
import { hashPassword } from '../../lib/auth.js';

export async function createUser(data: CreateUserInput) {
  const existing = await usersRepository.findByUsername(data.username);
  if (existing) {
    throw new UserError('USERNAME_TAKEN', 'Username already registered', 409);
  }
  const hashedPassword = await hashPassword(data.password);
  const user = await usersRepository.createUser({ ...data, password: hashedPassword });

  if (!user) {
    throw new UserError('ERROR_CREATING', 'Could not create user', 400);
  }

  return sanitizeUser(user);
}

export async function getById(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new UserError('NOT_FOUND', 'User not found', 404);
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
    throw new UserError('NOT_FOUND', 'User not found', 404);
  }
  const updated = await usersRepository.update(id, data);
  if (!updated) {
    throw new UserError('ERROR_UPDATING', 'Could not update user', 400);
  }
  return sanitizeUser(updated);
}

export async function deleteUser(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) {
    throw new UserError('NOT_FOUND', 'User not found', 404);
  }
  const deleted = await usersRepository.delete(id);
  if (!deleted) {
    throw new UserError('ERROR_DELETING', 'Could not delete user', 400);
  }
  return { success: true };
}
