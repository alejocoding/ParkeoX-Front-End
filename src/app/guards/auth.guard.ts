import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación
  if (!authService.isAuthenticated()) {

    router.navigate(['/login']);

    return false;
  }

  // Roles permitidos para la ruta
  const allowedRoles: string[] | undefined = route.data?.['roles'];

  // Rol del usuario
  const userRole = authService.getRol();

  // Validar rol
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {

    router.navigate(['/login']);

    return false;
  }

  return true;
};
