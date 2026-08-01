// Placas colombianas:
//  - Carro:  3 letras + 3 números   -> ABC123
//  - Moto:   3 letras + 2 números + 1 letra -> ABC12D
const CAR_REGEX = /^[A-Z]{3}\d{3}$/;
const MOTO_REGEX = /^[A-Z]{3}\d{2}[A-Z]$/;

export type VehicleKind = 'Particular' | 'Motocicleta' | null;

/** Deja solo letras/números, en mayúscula, máximo 6 caracteres. */
export function sanitizePlate(raw: string): string {
  return (raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

/** Formatea con el separador "-" después de las 3 primeras posiciones. */
export function formatPlate(raw: string): string {
  const clean = sanitizePlate(raw);
  return clean.length <= 3 ? clean : `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

/** Detecta si la placa corresponde a un carro o a una moto. Null si el formato aún no es válido. */
export function detectVehicleType(raw: string): VehicleKind {
  const clean = sanitizePlate(raw);
  if (CAR_REGEX.test(clean)) return 'Particular';
  if (MOTO_REGEX.test(clean)) return 'Motocicleta';
  return null;
}

export function isValidPlate(raw: string): boolean {
  return detectVehicleType(raw) !== null;
}

/** Texto para mostrar en la interfaz en vez de un emoji. */
export function vehicleLabel(kind: VehicleKind): string {
  if (kind === 'Particular') return 'Vehículo';
  if (kind === 'Motocicleta') return 'Motocicleta';
  return 'Desconocido';
}
