import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../service/ticket.service';
import { TariffsService } from '../../../../services/tariffs.service';
import { AuthService } from '../../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() ticketSaved = new EventEmitter<void>();

  plate: string = '';
  today: Date = new Date();
  tariffs: any[] = [];
  selectedVehicleType: string = '';
  selectedTariff: any = null;
  total: number = 0;

  constructor(
    private ticketService: TicketService,
    private tariffsService: TariffsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.tariffsService
      .getTariffsByCompany(sessionStorage.getItem('company') || '')
      .subscribe({
        next: (data) => {
          this.tariffs = data;
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las tarifas'
          });
        }
      });
  }

  calcularTotal(): void {
    const tariffFound = this.tariffs.find(
      (tariff: any) => tariff.vehicleType === this.selectedVehicleType
    );

    if (tariffFound) {
      this.total = tariffFound.price;
      this.selectedTariff = tariffFound;
    } else {
      this.total = 0;
      this.selectedTariff = null;
      Swal.fire({
        icon: 'error',
        title: 'Tarifa no encontrada',
        text: 'Contacta al administrador para configurar las tarifas de tu empresa',
        backdrop: true
      });
    }
  }

  saveTicket(): void {
    if (!this.plate.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Ingresa la placa del vehículo' });
      return;
    }

    if (!this.selectedTariff) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Selecciona un tipo de vehículo' });
      return;
    }

    const ticket = {
      vehicle: this.plate.toUpperCase().trim(),
      tariff: this.selectedTariff.id,
      status: 1,
      total: this.total,
      checkInAt: new Date(),
      email: this.authService.getEmail() ?? '',
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
        this.ticketSaved.emit();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al crear ticket:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el ticket' });
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
