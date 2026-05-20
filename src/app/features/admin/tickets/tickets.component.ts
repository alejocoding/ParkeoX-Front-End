import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from './service/ticket.service';
import { TicketModalComponent } from './ticket-modal/ticket-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, TicketModalComponent, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {

  tickets:any[] = [];

  showModal:boolean = false;
  today: Date = new Date();
  searchPlate: string = '';

  selectedTicket:any = null;
  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();

  }

  loadTickets(): void {

    this.ticketService.getTickets().subscribe({
      next:(data)=>{
        console.log("Tickets: ", data);
        this.tickets = data;
      },error:(error)=>{
        console.error("Error fetching tickets: ", error);
      }
    });

  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }


  get filteredTickets() {

  if (!this.searchPlate) {
    return this.tickets;
  }

  return this.tickets.filter((ticket: any) =>
    ticket.vehicle
      ?.toLowerCase()
      .includes(this.searchPlate.toLowerCase())
  );

}
}
