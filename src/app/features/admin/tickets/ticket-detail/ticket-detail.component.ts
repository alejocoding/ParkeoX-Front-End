import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-detail',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.css'
})
export class TicketDetailComponent {


  @Input() ticket: any;

  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  printTicket(): void {
    window.print();
  }
}
