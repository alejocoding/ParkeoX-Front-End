import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private api = 'http://localhost:8080/basics/status';

  constructor(private httpClient: HttpClient) { }

  getStatus() {
    return this.httpClient.get<any[]>(this.api);
  }
}
