export const ENTITIES_DICT: Record<string, string> = {
  USER: 'Usuario',
  PRODUCT: 'Producto',
  SERVICE: 'Servicio',
  SALE: 'Venta',
  CUSTOMER: 'Cliente',
  POS_SESSION: 'Caja',
  CATEGORY: 'Categoría',
  AUTH: 'Autenticación',
  BLOG: 'Contenido Web',
};

export const LOG_ACTIONS_DICT: Record<string, string> = {
  CREATE: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
};

export const ROLES_DICT: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
  SALES: 'Ventas',
};

export function translateEntity(key?: string | null): string {
  if (!key) return '';
  return ENTITIES_DICT[key] ?? key;
}

export function translateRole(key?: string | null): string {
  if (!key) return '';
  return ROLES_DICT[key] ?? key;
}

export function translateAction(key?: string | null): string {
  if (!key) return '';
  return LOG_ACTIONS_DICT[key] ?? key;
}
