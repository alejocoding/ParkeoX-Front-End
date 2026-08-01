import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';
import { StatusService } from '../../../services/status.service';
import { CompanyService } from '../../../services/company.service';
import { PersonalModalComponent } from './personal-modal/personal-modal.component';
import { PersonalDetailComponent } from './personal-detail/personal-detail.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal',
  standalone: true,
  imports: [CommonModule, FormsModule, PersonalModalComponent, PersonalDetailComponent],
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css'
})
export class PersonalComponent implements OnInit {

  usuarios: any[] = [];
  statusList: any[] = [];
  cargando: boolean = false;

  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';

  showCreateModal: boolean = false;
  showEditModal: boolean = false;
  selectedUsuario: any = null;

  companyId: number | null = null;
  companyName: string = '';

  private readonly nit: string;
  private readonly currentEmail: string | null;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private statusService: StatusService,
    private companyService: CompanyService
  ) {
    this.nit = this.authService.getcompany() ?? '';
    this.currentEmail = this.authService.getEmail();
  }

  ngOnInit(): void {
    this.companyService.getCompany(this.nit).subscribe({
      next: (data: any) => {
        this.companyId = data?.id ?? null;
        this.companyName = data?.name ?? '';
      },
      error: (err) => console.error('Error al resolver la compañía:', err)
    });

    this.statusService.getStatus().subscribe({
      next: (data) => this.statusList = data ?? [],
      error: (err) => console.error('Error al cargar los estados:', err)
    });

    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.cargando = true;
    this.usuarioService.getUsuariosByCompany(this.nit).subscribe({
      next: (data) => {
        this.usuarios = data ?? [];
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        console.error('Error al cargar el personal:', err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el personal de la compañía' });
      }
    });
  }

  get roleOptions(): string[] {
    return Array.from(new Set(this.usuarios.map((u) => u.role).filter(Boolean)));
  }

  get statusOptions(): string[] {
    return Array.from(new Set(this.usuarios.map((u) => u.status).filter(Boolean)));
  }

  get filteredUsuarios(): any[] {
    return this.usuarios.filter((usuario) => {
      const term = this.searchTerm.trim().toLowerCase();

      const matchesSearch = !term ||
        usuario.name?.toLowerCase().includes(term) ||
        usuario.email?.toLowerCase().includes(term) ||
        String(usuario.cedula ?? '').toLowerCase().includes(term);

      const matchesRole = !this.roleFilter || usuario.role === this.roleFilter;
      const matchesStatus = !this.statusFilter || usuario.status === this.statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  esInactivo(status: string): boolean {
    return (status ?? '').toLowerCase().includes('inactiv');
  }

  esAdmin(role: string): boolean {
    return (role ?? '').toLowerCase().includes('admin');
  }

  isCurrentUser(usuario: any): boolean {
    return !!usuario?.email && usuario.email === this.currentEmail;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onUsuarioCreado(): void {
    this.closeCreateModal();
    this.loadUsuarios();
  }

  openEditModal(usuario: any): void {
    this.selectedUsuario = usuario;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUsuario = null;
  }

  onUsuarioActualizado(): void {
    this.loadUsuarios();
  }

  toggleEstado(usuario: any): void {
    if (this.isCurrentUser(usuario)) {
      Swal.fire({
        icon: 'info',
        title: 'Acción no permitida',
        text: 'No puedes desactivar tu propia cuenta.'
      });
      return;
    }

    const activar = this.esInactivo(usuario.status);

    const nuevoEstado = this.statusList.find((s) =>
      activar ? !this.esInactivo(s.status) : this.esInactivo(s.status)
    );

    if (!nuevoEstado) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró un estado válido para aplicar. Verifica la configuración de estados.'
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: activar ? '¿Activar usuario?' : '¿Desactivar usuario?',
      text: activar
        ? `${usuario.name} podrá volver a iniciar sesión en el sistema.`
        : `${usuario.name} no podrá iniciar sesión mientras esté inactivo.`,
      showCancelButton: true,
      confirmButtonText: activar ? 'Activar' : 'Desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: activar ? '#16a34a' : '#dc2626'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.usuarioService.updateUsuario(usuario.cedula, { status: nuevoEstado.id }).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: activar ? 'Usuario activado' : 'Usuario desactivado',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadUsuarios();
        },
        error: (err) => {
          const msg = err.status === 403
            ? 'Sin permisos para actualizar. Verifica que tu sesión esté activa.'
            : err.status === 404
            ? 'Usuario no encontrado en el servidor.'
            : 'No se pudo actualizar el estado del usuario. Intenta de nuevo.';
          Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
        }
      });
    });
  }
}
