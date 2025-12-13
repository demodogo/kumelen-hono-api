import type { CreateMediaInput, PresignMediaInput } from './types.js';
import { mediaRepository } from './repository.js';
import { appLogsRepository } from '../app-logs/repository.js';
import { EntityType, LogAction } from '@prisma/client';
import { createPresignedUrl, getPublicUrl } from '../../core/storage/r2-client.js';

export async function presignUpload(input: PresignMediaInput) {
  const ext = input.fileName.split('.').pop() ?? '';
  const folder = input.folder;
  const randomName = crypto.randomUUID();

  const key = ext ? `${folder}/${randomName}.${ext}` : `${folder}/${randomName}`;
  const uploadUrl = await createPresignedUrl(key, input.contentType);
  const publicUrl = getPublicUrl(key);
  return {
    key,
    uploadUrl,
    publicUrl,
  };
}

export async function createMedia(authedId: string, data: CreateMediaInput) {
  const media = await mediaRepository.createMedia(data);
  await appLogsRepository.createLog({
    userId: authedId,
    action: LogAction.CREATE,
    entity: EntityType.MEDIA,
    entityId: media.id,
  });
  return media;
}
