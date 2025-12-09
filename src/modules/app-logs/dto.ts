import { translateAction, translateEntity, translateRole } from '../../i18n/dict.js';
import { formatDateToDMY } from '../../utils/date.js';

export class AppLogDto {
  constructor(
    public id: string,
    public action: string,
    public entityId: string | null,
    public details: string | null,
    public formattedDate: string,
    public entityLabel: string,
    public userFullName: string,
    public userRoleLabel: string
  ) {}

  static fromPrisma(log: any): AppLogDto {
    const userFullName = [log.user.name, log.user.lastName].filter(Boolean).join(' ');
    const userRoleLabel = translateRole(log.user.role);
    const entityLabel = translateEntity(String(log.entity));
    const formattedDate = formatDateToDMY(log.timestamp);
    const actionLabel = translateAction(log.action);
    return new AppLogDto(
      log.id,
      actionLabel,
      log.entityId ?? null,
      log.details ?? 'Sin detalles',
      formattedDate,
      entityLabel,
      userFullName,
      userRoleLabel
    );
  }
}
