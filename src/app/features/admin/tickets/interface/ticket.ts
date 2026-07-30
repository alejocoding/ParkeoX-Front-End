export interface Ticket {
  id?: number;
  vehicle: string;
  tariff: number;
  status: number;
  total: number;
  checkInAt: string;
  checkOutAt?: string | null;
  email?: string;
}
