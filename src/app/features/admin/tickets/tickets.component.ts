import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from './service/ticket.service';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, TicketModalComponent],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {

  tickets:any[] = [];

  showModal:boolean = false;
  today: Date = new Date();

  selectedTicket:any = null;
  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {

    this.ticketService.getTickets().subscribe({
      next:(data)=>{
        this.tickets = data;
      }
    });

  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

}
