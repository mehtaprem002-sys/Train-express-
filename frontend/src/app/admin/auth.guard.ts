import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const token = localStorage.getItem('adminToken');

    if (token) {
        return true;
    } else {
        router.navigate(['/admin/login']);
        return false;
    }
};
