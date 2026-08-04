import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { FormsModule } from '@angular/forms';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';
import { TariffsService } from '../../../services/tariffs.service';
import { detectVehicleType, formatPlate, isValidPlate, vehicleLabel } from './utils/plate.util';
import Swal from 'sweetalert2';

type Tab = 'hoy' | 'detallado';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketDetailComponent],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  tickets: any[] = [];
  tariffs: any[] = [];
  searchPlate: string = '';
  vehicleTypeFilter: string = '';
  selectedTicket: any = null;
  companyName: string = '';

  activeTab: Tab = 'hoy';
  detalladoDate: string = this.todayISODate();

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private companyService: CompanyService,
    private tariffsService: TariffsService
  ) {}

  ngOnInit(): void {
    this.loadTickets();

    const nit = this.authService.getcompany();
    if (nit) {
      this.companyService.getCompany(nit).subscribe({
        next: (data) => this.companyName = data?.name ?? '',
        error: (err) => console.error('Error al cargar la compañía:', err)
      });

      this.tariffsService.getTariffsByCompany(nit).subscribe({
        next: (data) => this.tariffs = data ?? [],
        error: (err) => console.error('Error al cargar tarifas:', err)
      });
    }
  }

  private todayISODate(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        if (this.selectedTicket) {
          this.selectedTicket = this.tickets.find((t) => t.id === this.selectedTicket.id) ?? null;
        }
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
      }
    });
  }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    this.vehicleTypeFilter = '';
  }

  onSearchPlateChange(value: string): void {
    this.searchPlate = formatPlate(value);
  }

  quickCreateFromSearch(): void {
    const plate = this.searchPlate;

    if (!plate.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa la placa del vehículo' });
      return;
    }

    if (!isValidPlate(plate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Placa inválida',
        text: 'Ingresa una placa con formato válido: ABC-123 para carro o ABC-12D para moto.'
      });
      return;
    }

    const vehicleType = detectVehicleType(plate);
    const tariff = this.tariffs.find((t) => t.vehicleType === vehicleType);

    if (!tariff) {
      Swal.fire({
        icon: 'error',
        title: 'Tarifa no encontrada',
        text: 'Contacta al administrador para configurar las tarifas de tu empresa'
      });
      return;
    }

    const ticket = {
      vehicle: plate.toUpperCase().trim(),
      tariff: tariff.id,
      status: 1,
      total: tariff.price,
      checkInAt: new Date(),
      email: this.authService.getEmail() ?? ''
    };

    this.ticketService.createTicket(ticket).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Ticket creado!',
          text: `Vehículo ${ticket.vehicle} registrado correctamente`,
          timer: 2000,
          showConfirmButton: false
        });
        this.searchPlate = '';
        this.loadTickets();
      },
      error: (err) => {
        console.error('Error al crear ticket:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el ticket' });
      }
    });
  }

  selectTicket(ticket: any): void {
    this.selectedTicket = this.selectedTicket?.id === ticket.id ? null : ticket;
  }

  onTicketClosed(): void {
    this.selectedTicket = null;
    this.loadTickets();
  }

  toggleVehicleFilter(type: string): void {
    this.vehicleTypeFilter = this.vehicleTypeFilter === type ? '' : type;
  }

  inferVehicleType(plate: string): string {
    return detectVehicleType(plate) ?? 'Desconocido';
  }

  vehicleLabelFor(plate: string): string {
    return vehicleLabel(detectVehicleType(plate));
  }

  plateNoDash(plate: string): string {
    return (plate ?? '').replace('-', '');
  }

  private isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getFullYear() === today.getFullYear()
      && d.getMonth() === today.getMonth()
      && d.getDate() === today.getDate();
  }

  private isOnDate(dateStr: string, isoDate: string): boolean {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return formatted === isoDate;
  }

  /** Tickets de hoy, sin cerrar. */
  get hoyTickets(): any[] {
    return this.tickets.filter((t) => this.isToday(t.checkInAt) && t.status?.toLowerCase() !== 'cerrado');
  }

  /** Tickets del día seleccionado en el date picker (incluye cerrados). */
  get detalladoTickets(): any[] {
    return this.tickets.filter((t) => this.isOnDate(t.checkInAt, this.detalladoDate));
  }

  get baseTickets(): any[] {
    return this.activeTab === 'hoy' ? this.hoyTickets : this.detalladoTickets;
  }

  get motoCount(): number {
    return this.baseTickets.filter((t) => this.inferVehicleType(t.vehicle) === 'Motocicleta').length;
  }

  get carroCount(): number {
    return this.baseTickets.filter((t) => this.inferVehicleType(t.vehicle) === 'Particular').length;
  }

  get filteredTickets(): any[] {
    const term = this.searchPlate.trim().toLowerCase();

    return this.baseTickets.filter((ticket: any) => {
      const matchesSearch = !term || ticket.vehicle?.toLowerCase().includes(term);
      const matchesType = !this.vehicleTypeFilter || this.inferVehicleType(ticket.vehicle) === this.vehicleTypeFilter;
      return matchesSearch && matchesType;
    });
  }
}
