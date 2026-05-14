import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener payload completo
  getPayload(): any {

    const token = this.getToken();

    if (!token) return null;

    return JSON.parse(atob(token.split('.')[1]));
  }

  // Obtener rol
  getRol(): string | null {

    const payload = this.getPayload();

    return payload?.rol ?? payload?.role ?? null;
  }

  // Obtener nombre
  getNombre(): string | null {

    const payload = this.getPayload();

    return payload?.nombre ?? null;
  }

  logout(): void {
    Swal.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión exitosamente'
    });
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
