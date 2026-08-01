import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecoverPasswordService } from '../../../../services/recover-password.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent implements OnInit {
  code: string = '';
  email: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private recoverPasswordService: RecoverPasswordService
  ) {}

  ngOnInit(): void {
    this.email = this.recoverPasswordService.email;

    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  verificarCodigo(): void {

    if (!this.code) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta el código',
        text: 'Ingresa el código de verificación'
      });
      return;
    }

    this.http.post<{ resetToken: string }>(
      'http://localhost:8080/auth/verify-code',
      { email: this.email, code: this.code }
    ).subscribe({

      next: (response) => {
        this.recoverPasswordService.resetToken = response.resetToken;
        this.router.navigate(['/reset-password']);
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
            title: 'Código inválido',
            text: 'El código ingresado es incorrecto o ya expiró'
          });
        }
      }
    });
  }
}
