import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';
import { FormsModule } from '@angular/forms';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';
import { detectVehicleType, formatPlate, vehicleLabel } from './utils/plate.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, TicketModalComponent, FormsModule, TicketDetailComponent],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  tickets: any[] = [];
  showModal: boolean = false;
  searchPlate: string = '';
  statusFilter: string = '';
  vehicleTypeFilter: string = '';
  showEditModal: boolean = false;
  selectedTicket: any = null;
  previewTicket: any = null;
  ticketToPrint: any = null;
  companyName: string = '';
  initialPlateForModal: string = '';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private companyService: CompanyService
  ) {}

  ngOnInit(): void {
    this.loadTickets();

    const nit = this.authService.getcompany();
    if (nit) {
      this.companyService.getCompany(nit).subscribe({
        next: (data) => this.companyName = data?.name ?? '',
        error: (err) => console.error('Error al cargar la compañía:', err)
      });
    }
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (error) => {
        console.error('Error al cargar tickets:', error);
      }
    });
  }

  onTicketSaved(): void {
    this.closeModal();
    this.loadTickets();
  }

  onTicketUpdated(): void {
    this.previewTicket = null;
    this.loadTickets();
  }

  onSearchPlateChange(value: string): void {
    this.searchPlate = formatPlate(value);
  }

  openModal(plate: string = ''): void {
    this.initialPlateForModal = plate;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.initialPlateForModal = '';
  }

  quickCreateFromSearch(): void {
    this.openModal(this.searchPlate);
  }

  openEditModal(ticket: any): void {
    this.selectedTicket = ticket;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTicket = null;
  }

  openEditFromPreview(): void {
    if (!this.previewTicket) return;
    this.openEditModal(this.previewTicket);
  }

  selectPreview(ticket: any): void {
    this.previewTicket = this.previewTicket?.id === ticket.id ? null : ticket;
  }

  closePreview(): void {
    this.previewTicket = null;
  }

  inferVehicleType(plate: string): string {
    return detectVehicleType(plate) ?? 'Desconocido';
  }

  vehicleLabelFor(plate: string): string {
    return vehicleLabel(detectVehicleType(plate));
  }

  deleteTicket(ticket: any): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar ticket?',
      text: `Esta acción eliminará el ticket de ${ticket.vehicle?.toUpperCase()} de forma permanente.`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.ticketService.deleteTicket(ticket.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Ticket eliminado',
            timer: 2000,
            showConfirmButton: false
          });
          if (this.previewTicket?.id === ticket.id) this.previewTicket = null;
          this.loadTickets();
        },
        error: (err) => {
          const msg = err.status === 403
            ? 'Sin permisos para eliminar. Verifica que tu sesión esté activa.'
            : err.status === 404
            ? 'Ticket no encontrado en el servidor.'
            : 'No se pudo eliminar el ticket. Intenta de nuevo.';
          Swal.fire({ icon: 'error', title: `Error ${err.status}`, text: msg });
        }
      });
    });
  }

  // Imprime directamente sin abrir el modal de edición
  printDirectly(ticket: any): void {
    this.ticketToPrint = ticket;
    setTimeout(() => {
      window.print();
      this.ticketToPrint = null;
    }, 150);
  }

  get statusOptions(): string[] {
    return Array.from(new Set(this.tickets.map((t) => t.status).filter(Boolean)));
  }

  get filteredTickets() {
    const term = this.searchPlate.trim().toLowerCase();

    return this.tickets.filter((ticket: any) => {
      const matchesSearch = !term || ticket.vehicle?.toLowerCase().includes(term);
      const matchesStatus = !this.statusFilter || ticket.status === this.statusFilter;
      const matchesType = !this.vehicleTypeFilter || this.inferVehicleType(ticket.vehicle) === this.vehicleTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }
}
