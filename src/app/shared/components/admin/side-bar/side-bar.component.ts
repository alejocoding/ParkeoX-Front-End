import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Role, Roles } from '../../../../core/constants/roles';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: Role[];
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', icon: 'fas fa-th-large', route: '/admin/dashboard', roles: [Roles.ADMIN, Roles.SUPERADMIN] },
  { label: 'Cuentas', icon: 'fas fa-wallet', route: '', roles: [Roles.ADMIN, Roles.SUPERADMIN] },
  { label: 'Tickets', icon: 'fas fa-credit-card', route: '/admin/tickets', roles: [Roles.ADMIN, Roles.SUPERADMIN] },
  { label: 'Personal', icon: 'fas fa-bullseye', route: '/admin/personal', roles: [Roles.ADMIN, Roles.SUPERADMIN] },
  { label: 'Licencia', icon: 'fas fa-id-badge', route: '/admin/licenses', roles: [Roles.ADMIN, Roles.SUPERADMIN] },
  { label: 'Reportes', icon: 'fas fa-circle-question', route: '', roles: [Roles.ADMIN, Roles.SUPERADMIN] }
];

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {

  constructor(private authService: AuthService) {}

  get menuItems(): MenuItem[] {
    const rol = this.authService.getRol();
    return MENU_ITEMS.filter(item => !!rol && item.roles.includes(rol as Role));
  }

  logout() {
    this.authService.logout();
  }

}
