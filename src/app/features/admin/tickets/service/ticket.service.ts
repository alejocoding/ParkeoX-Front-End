import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private api = 'http://localhost:8080/advanced/ticket';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(this.api, ticket);
  }

  updateTicket(id:number, ticket:any): Observable<any> {
    return this.http.put(`${this.api}/${id}`, ticket);
  }

}
