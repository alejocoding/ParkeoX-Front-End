import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../services/usuario.service';
import { RolesService } from '../../../../services/roles.service';
import { StatusService } from '../../../../services/status.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-modal.component.html',
  styleUrl: './personal-modal.component.css'
})
export class PersonalModalComponent implements OnInit {

  @Input() companyId: number | null = null;
  @Input() companyName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() usuarioCreado = new EventEmitter<void>();

  cedula: string = '';
  name: string = '';
  telefono: string = '';
  email: string = '';
  password: string = '';
  roleId: number | null = null;
  guardando: boolean = false;

  roles: any[] = [];
  private activeStatusId: number | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private rolesService: RolesService,
    private statusService: StatusService
  ) {}

  ngOnInit(): void {
    this.rolesService.getRoles().subscribe({
      // SUPERADMIN es un rol de plataforma sin módulo propio todavía:
      // un ADMIN de compañía no puede asignarlo.
      next: (data) => this.roles = (data ?? []).filter((r: any) => r.rol !== 'SUPERADMIN'),
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los roles disponibles' })
    });

    this.statusService.getStatus().subscribe({
      next: (data) => {
        const activo = (data ?? []).find((s: any) => !(s.status ?? '').toLowerCase().includes('inactiv'));
        this.activeStatusId = activo?.id ?? null;
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los estados disponibles' })
    });
  }

  get roleLabel(): string {
    return this.roles.find((r) => r.id === this.roleId)?.rol ?? '---';
  }

  private validar(): boolean {
    if (!this.cedula.trim() || !this.name.trim() || !this.telefono.trim() || !this.email.trim() || !this.password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos antes de continuar' });
      return false;
    }

    if (!this.roleId) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Selecciona el rol del nuevo integrante' });
      return false;
    }

    if (this.password.length < 6) {
      Swal.fire({ icon: 'warning', title: 'Contraseña débil', text: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    const telNumero = Number(this.telefono.replace(/\D/g, ''));
    if (!telNumero || Number.isNaN(telNumero)) {
      Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'Ingresa un número de teléfono válido' });
      return false;
    }

    if (!this.companyId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo identificar tu compañía. Vuelve a iniciar sesión.' });
      return false;
    }

    if (!this.activeStatusId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo determinar el estado inicial del usuario. Intenta nuevamente.' });
      return false;
    }

    return true;
  }

  guardar(): void {
    if (!this.validar() || this.guardando) return;

    const usuario = {
      cedula: this.cedula.trim(),
      name: this.name.trim(),
      tel: Number(this.telefono.replace(/\D/g, '')),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      role: this.roleId,
      company: this.companyId,
      status: this.activeStatusId
    };

    this.guardando = true;

    this.usuarioService.createUsuario(usuario).subscribe({
      next: () => {
        this.guardando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: `${usuario.name} fue registrado correctamente`,
          timer: 2000,
          showConfirmButton: false
        });
        this.usuarioCreado.emit();
        this.closeModal();
      },
      error: (err) => {
        this.guardando = false;
        const msg = err.status === 403
          ? 'Sin permisos para crear usuarios. Verifica tu sesión.'
          : err.status === 500
          ? 'No se pudo crear el usuario. Es posible que el correo o la cédula ya estén registrados.'
          : 'No se pudo crear el usuario. Intenta de nuevo.';
        Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
      }
    });
  }

  closeModal(): void {
    this.close.emit();
  }
}
