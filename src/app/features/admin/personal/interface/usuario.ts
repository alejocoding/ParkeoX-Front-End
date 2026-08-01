export type RolPersonal = 'ADMIN' | 'USER';

/**
 * Forma en la que el backend devuelve un usuario (UserResponseDTO):
 * role/status/company llegan como el nombre legible, no como IDs.
 */
export interface Usuario {
  id: number;
  cedula: string;
  name: string;
  email: string;
  tel: number;
  role: string;
  status: string;
  company: string;
  createdAt?: string;
}
