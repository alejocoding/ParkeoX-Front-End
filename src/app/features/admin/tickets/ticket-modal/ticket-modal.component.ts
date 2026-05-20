import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../service/ticket.service';
import { TariffsService } from '../../../../services/tariffs.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent {

  @Output() close = new EventEmitter<void>();

  plate: string = '';
  today: Date = new Date();
  tariffs: any = [];
  selectedVehicleType: string = '';
  selectedTariff: any = null;
  total: number = 0;

  constructor(private ticketService: TicketService, private tariffsService: TariffsService) { }

  ngOnInit(): void {

    this.tariffsService
      .getTariffsByCompany(sessionStorage.getItem('company') || '')
      .subscribe({
        next: (data) => {

          this.tariffs = data;


        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las tarifas'
          })
        }
      });

  }
  calcularTotal(): void {

    // Buscar la tarifa según el tipo de vehículo
    const tariffFound = this.tariffs.find(
      (tariff: any) => tariff.vehicleType === this.selectedVehicleType
    );

    if (tariffFound) {

      this.total = tariffFound.price;

      // guardar la tarifa completa
      this.selectedTariff = tariffFound;

    } else {

      Swal.fire({
        icon: 'error',
        title: 'Error de tarifa',
        text: 'Contacta al administrador para configurar las tarifas de tu empresa',
        backdrop:true
      });
    }

  }

  saveTicket(): void {

    if(!this.plate) {
      alert("Ingrese la placa del vehículo");
      return;
    }
    if (!this.selectedTariff) {
      alert("Seleccione un tipo de vehículo");
      return;
    }


    const ticket = {

      vehicle: this.plate,
      tariff: this.selectedTariff.id,
      status: 1,
      total: this.total,
      checkInAt: new Date(),
      email: "alejoreyvm@gmail.com",
    };

    console.log(ticket);

    this.ticketService.createTicket(ticket)
      .subscribe({
        next: () => {

          alert("Ticket creado");

          this.closeModal();

        },
        error: (err) => {
          console.error(err);
        }
      });

  }

  closeModal(): void {
    this.close.emit();
  }

}
