import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  mensajeError: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

    login(): void {



    this.http.post<{ token: string }>(
      'http://localhost:8080/auth/login',
      {
        email: this.email,
        password: this.password
      }
    ).subscribe({

      next: (response) => {

        this.authService.saveToken(response.token);

        const rol = this.authService.getRol();

        switch (rol) {

          case 'SUPERADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;

          case 'USER':
            this.router.navigate(['/home']);
            break;

          default:
            this.router.navigate(['/login']);
        }
      },

      error: (error) => {

        console.error('Error:', error);

        if (error.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Error de autenticación',
            text: 'Correo electrónico o contraseña incorrectos'
          });
        }
        else if (error.status === 0) {
           Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor'
          });

        }
        else {
          Swal.fire({
            icon: 'warning',
            title: 'Error de servidor',
            text: 'Error inesperado'
          });
        }
      }
    });
  }
}


