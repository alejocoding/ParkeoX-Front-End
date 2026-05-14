import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {

 private api = 'http://localhost:8080/basics/company';

  constructor(private http: HttpClient) {}

  getCompany(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

}
