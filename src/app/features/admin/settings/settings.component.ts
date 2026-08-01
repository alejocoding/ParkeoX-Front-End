import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CompanyService } from '../../../services/company.service';
import { StatusService } from '../../../services/status.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {

  cargandoPerfil: boolean = true;
  cargandoCompania: boolean = true;
  guardandoPerfil: boolean = false;
  guardandoCompania: boolean = false;

  // Perfil
  userCedula: string = '';
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';

  // Compañía
  companyName: string = '';
  companyNit: string = '';
  companyAddress: string = '';
  companyStatusName: string = '';

  private nit: string;
  private originalNit: string = '';
  private companyStatusId: number | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private companyService: CompanyService,
    private statusService: StatusService
  ) {
    this.nit = this.authService.getcompany() ?? '';
  }

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarCompania();
  }

  private cargarPerfil(): void {
    this.cargandoPerfil = true;
    const email = this.authService.getEmail();

    this.usuarioService.getUsuariosByCompany(this.nit).subscribe({
      next: (usuarios) => {
        const yo = (usuarios ?? []).find((u: any) => u.email === email);
        this.userCedula = yo?.cedula ?? '';
        this.userName = yo?.name ?? '';
        this.userEmail = yo?.email ?? email ?? '';
        this.userRole = yo?.role ?? this.authService.getRol() ?? '';
        this.cargandoPerfil = false;
      },
      error: () => {
        this.cargandoPerfil = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar tu perfil' });
      }
    });
  }

  private cargarCompania(): void {
    this.cargandoCompania = true;

    this.companyService.getCompany(this.nit).subscribe({
      next: (data) => {
        this.originalNit = data?.nit ?? this.nit;
        this.companyName = data?.name ?? '';
        this.companyNit = data?.nit ?? '';
        this.companyAddress = data?.address ?? '';
        this.companyStatusName = data?.status ?? '';

        this.statusService.getStatus().subscribe({
          next: (statusData) => {
            this.companyStatusId = (statusData ?? []).find((s: any) => s.status === this.companyStatusName)?.id ?? null;
          }
        });

        this.cargandoCompania = false;
      },
      error: () => {
        this.cargandoCompania = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información de la compañía' });
      }
    });
  }

  guardarPerfil(): void {
    if (!this.userName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'El nombre no puede estar vacío' });
      return;
    }

    if (!this.userCedula) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo identificar tu usuario. Vuelve a iniciar sesión.' });
      return;
    }

    this.guardandoPerfil = true;

    this.usuarioService.updateUsuario(this.userCedula, { name: this.userName.trim() }).subscribe({
      next: () => {
        this.guardandoPerfil = false;
        Swal.fire({
          icon: 'success',
          title: '¡Perfil actualizado!',
          text: 'Cierra sesión y vuelve a iniciar para ver tu nombre actualizado en todo el sistema.'
        });
      },
      error: (err) => {
        this.guardandoPerfil = false;
        const msg = err.status === 403
          ? 'Sin permisos para actualizar tu perfil.'
          : 'No se pudo actualizar tu nombre. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
      }
    });
  }

  guardarCompania(): void {
    if (!this.companyName.trim() || !this.companyNit.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'El nombre y el NIT de la compañía no pueden estar vacíos' });
      return;
    }

    if (!this.companyStatusId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo determinar el estado actual de la compañía. Intenta nuevamente.' });
      return;
    }

    const nitCambio = this.companyNit.trim() !== this.originalNit;

    const payload = {
      name: this.companyName.trim(),
      nit: this.companyNit.trim(),
      address: this.companyAddress,
      status: this.companyStatusId
    };

    this.guardandoCompania = true;

    this.companyService.updateCompany(this.originalNit, payload).subscribe({
      next: () => {
        this.guardandoCompania = false;
        this.originalNit = payload.nit;
        Swal.fire({
          icon: 'success',
          title: '¡Compañía actualizada!',
          text: nitCambio
            ? 'El NIT cambió: cierra sesión y vuelve a iniciar para que el cambio se refleje en todo el sistema.'
            : 'Los datos de la compañía se actualizaron correctamente.'
        });
      },
      error: (err) => {
        this.guardandoCompania = false;
        const msg = err.status === 404
          ? 'No se encontró la compañía en el servidor.'
          : 'No se pudo actualizar la compañía. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
      }
    });
  }
}
