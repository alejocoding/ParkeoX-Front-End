import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { LicenseService } from '../../../services/license.service';
import Swal from 'sweetalert2';

type Urgencia = 'good' | 'warning' | 'critical';

@Component({
  selector: 'app-licenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './licenses.component.html',
  styleUrl: './licenses.component.css'
})
export class LicensesComponent implements OnInit {

  cargando: boolean = true;
  solicitando: boolean = false;
  license: any = null;

  // Geometría del arco semicircular (radio 80, centrado en 100,100)
  readonly gaugeLength = Math.PI * 80;

  private nit: string;

  constructor(
    private authService: AuthService,
    private licenseService: LicenseService
  ) {
    this.nit = this.authService.getcompany() ?? '';
  }

  ngOnInit(): void {
    this.cargando = true;

    this.licenseService.getLicensesByCompany(this.nit).subscribe({
      next: (data) => {
        const licencias = data ?? [];
        // La licencia vigente/más reciente: la de mayor fecha de vencimiento
        this.license = licencias.length
          ? [...licencias].sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())[0]
          : null;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar la información de la licencia' });
      }
    });
  }

  private get beginDate(): Date | null {
    return this.license?.beginAt ? new Date(this.license.beginAt) : null;
  }

  private get endDate(): Date | null {
    return this.license?.endAt ? new Date(this.license.endAt) : null;
  }

  get vencida(): boolean {
    const end = this.endDate;
    return !!end && Date.now() > end.getTime();
  }

  get porcentajeRestante(): number {
    const begin = this.beginDate;
    const end = this.endDate;
    if (!begin || !end) return 0;

    const total = end.getTime() - begin.getTime();
    if (total <= 0) return 0;

    const restante = end.getTime() - Date.now();
    return Math.min(100, Math.max(0, (restante / total) * 100));
  }

  get diasRestantes(): number {
    const end = this.endDate;
    if (!end) return 0;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  }

  get diasTranscurridos(): number {
    const begin = this.beginDate;
    if (!begin) return 0;
    return Math.max(0, Math.floor((Date.now() - begin.getTime()) / 86400000));
  }

  get duracionTotalDias(): number {
    const begin = this.beginDate;
    const end = this.endDate;
    if (!begin || !end) return 0;
    return Math.max(0, Math.round((end.getTime() - begin.getTime()) / 86400000));
  }

  get urgencia(): Urgencia {
    if (this.vencida) return 'critical';
    const p = this.porcentajeRestante;
    if (p <= 15) return 'critical';
    if (p <= 40) return 'warning';
    return 'good';
  }

  get urgenciaLabel(): string {
    if (this.vencida) return 'Vencida';
    switch (this.urgencia) {
      case 'critical': return 'Por vencer';
      case 'warning': return 'Próxima a vencer';
      default: return 'Vigente';
    }
  }

  get urgenciaIcon(): string {
    switch (this.urgencia) {
      case 'critical': return 'fa-triangle-exclamation';
      case 'warning': return 'fa-clock';
      default: return 'fa-circle-check';
    }
  }

  // stroke-dashoffset del arco de relleno: 0 = 100% lleno, gaugeLength = vacío
  get gaugeOffset(): number {
    return this.gaugeLength * (1 - this.porcentajeRestante / 100);
  }

  get mostrarSolicitarRenovacion(): boolean {
    return this.urgencia !== 'good';
  }

  solicitarRenovacion(): void {
    if (!this.license?.idLicense || this.solicitando) return;

    Swal.fire({
      icon: 'question',
      title: '¿Solicitar renovación?',
      text: `Se enviará una solicitud de renovación para la licencia ${this.license.idLicense}.`,
      showCancelButton: true,
      confirmButtonText: 'Solicitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7c3aed'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.solicitando = true;

      this.licenseService.requestRenewal(this.license.idLicense).subscribe({
        next: () => {
          this.solicitando = false;
          Swal.fire({
            icon: 'success',
            title: 'Solicitud enviada',
            text: 'Tu solicitud de renovación fue enviada correctamente.',
            timer: 2500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          this.solicitando = false;
          const msg = err.status === 403
            ? 'No tienes permisos para solicitar la renovación de esta licencia.'
            : 'No se pudo enviar la solicitud. Intenta de nuevo.';
          Swal.fire({ icon: 'error', title: `Error ${err.status ?? ''}`, text: msg });
        }
      });
    });
  }
}
