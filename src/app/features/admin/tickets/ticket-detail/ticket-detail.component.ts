import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../services/ticket.service';
import { StatusService } from '../../../../services/status.service';
import { formatPlate, isValidPlate } from '../utils/plate.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ticket-detail',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnInit {

  @Input() ticket: any;
  @Input() companyName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() ticketUpdated = new EventEmitter<void>();

  editedPlate: string = '';
  editedCheckOut: string = '';
  editedStatus: number = 1;
  editedTotal: number = 0;
  statusOptions: any[] = [];

  constructor(
    private ticketService: TicketService,
    private statusService: StatusService
  ) {}

  ngOnInit(): void {
    this.editedPlate = this.ticket?.vehicle ?? '';
    this.editedCheckOut = this.ticket?.checkOutAt
      ? this.toDatetimeLocal(this.ticket.checkOutAt)
      : '';
    this.editedStatus = this.ticket?.statusId ?? 1;
    this.editedTotal = this.ticket?.total ?? 0;

    this.statusService.getStatus().subscribe({
      next: (data) => {
        this.statusOptions = data;
      },
      error: () => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los estados' });
      }
    });
  }

  onPlateChange(value: string): void {
    this.editedPlate = formatPlate(value);
  }

  get selectedStatusName(): string {
    return this.statusOptions.find(s => s.id === this.editedStatus)?.status ?? '';
  }

  get isClosedStatus(): boolean {
    return this.selectedStatusName.toLowerCase() === 'cerrado';
  }

  private toDatetimeLocal(dateStr: string): string {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  saveChanges(): void {
    if (!this.editedPlate.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'La placa no puede estar vacía' });
      return;
    }

    if (!isValidPlate(this.editedPlate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Placa inválida',
        text: 'Ingresa una placa con formato válido: ABC-123 para carro o ABC-12D para moto.'
      });
      return;
    }

    const updated = {
      vehicle: this.editedPlate.toUpperCase().trim(),
      checkInAt: this.ticket.checkInAt,
      checkOutAt: this.editedCheckOut ? new Date(this.editedCheckOut).toISOString() : null,
      status: this.editedStatus,
      total: this.editedTotal,
      tariff: this.ticket.tariffId,
    };

    this.ticketService.updateTicket(this.ticket.id, updated).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Ticket actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.ticketUpdated.emit();
        this.closeModal();
      },
      error: (err) => {
        const msg = err.status === 403
          ? 'Sin permisos para actualizar. Verifica que tu sesión esté activa.'
          : err.status === 404
          ? 'Ticket no encontrado en el servidor.'
          : 'No se pudo actualizar el ticket. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status}`, text: msg });
      }
    });
  }

  printTicket(): void {
    window.print();
  }

  closeModal(): void {
    this.close.emit();
  }
}
