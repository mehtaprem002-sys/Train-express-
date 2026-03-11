import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <!-- Left Side - Branding -->
      <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          <!-- Logo -->
          <div class="mb-8 animate-fade-in">
            <div class="flex items-center gap-3 mb-4">
              <div class="relative">
                <div class="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                  <span class="material-symbols-outlined text-4xl text-white font-bold">train</span>
                </div>
                <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
              <div class="text-left">
                <h1 class="text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent drop-shadow-lg">
                  Train Express
                </h1>
                <p class="text-xs text-cyan-200 font-semibold tracking-widest uppercase">Premium Booking</p>
              </div>
            </div>
          </div>

          <!-- Main Heading -->
          <div class="text-center max-w-md animate-fade-in delay-200">
            <h2 class="text-5xl font-black mb-6 leading-tight">
              <span class="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-2xl" style="text-shadow: 0 0 40px rgba(6, 182, 212, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);">
                Join Our
              </span>
              <br/>
              <span class="bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl" style="text-shadow: 0 0 40px rgba(6, 182, 212, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);">
                Travel Community
              </span>
            </h2>
            <p class="text-lg text-cyan-50 font-medium leading-relaxed" style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.3);">
              Create your account today and unlock exclusive benefits, smart booking features, and personalized travel experiences.
            </p>
          </div>

          <!-- Decorative Elements -->
          <div class="mt-12 flex gap-8 animate-fade-in delay-500">
            <div class="text-center">
              <div class="text-3xl font-black text-cyan-300 drop-shadow-lg">Fast</div>
              <div class="text-sm text-cyan-100" style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);">Booking</div>
            </div>
            <div class="h-12 w-px bg-cyan-400/30"></div>
            <div class="text-center">
              <div class="text-3xl font-black text-cyan-300 drop-shadow-lg">Secure</div>
              <div class="text-sm text-cyan-100" style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);">Payments</div>
            </div>
            <div class="h-12 w-px bg-cyan-400/30"></div>
            <div class="text-center">
              <div class="text-3xl font-black text-cyan-300 drop-shadow-lg">Easy</div>
              <div class="text-sm text-cyan-100" style="text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);">Manage</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Registration Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <!-- Background for mobile -->
        <div class="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 blur-3xl"></div>
        </div>

        <div class="w-full max-w-md relative z-10">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8 animate-fade-in">
            <div class="flex items-center justify-center gap-3 mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl text-white">train</span>
              </div>
              <h1 class="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Train Express
              </h1>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 animate-fade-in-up">
            <!-- Header -->
            <div class="text-center mb-8 animate-fade-in delay-100">
              <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
              <p class="text-slate-500 dark:text-slate-400">Join us for seamless train bookings</p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage()" class="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
              <span class="material-symbols-outlined text-lg">error</span>
              {{ errorMessage() }}
            </div>

            <!-- Form -->
            <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="space-y-4">
              <!-- Full Name -->
              <div class="animate-fade-in delay-150">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">badge</span>
                  <input type="text" name="fullName" [(ngModel)]="fullName" (keypress)="onlyAlphabets($event)" placeholder="John Doe" class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-900 dark:text-white shadow-sm" required>
                </div>
                <p *ngIf="!isValidName()" class="text-red-500 text-xs mt-1 animate-shake">Name must contain only alphabets.</p>
              </div>

              <!-- Email -->
              <div class="animate-fade-in delay-200">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">mail</span>
                  <input type="email" name="email" [(ngModel)]="email" placeholder="name@example.com" class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-900 dark:text-white shadow-sm" required>
                </div>
                <p *ngIf="email && !isValidEmail()" class="text-red-500 text-xs mt-1 animate-shake">Please enter a valid email address.</p>
              </div>

              <!-- Password -->
              <div class="animate-fade-in delay-300">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">key</span>
                  <input [type]="showPassword() ? 'text' : 'password'" name="password" [(ngModel)]="password" placeholder="••••••••" class="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-900 dark:text-white shadow-sm" required minlength="4" maxlength="6">
                  <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <span class="material-symbols-outlined text-xl">{{ showPassword() ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
                <p *ngIf="password && (password.length < 4 || password.length > 6)" class="text-red-500 text-xs mt-1 animate-shake">Password must be 4-6 characters.</p>
              </div>

              <!-- Confirm Password -->
              <div class="animate-fade-in delay-500">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-xl">lock_reset</span>
                  <input [type]="showConfirmPassword() ? 'text' : 'password'" name="confirmPassword" [(ngModel)]="confirmPassword" placeholder="••••••••" class="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-slate-900 dark:text-white shadow-sm" required>
                  <button type="button" (click)="toggleConfirmPassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <span class="material-symbols-outlined text-xl">{{ showConfirmPassword() ? 'visibility' : 'visibility_off' }}</span>
                  </button>
                </div>
                <p *ngIf="confirmPassword && password !== confirmPassword" class="text-red-500 text-xs mt-1 animate-shake">Passwords do not match.</p>
              </div>

              <div class="pt-2 animate-fade-in delay-700">
                <button type="submit" [disabled]="!isFormValid()" class="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 transform duration-200">
                  <span>Create Account</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </form>

            <!-- Footer -->
            <div class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account? <a routerLink="/login" class="font-bold text-primary hover:underline cursor-pointer">Sign In</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');

  constructor(private router: Router, private authService: AuthService) { }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  onlyAlphabets(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 32) {
      return true;
    }
    return false;
  }

  isValidName(): boolean {
    if (!this.fullName) return true; // Don't show error if empty
    return /^[a-zA-Z\s]*$/.test(this.fullName);
  }

  isValidEmail(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.email);
  }

  isFormValid(): boolean {
    return (
      this.fullName.length > 0 &&
      this.isValidName() &&
      this.isValidEmail() &&
      this.password.length >= 4 &&
      this.password.length <= 6 &&
      this.password === this.confirmPassword
    );
  }

  onSubmit() {
    this.errorMessage.set(''); // Clear previous errors
    if (this.isFormValid()) {
      const userData = {
        fullName: this.fullName,
        email: this.email,
        password: this.password
      };

      this.authService.register(userData).subscribe({
        next: (res: any) => {
          // Navigate to login after registration
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Registration failed', err);
          this.errorMessage.set(err.error?.message || 'Registration failed');
        }
      });
    }
  }
}
