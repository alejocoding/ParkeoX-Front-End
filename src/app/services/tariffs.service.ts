import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TariffsService {

  private api = 'http://localhost:8080/basics/tariff';

  constructor(private httpClient: HttpClient) { }

   getTariffs() {
    return this.httpClient.get<any[]>(this.api);
  }

  getTariffsByCompany(nit: string) {
    return this.httpClient.get<any[]>(`${this.api}/company/${nit}`);
  }
}
