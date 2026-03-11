import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { adminGuard } from './admin/auth.guard';
import { guestGuard } from './admin/guest.guard';
import { AdminLayoutComponent } from './admin/admin-layout.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'auth', loadComponent: () => import('./auth-card/auth-card.component').then(m => m.AuthCardComponent) },
    { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
    { path: 'register', redirectTo: 'auth', pathMatch: 'full' },
    { path: 'forgot-password', loadComponent: () => import('./auth-card/auth-card.component').then(m => m.AuthCardComponent) },
    { path: 'reset-password', loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
    { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
    { path: 'pnr-status', loadComponent: () => import('./pnr-status/pnr-status.component').then(m => m.PnrStatusComponent) },
    { path: 'search-results', loadComponent: () => import('./search-results/search-results.component').then(m => m.SearchResultsComponent) },
    { path: 'booking/:trainId', loadComponent: () => import('./booking/booking.component').then(m => m.BookingComponent) },
    { path: 'payment', loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent) },
    { path: 'booking-confirmation', loadComponent: () => import('./booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent) },
    { path: 'my-bookings', loadComponent: () => import('./my-bookings/my-bookings.component').then(m => m.MyBookingsComponent) },
    { path: 'about-us', loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent) },
    { path: 'contact-us', loadComponent: () => import('./contact-us/contact-us.component').then(m => m.ContactUsComponent) },
    { path: 'upi-pay/:id', loadComponent: () => import('./upi-pay/upi-pay.component').then(m => m.UpiPayComponent) },

    // ADMIN ROUTES
    {
        path: 'admin/login',
        loadComponent: () => import('./admin/admin-login.component').then(m => m.AdminLoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin/admin-layout.component').then(m => m.AdminLayoutComponent),
        canActivate: [adminGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
            { path: 'trains', loadComponent: () => import('./admin/admin-trains.component').then(m => m.AdminTrainsComponent) },
            { path: 'stations', loadComponent: () => import('./admin/admin-stations.component').then(m => m.AdminStationsComponent) },
            { path: 'bookings', loadComponent: () => import('./admin/admin-bookings.component').then(m => m.AdminBookingsComponent) },
            { path: 'users', loadComponent: () => import('./admin/admin-users.component').then(m => m.AdminUsersComponent) },
            { path: 'messages', loadComponent: () => import('./admin/admin-contacts.component').then(m => m.AdminContactsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: '' }
];
