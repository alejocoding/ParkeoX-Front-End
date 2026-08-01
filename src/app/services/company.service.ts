import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private api = 'http://localhost:8080/basics/company';

  constructor(private http: HttpClient) { }

  getCompany(nit: string): Observable<any> {
    return this.http.get<any>(`${this.api}/unique/${nit}`);
  }

  updateCompany(nit: string, company: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${nit}`, company);
  }
}
