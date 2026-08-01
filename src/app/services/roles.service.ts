import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private api = 'http://localhost:8080/basics/roles';

  constructor(private httpClient: HttpClient) { }

  getRoles() {
    return this.httpClient.get<any[]>(this.api);
  }
}
