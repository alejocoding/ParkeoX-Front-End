export interface Ticket {

  id?: number;

  vehicle: number;

  tariff: number;

  status: number;

  total: number;

  checkInAt: string;

  checkOutAt?: string;

}
