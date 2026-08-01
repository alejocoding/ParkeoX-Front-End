import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  private api = 'http://localhost:8080/advanced/licenses';

  constructor(private http: HttpClient) { }

  getLicensesByCompany(nit: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/company/${nit}`);
  }

  requestRenewal(idLicense: string): Observable<any> {
    return this.http.post(`${this.api}/${idLicense}/renewal-request`, {});
  }
}
