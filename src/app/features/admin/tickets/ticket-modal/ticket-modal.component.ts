import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../service/ticket.service';
import { TariffsService } from '../../../../services/tariffs.service';
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

  constructor(private ticketService: TicketService, private tariffsService: TariffsService){}


  ngOnInit(): void {

    this.tariffsService.getTariffsByCompany(sessionStorage.getItem('company') || '').subscribe({
     next:(data)=>{
       console.log("Tarifas: ", data);
      },error:(error)=>{
        console.error("Error fetching tariffs: ", error);
      }
    });
  }
  calcularTotal(): void {
    console.log("sesion storage" , sessionStorage)
    console.log(localStorage);

    if(this.tariff == 1){
      this.total = 2200;
    }

    if(this.tariff == 2){
      this.total = 4000;
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
