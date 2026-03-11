import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div class="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
            <div class="text-center mb-8">
                <span class="material-symbols-outlined text-yellow-400 text-5xl mb-4">admin_panel_settings</span>
                <h2 class="text-2xl font-bold text-white">Admin Access</h2>
            </div>
            
            <form (ngSubmit)="login()" class="space-y-6">
                <div>
                     <label class="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                     <input [(ngModel)]="email" name="email" type="email" class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" placeholder="admin@example.com">
                </div>
                <div>
                     <label class="block text-sm font-medium text-slate-400 mb-2">Password</label>
                     <input [(ngModel)]="password" name="password" type="password" class="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none transition-all" placeholder="••••••••">
                </div>

                <div *ngIf="error" class="text-red-400 text-sm italic">{{ error }}</div>

                <button type="submit" [disabled]="loading" class="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
                    {{ loading ? 'Verifying...' : 'Login to Dashboard' }}
                </button>
            </form>

            <div class="mt-8 text-center" *ngIf="!loading">
                <a routerLink="/" class="text-slate-500 hover:text-white text-sm transition-colors">← Back to Main Site</a>
            </div>
        </div>
    </div>
  `
})
export class AdminLoginComponent {
    email = '';
    password = '';
    error = '';
    loading = false;

    constructor(private router: Router, private http: HttpClient) { }

    ngOnInit() {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
    }

    login() {
        if (!this.email || !this.password) {
            this.error = 'Please enter both email and password';
            return;
        }

        this.loading = true;
        this.error = '';

        this.http.post<any>('http://localhost:5000/api/auth/login', {
            email: this.email,
            password: this.password
        }).subscribe({
            next: (res) => {
                if (res.user?.isAdmin) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('adminToken', 'true'); // Keep for guard compatibility
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.error = 'Access denied. Authorized personnel only.';
                    this.loading = false;
                }
            },
            error: (err) => {
                this.error = err.error?.message || 'Login failed. Please check your credentials.';
                this.loading = false;
            }
        });
    }
}
