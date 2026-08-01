import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverPasswordService } from '../../../../services/recover-password.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private recoverPasswordService: RecoverPasswordService
  ) {}

  enviarCodigo(): void {

    if (!this.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta el correo',
        text: 'Ingresa tu correo electrónico'
      });
      return;
    }

    this.http.post(
      'http://localhost:8080/auth/forgot-password',
      { email: this.email }
    ).subscribe({

      next: () => {
        this.recoverPasswordService.email = this.email;
        this.router.navigate(['/verify-code']);
      },

      error: (error) => {

        console.error('Error:', error);

        if (error.status === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor'
          });
        } else {
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
