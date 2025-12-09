import { appLogsRepository } from './repository.js';
import { AppLogDto } from './dto.js';

export async function getUserLogs(id: string) {
  const logs = await appLogsRepository.findLogByUser(id);
  return logs.map((l) => AppLogDto.fromPrisma(l));
}

export async function getAllLogs() {
  const logs = await appLogsRepository.findAll();
  return logs.map((l) => AppLogDto.fromPrisma(l));
}
