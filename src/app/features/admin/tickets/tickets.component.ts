import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from './service/ticket.service';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';
import { FormsModule } from '@angular/forms';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
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
  showEditModal: boolean = false;
  selectedTicket: any = null;
  ticketToPrint: any = null;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
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
    this.loadTickets();
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  openEditModal(ticket: any): void {
    console.log('Ticket seleccionado para editar:', ticket);
    this.selectedTicket = ticket;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTicket = null;
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

  get filteredTickets() {
    if (!this.searchPlate) {
      return this.tickets;
    }
    return this.tickets.filter((ticket: any) =>
      ticket.vehicle?.toLowerCase().includes(this.searchPlate.toLowerCase())
    );
  }
}
