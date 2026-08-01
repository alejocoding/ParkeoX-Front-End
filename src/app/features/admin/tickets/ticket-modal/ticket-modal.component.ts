import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../../../services/ticket.service';
import { TariffsService } from '../../../../services/tariffs.service';
import { AuthService } from '../../../../services/auth.service';
import { detectVehicleType, formatPlate, isValidPlate, vehicleLabel, VehicleKind } from '../utils/plate.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent implements OnInit {

  @Input() initialPlate: string = '';
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
    if (this.initialPlate) {
      // Solo formatea y detecta el tipo; el cálculo de tarifa se hace
      // cuando lleguen las tarifas (todavía no están cargadas aquí).
      this.plate = formatPlate(this.initialPlate);
      this.selectedVehicleType = detectVehicleType(this.plate) ?? '';
    }

    this.tariffsService
      .getTariffsByCompany(this.authService.getcompany() ?? '')
      .subscribe({
        next: (data) => {
          this.tariffs = data ?? [];
          if (this.selectedVehicleType) {
            this.calcularTotal();
          }
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

  get plateDetected(): VehicleKind {
    return detectVehicleType(this.plate);
  }

  vehicleLabelOf(kind: string): string {
    return vehicleLabel(kind as VehicleKind);
  }

  get plateHasContent(): boolean {
    return this.plate.replace(/-/g, '').length > 0;
  }

  onPlateChange(value: string): void {
    this.plate = formatPlate(value);

    const detected = detectVehicleType(this.plate);
    if (detected) {
      this.selectedVehicleType = detected;
      this.calcularTotal();
    }
  }

  calcularTotal(): void {
    // Las tarifas aún no han llegado del backend; no hay nada que buscar todavía.
    if (this.tariffs.length === 0) return;

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

    if (!isValidPlate(this.plate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Placa inválida',
        text: 'Ingresa una placa con formato válido: ABC-123 para carro o ABC-12D para moto.'
      });
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
