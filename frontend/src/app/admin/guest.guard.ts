import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('adminToken');

    if (token) {
        router.navigate(['/admin/dashboard']);
        return false;
    } else {
        return true;
    }
};
