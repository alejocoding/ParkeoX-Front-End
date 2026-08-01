import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { AuthService } from '../../../../services/auth.service';
import { RolesService } from '../../../../services/roles.service';
import { StatusService } from '../../../../services/status.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-detail.component.html',
  styleUrl: './personal-detail.component.css'
})
export class PersonalDetailComponent implements OnInit {

  @Input() usuario: any;
  @Output() close = new EventEmitter<void>();
  @Output() usuarioActualizado = new EventEmitter<void>();

  editedName: string = '';
  editedCedula: string = '';
  editedTelefono: string = '';
  editedEmail: string = '';
  editedRoleId: number | null = null;
  editedStatusId: number | null = null;
  guardando: boolean = false;

  roles: any[] = [];
  statusList: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private rolesService: RolesService,
    private statusService: StatusService
  ) {}

  ngOnInit(): void {
    this.editedName = this.usuario?.name ?? '';
    this.editedCedula = this.usuario?.cedula ?? '';
    this.editedTelefono = this.usuario?.tel != null ? String(this.usuario.tel) : '';
    this.editedEmail = this.usuario?.email ?? '';

    this.rolesService.getRoles().subscribe({
      // SUPERADMIN es un rol de plataforma sin módulo propio todavía:
      // un ADMIN de compañía no puede asignarlo.
      next: (data) => {
        this.roles = (data ?? []).filter((r: any) => r.rol !== 'SUPERADMIN');
        this.editedRoleId = this.roles.find((r) => r.rol === this.usuario?.role)?.id ?? null;
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los roles disponibles' })
    });

    this.statusService.getStatus().subscribe({
      next: (data) => {
        this.statusList = data ?? [];
        this.editedStatusId = this.statusList.find((s) => s.status === this.usuario?.status)?.id ?? null;
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los estados disponibles' })
    });
  }

  get esUnoMismo(): boolean {
    return !!this.usuario?.email && this.usuario.email === this.authService.getEmail();
  }

  private validar(): boolean {
    if (!this.editedName.trim() || !this.editedCedula.trim() || !this.editedTelefono.trim() || !this.editedEmail.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos antes de continuar' });
      return false;
    }

    const telNumero = Number(this.editedTelefono.replace(/\D/g, ''));
    if (!telNumero || Number.isNaN(telNumero)) {
      Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'Ingresa un número de teléfono válido' });
      return false;
    }

    return true;
  }

  guardarCambios(): void {
    if (!this.validar() || this.guardando) return;

    const actualizado: any = {
      cedula: this.editedCedula.trim(),
      name: this.editedName.trim(),
      tel: Number(this.editedTelefono.replace(/\D/g, '')),
      email: this.editedEmail.trim().toLowerCase()
    };

    if (!this.esUnoMismo) {
      actualizado.role = this.editedRoleId;
      actualizado.status = this.editedStatusId;
    }

    this.guardando = true;

    this.usuarioService.updateUsuario(this.usuario.cedula, actualizado).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Los datos del integrante se actualizaron correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.usuarioActualizado.emit();
        this.closeModal();
      },
      error: (err) => {
        this.guardando = false;
        const msg = err.status === 403
          ? 'Sin permisos para actualizar. Verifica que tu sesión esté activa.'
          : err.status === 404
          ? 'Usuario no encontrado en el servidor.'
          : 'No se pudo actualizar el usuario. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
