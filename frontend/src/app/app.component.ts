import { Component, signal } from '@angular/core';
import { AuthService } from './shared/auth.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { ToastComponent } from './shared/toast.component';
import { ConfirmModalComponent } from './shared/confirm-modal.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, CommonModule, ToastComponent, ConfirmModalComponent],
    template: `
    <div class="min-h-screen bg-background-light text-slate-900">
        <app-toast></app-toast>
        <app-confirm-modal></app-confirm-modal>
        <!-- Header -->
    <header *ngIf="!isAdminRoute()" class="sticky top-0 z-[100] w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex h-20 items-center justify-between">
                <!-- Premium Logo -->
                <a routerLink="/" class="flex flex-row items-center gap-3 group cursor-pointer">
                    <div class="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 overflow-hidden transform group-hover:scale-105 transition-all duration-300 border border-white/10">
                        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        <span class="material-symbols-outlined font-light text-[22px] sm:text-[28px] relative z-10 transition-transform group-hover:scale-110 duration-300">directions_railway</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 leading-none pb-[1px]">TrainExpress</span>
                        <span class="text-[9px] sm:text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.25em] sm:tracking-[0.3em] mt-0.5 opacity-90">Premium Travel</span>
                    </div>
                </a>

                <!-- Desktop Nav -->
                <nav class="hidden md:flex items-center gap-8">
                    <a href="#" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">Home</a>
                    <a routerLink="/pnr-status" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">Live Status / PNR</a>
                    <a routerLink="/about-us" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">About Us</a>
                    <a routerLink="/contact-us" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">Contact Us</a>
                </nav>


                <!-- User Actions -->
                <div class="hidden md:flex items-center gap-4">
                    <ng-container *ngIf="!authService.isLoggedIn()">
                        <a routerLink="/auth" class="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">Sign In</a>
                        <button routerLink="/auth" class="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 dark:bg-white px-6 text-sm font-bold text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-900/20">
                            Register
                        </button>
                    </ng-container>
                    
                    <ng-container *ngIf="authService.isLoggedIn()">
                        <div class="relative ml-3">
                            <a routerLink="/profile" class="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-105" title="My Profile">
                                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                    {{ userInitials }}
                                </div>
                            </a>
                        </div>
                    </ng-container>
                </div>

                <!-- Mobile Menu Button -->
                <button class="md:hidden p-2 text-slate-600 dark:text-slate-400">
                    <span class="material-symbols-outlined">menu</span>
                </button>
            </div>
        </div>
    </header>

    <main class="flex-grow">
        <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer *ngIf="!isAdminRoute() && !isAuthRoute()" class="bg-white dark:bg-background-dark pt-16 pb-8 border-t border-slate-100 dark:border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div class="col-span-1 md:col-span-1">
                    <!-- Premium Footer Logo -->
                    <a routerLink="/" class="flex items-center gap-3 mb-6 group cursor-pointer inline-flex">
                        <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 overflow-hidden border border-white/5">
                            <span class="material-symbols-outlined font-light text-2xl group-hover:scale-110 transition-transform duration-300">directions_railway</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none pb-[1px]">TrainExpress</span>
                            <span class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Premium Travel</span>
                        </div>
                    </a>
                    <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Making your journey comfortable and memorable. Book train tickets easily with India's most trusted platform.
                    </p>
                </div>
                
                <div>
                    <h4 class="font-bold text-slate-900 dark:text-white mb-4">Quick Links</h4>
                    <ul class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li><a href="#" class="hover:text-primary transition-colors">Find Train</a></li>
                        <li><a routerLink="/pnr-status" class="hover:text-primary transition-colors">PNR Status</a></li>
                        <li><a href="#" class="hover:text-primary transition-colors">Seat Availability</a></li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-slate-900 dark:text-white mb-4">Support</h4>
                    <ul class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li><a routerLink="/contact-us" class="hover:text-primary transition-colors cursor-pointer">Contact Us</a></li>
                        <li><a routerLink="/about-us" class="hover:text-primary transition-colors cursor-pointer">About Us</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-sm text-slate-400 dark:text-slate-500">© 2026 Train Express Inc. All rights reserved.</p>
            </div>
        </div>
    </footer>
    </div>
  `,
    styles: []
})
export class AppComponent {
    title = 'train-express';
    // Signal for profile menu state
    isProfileMenuOpen = signal(false);

    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    isAdminRoute(): boolean {
        return this.router.url.includes('/admin');
    }

    isAuthRoute(): boolean {
        return this.router.url.includes('/auth') || this.router.url.includes('/login') || this.router.url.includes('/register');
    }

    isHomeRoute(): boolean {
        return this.router.url === '/';
    }

    toggleProfileMenu() {
        this.isProfileMenuOpen.update(v => !v);
    }

    get userInitials(): string {
        const name = this.authService.currentUser()?.name || '';
        return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    }

    logout() {
        this.isProfileMenuOpen.set(false);
        this.authService.logout();
    }
}
