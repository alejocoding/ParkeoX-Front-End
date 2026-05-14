import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../service/ticket.service';


@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-modal.component.html',
  styleUrl: './ticket-modal.component.css'
})
export class TicketModalComponent {

  @Output() close = new EventEmitter<void>();

  plate:string = '';
  today: Date = new Date();
  tariff:number = 1;

  total:number = 0;

  constructor(private ticketService: TicketService){}

  calcularTotal(): void {

    if(this.tariff == 1){
      this.total = 5000;
    }

    if(this.tariff == 2){
      this.total = 10000;
    }

  }

  saveTicket(): void {

    const ticket = {

      vehicle: 1,
      tariff: this.tariff,
      status: 1,
      total: this.total,
      checkInAt: new Date()

    };

    this.ticketService.createTicket(ticket)
      .subscribe({
        next:()=>{

          alert("Ticket creado");

          this.closeModal();

        }
      });

  }

  closeModal(): void {
    this.close.emit();
  }

}
