import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../services/ticket.service';
import { StatusService } from '../../../../services/status.service';
import { detectVehicleType, vehicleLabel } from '../utils/plate.util';
import Swal from 'sweetalert2';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Nequi'];

@Component({
  selector: 'app-ticket-detail',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent implements OnChanges {

  @Input() ticket: any = null;
  @Input() companyName: string = '';
  @Input() tariffs: any[] = [];
  @Output() ticketUpdated = new EventEmitter<void>();
  @Output() ticketClosed = new EventEmitter<void>();

  selectedTariffId: number | null = null;
  elapsedLabel: string = '';
  statusOptions: any[] = [];

  constructor(
    private ticketService: TicketService,
    private statusService: StatusService
  ) {
    this.statusService.getStatus().subscribe({
      next: (data) => this.statusOptions = data ?? [],
      error: () => {}
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.selectedTariffId = this.ticket.tariffId ?? null;
      this.elapsedLabel = this.computeElapsed();
    }
  }

  get vehicleType(): string {
    return detectVehicleType(this.ticket?.vehicle) ?? '';
  }

  get vehicleTypeLabel(): string {
    return vehicleLabel(detectVehicleType(this.ticket?.vehicle));
  }

  get isClosed(): boolean {
    return this.ticket?.status?.toLowerCase?.() === 'cerrado';
  }

  get selectedTariff(): any {
    return this.tariffs.find((t) => t.id === this.selectedTariffId) ?? null;
  }

  get displayTotal(): number {
    return this.selectedTariff ? this.selectedTariff.price : (this.ticket?.total ?? 0);
  }

  private computeElapsed(): string {
    if (!this.ticket?.checkInAt) return '---';
    const start = new Date(this.ticket.checkInAt).getTime();
    const end = this.ticket.checkOutAt ? new Date(this.ticket.checkOutAt).getTime() : Date.now();
    const minutesTotal = Math.max(0, Math.floor((end - start) / 60000));
    const hours = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    return `${hours}h ${minutes}m`;
  }

  onTariffChange(): void {
    // Solo actualiza la vista previa del total; se guarda al cerrar el ticket.
  }

  closeTicket(): void {
    if (!this.ticket) return;

    if (!this.selectedTariff) {
      Swal.fire({ icon: 'warning', title: 'Selecciona una tarifa', text: 'Debes elegir una tarifa antes de cerrar el ticket' });
      return;
    }

    const closedStatus = this.statusOptions.find((s) => s.status?.toLowerCase() === 'cerrado');
    if (!closedStatus) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se encontró el estado "Cerrado" configurado' });
      return;
    }

    Swal.fire({
      icon: 'question',
      title: '¿Cerrar ticket?',
      text: `Se cobrará ${this.selectedTariff.price.toLocaleString('es-CO')} COP (${this.selectedTariff.vehicleType})`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed'
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.askPaymentMethod();
    });
  }

  private askPaymentMethod(): void {
    Swal.fire({
      icon: 'info',
      title: 'Forma de pago',
      input: 'radio',
      inputOptions: PAYMENT_METHODS.reduce((acc: any, method) => {
        acc[method] = method;
        return acc;
      }, {}),
      inputValidator: (value) => (!value ? 'Selecciona una forma de pago' : undefined),
      confirmButtonText: 'Confirmar cierre',
      confirmButtonColor: '#7c3aed',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;
      this.performClose(result.value);
    });
  }

  private performClose(paymentMethod: string): void {
    const closedStatus = this.statusOptions.find((s) => s.status?.toLowerCase() === 'cerrado');

    const updated = {
      vehicle: this.ticket.vehicle,
      checkInAt: this.ticket.checkInAt,
      checkOutAt: new Date().toISOString(),
      status: closedStatus.id,
      total: this.selectedTariff.price,
      tariff: this.selectedTariff.id,
      paymentMethod
    };

    this.ticketService.updateTicket(this.ticket.id, updated).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Ticket cerrado',
          text: `Pago registrado: ${paymentMethod}`,
          timer: 2000,
          showConfirmButton: false
        });
        this.ticketClosed.emit();
      },
      error: (err) => {
        const msg = err.status === 403
          ? 'Sin permisos para cerrar el ticket. Verifica que tu sesión esté activa.'
          : err.status === 404
          ? 'Ticket no encontrado en el servidor.'
          : 'No se pudo cerrar el ticket. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status}`, text: msg });
      }
    });
  }

  printTicket(): void {
    window.print();
  }
}
