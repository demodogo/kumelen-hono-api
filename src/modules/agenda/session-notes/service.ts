import type { CreateSessionNoteInput, UpdateSessionNoteInput } from './types.js';
import { sessionNotesRepository } from './repository.js';
import { InternalServerError, NotFoundError } from '../../../shared/errors/app-errors.js';
import { sanitizeSessionNote } from './helpers.js';
import { prisma } from '../../../db/prisma.js';

export async function getSessionNoteById(id: string) {
  const note = await sessionNotesRepository.findById(id);
  if (!note) {
    throw new NotFoundError('Nota de sesión no encontrada');
  }
  return sanitizeSessionNote(note);
}

export async function getSessionNotesByAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new NotFoundError('Cita no encontrada');
  }

  return sessionNotesRepository.findByAppointmentId(appointmentId);
}

export async function getSessionNotesByCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new NotFoundError('Cliente no encontrado');
  }

  return sessionNotesRepository.findByCustomerId(customerId);
}

export async function createSessionNote(data: CreateSessionNoteInput) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
  });

  if (!appointment) {
    throw new NotFoundError('Cita no encontrada');
  }

  const note = await sessionNotesRepository.create(data);

  if (!note) {
    throw new InternalServerError('Error al crear la nota de sesión');
  }

  return sanitizeSessionNote(note);
}

export async function updateSessionNote(id: string, data: UpdateSessionNoteInput) {
  const existing = await sessionNotesRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Nota de sesión no encontrada');
  }

  const note = await sessionNotesRepository.update(id, data);
  if (!note) {
    throw new InternalServerError('Error al actualizar la nota de sesión');
  }

  return sanitizeSessionNote(note);
}

export async function deleteSessionNote(id: string): Promise<void> {
  const note = await sessionNotesRepository.findById(id);
  if (!note) {
    throw new NotFoundError('Nota de sesión no encontrada');
  }

  await sessionNotesRepository.delete(id);
}
