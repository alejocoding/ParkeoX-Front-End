import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverPasswordService } from '../../../../services/recover-password.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private recoverPasswordService: RecoverPasswordService
  ) {}

  ngOnInit(): void {
    if (!this.recoverPasswordService.resetToken) {
      this.router.navigate(['/forgot-password']);
    }
  }

  restablecer(): void {

    if (!this.newPassword || !this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa ambos campos'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Verifica que ambas contraseñas sean iguales'
      });
      return;
    }

    if (this.newPassword.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'Debe tener al menos 6 caracteres'
      });
      return;
    }

    this.http.post(
      'http://localhost:8080/auth/reset-password',
      {
        resetToken: this.recoverPasswordService.resetToken,
        newPassword: this.newPassword
      }
    ).subscribe({

      next: () => {
        this.recoverPasswordService.reset();
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Ya puedes iniciar sesión con tu nueva contraseña'
        });
        this.router.navigate(['/login']);
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
            icon: 'error',
            title: 'No se pudo restablecer',
            text: 'El proceso expiró, solicita un nuevo código'
          });
        }
      }
    });
  }
}
