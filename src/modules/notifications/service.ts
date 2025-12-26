import type { TransportOptions } from 'nodemailer';
import nodemailer from 'nodemailer';
import type { AppointmentWithRelations } from './types.js';
import { getClientAppointmentConfirmationTemplate } from './templates/client-appointment-created.js';
import { getKumelenAppointmentNotificationTemplate } from './templates/kumelen-appointment-created.js';
import { formatDate, formatTime } from './utils.js';

export function createMailTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_SMTP_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
  } as TransportOptions);
}

type SendEmailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(options: SendEmailOptions) {
  const transporter = createMailTransporter();
  return await transporter.sendMail(options);
}

export async function sendClientAppointmentConfirmation(appointment: AppointmentWithRelations) {
  if (!appointment.customer.email) return;

  const appointmentDate = formatDate(appointment.startAt);
  const appointmentTime = formatTime(appointment.startAt);

  const { html, text } = getClientAppointmentConfirmationTemplate({
    clientName: appointment.customer.name,
    serviceName: appointment.service.name,
    servicePrice: appointment.service.price,
    appointmentDate,
    appointmentTime,
    durationMinutes: appointment.service.durationMinutes,
    notes: appointment.clientNotes || undefined,
    appointmentId: appointment.id,
  });

  await sendEmail({
    from: process.env.GMAIL_SMTP_USER!,
    to: appointment.customer.email,
    subject: '¡Has agendado una cita en Kümelen!',
    text,
    html,
  });
}

export async function sendKumelenAppointmentConfirmation(appointment: AppointmentWithRelations) {
  const appointmentDate = formatDate(appointment.startAt);
  const appointmentTime = formatTime(appointment.startAt);

  const { html, text } = getKumelenAppointmentNotificationTemplate({
    appointmentId: appointment.id,
    appointmentDate,
    appointmentTime,
    clientName: `${appointment.customer.name} ${appointment.customer.lastName}`,
    servicePrice: appointment.service.price,
    serviceName: appointment.service.name,
    durationMinutes: appointment.service.durationMinutes,
    notes: appointment.clientNotes || undefined,
    clientEmail: appointment.customer.email || undefined,
    clientPhone: appointment.customer.phone || undefined,
  });

  await sendEmail({
    from: process.env.GMAIL_SMTP_USER!,
    to: process.env.GMAIL_SMTP_USER!,
    subject: 'Nueva Cita Reservada',
    text,
    html,
  });
}
