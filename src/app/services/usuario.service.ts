import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:8080/basics/users';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getUsuariosByCompany(nit: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/company/${nit}`);
  }

  createUsuario(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUsuario(cedula: string, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${cedula}`, usuario);
  }
}
