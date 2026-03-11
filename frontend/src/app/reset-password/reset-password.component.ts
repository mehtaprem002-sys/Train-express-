import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { NotificationService } from '../shared/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      
      <!-- Full Background Slider -->
      <div class="background-slider">
        <div class="slider-image slide-1"></div>
        <div class="slider-image slide-2"></div>
        <div class="slider-image slide-3"></div>
      </div>
      
      <!-- Dark Overlay -->
      <div class="dark-overlay"></div>
      
      <!-- Split Content Layout -->
      <div class="content-layout">
        
        <!-- Left Panel - Hero Content (Over Background) -->
        <div class="hero-content-panel">
          <div class="hero-content">
            <!-- Brand Section -->
            <div class="brand-section">
              <div class="hero-icon-container">
                <span class="material-symbols-outlined hero-icon">train</span>
              </div>
              <h2 class="brand-name">TrainExpress</h2>
            </div>
            
            <h1 class="hero-title">Secure Reset</h1>
            <p class="hero-subtitle">Create a strong new password and regain access to your account securely</p>
            
            <!-- Features Section -->
            <div class="features-section">
              <div class="feature-card">
                <span class="material-symbols-outlined feature-icon">password</span>
                <div class="feature-label">Strong Passwords</div>
              </div>
              <div class="feature-card">
                <span class="material-symbols-outlined feature-icon">encrypted</span>
                <div class="feature-label">Encrypted Storage</div>
              </div>
              <div class="feature-card">
                <span class="material-symbols-outlined feature-icon">verified</span>
                <div class="feature-label">Instant Access</div>
              </div>
            </div>
            
            <!-- Trust Badges -->
            <div class="trust-badges">
              <div class="badge"><span class="material-symbols-outlined">verified_user</span> SSL Secured</div>
              <div class="badge"><span class="material-symbols-outlined">privacy_tip</span> Privacy Protected</div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Form (Glass Effect) -->
        <div class="form-panel">
          
          <div class="form-card">
            <div class="form-content">
              
              <!-- Logo and Header -->
              <div class="form-header">
                <div class="logo-container">
                  <span class="material-symbols-outlined logo-icon">lock_reset</span>
                </div>
                <h2 class="form-title">Set New Password</h2>
                <p class="form-subtitle">Create a secure password for {{ email }}</p>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage()" class="error-message shake">
                <span class="material-symbols-outlined">error</span>
                <span>{{ errorMessage() }}</span>
              </div>

              <!-- Form -->
              <form (ngSubmit)="onSubmit()" class="auth-form">
                
                <!-- New Password Field -->
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <div class="input-wrapper" [class.input-focus]="isPasswordFocused">
                    <span class="material-symbols-outlined input-icon">lock</span>
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      name="password" 
                      [(ngModel)]="password" 
                      (focus)="isPasswordFocused = true"
                      (blur)="isPasswordFocused = false"
                      placeholder="Enter new password" 
                      class="form-input"
                      required
                      minlength="4"
                      maxlength="6"
                    >
                    <button type="button" (click)="togglePassword()" class="password-toggle">
                      <span class="material-symbols-outlined">
                        {{ showPassword() ? 'visibility' : 'visibility_off' }}
                      </span>
                    </button>
                  </div>
                  <p *ngIf="password && (password.length < 4 || password.length > 6)" class="input-hint error">
                    Password must be 4-6 characters
                  </p>
                </div>

                <!-- Confirm Password Field -->
                <div class="form-group">
                  <label class="form-label">Confirm Password</label>
                  <div class="input-wrapper" [class.input-focus]="isConfirmFocused">
                    <span class="material-symbols-outlined input-icon">lock_reset</span>
                    <input 
                      [type]="showConfirmPassword() ? 'text' : 'password'" 
                      name="confirmPassword" 
                      [(ngModel)]="confirmPassword" 
                      (focus)="isConfirmFocused = true"
                      (blur)="isConfirmFocused = false"
                      placeholder="Confirm new password" 
                      class="form-input"
                      required
                    >
                    <button type="button" (click)="toggleConfirmPassword()" class="password-toggle">
                      <span class="material-symbols-outlined">
                        {{ showConfirmPassword() ? 'visibility' : 'visibility_off' }}
                      </span>
                    </button>
                  </div>
                  <p *ngIf="confirmPassword.length > 0 && password !== confirmPassword" class="input-hint error" style="display: block;">
                    Passwords do not match
                  </p>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="submit-button" [disabled]="!isFormValid()">
                  <span>Update Password</span>
                  <span class="material-symbols-outlined button-icon">check_circle</span>
                </button>
              </form>

              <!-- Footer -->
              <div class="form-footer">
                <p>Remember your password? 
                  <a routerLink="/auth" class="switch-link">Back to Sign In</a>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    /* Container */
    .auth-container {
      position: relative;
      width: 100vw;
      /* Subtract header height (5rem/80px) to prevent scroll */
      height: calc(100vh - 5rem);
      min-height: calc(100vh - 5rem);
      overflow: hidden; /* Prevent scrolling strictly */
      overflow-y: auto; /* Allow active scrolling if needed */
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* Full Background Slider */
    .background-slider {
      position: fixed; /* Fixed so it never scrolls */
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .slider-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover; /* Ensure image covers the full screen */
      background-position: center; /* Center the image */
      background-repeat: no-repeat;
      opacity: 0;
      transition: opacity 2s ease-in-out;
    }

    .slide-1 {
      background-image: url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=80'); /* Scenic Classic Train */
      animation: slideShow 18s infinite;
      animation-delay: 0s;
    }

    .slide-2 {
      background-image: url('https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=1920&q=80'); /* Moving Train Side View */
      animation: slideShow 18s infinite;
      animation-delay: 6s;
    }

    .slide-3 {
      background-image: url('https://images.unsplash.com/photo-1535535112387-56ffe8db21ff?w=1920&q=80'); /* Distinct High Quality Train */
      animation: slideShow 18s infinite;
      animation-delay: 12s;
    }

    @keyframes slideShow {
      0% { opacity: 0; }
      8% { opacity: 1; }
      33% { opacity: 1; }
      41% { opacity: 0; }
      100% { opacity: 0; }
    }

    /* Minimal Dark Overlay - Lightened to allow blur visibility */
    .dark-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3); /* Lighter overlay for better blur contrast */
      z-index: 1;
    }

    /* Content Layout - Perfect 50/50 Split */
    .content-layout {
      position: relative;
      z-index: 2;
      display: flex;
      /* Subtract header height */
      min-height: calc(100vh - 5rem);
      height: calc(100vh - 5rem);
    }

    /* Hero Content Panel (Left) - 50% Width, Transparent */
    .hero-content-panel {
      flex: 0 0 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem 2.5rem;
      background: transparent;
    }

    .hero-content {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    /* Brand Section */
    .brand-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
    }

    .hero-icon-container {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }
      50% { transform: scale(1.05); box-shadow: 0 12px 40px rgba(59, 130, 246, 0.5); }
    }

    .hero-icon {
      font-size: 48px !important;
      color: white;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    }

    .brand-name {
      font-size: 2rem;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    /* Hero Title & Subtitle */
    .hero-title {
      font-size: 2.5rem;
      font-weight: 900;
      color: white;
      line-height: 1.1;
      margin-bottom: 1rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      letter-spacing: -0.5px;
    }

    .hero-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.95);
      line-height: 1.6;
      margin-bottom: 2.5rem;
      font-weight: 400;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    /* Features Section */
    .features-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 1.5rem 1rem;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #60a5fa, #3b82f6);
      transform: scaleX(0);
      transition: transform 0.3s;
    }

    .feature-card:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-5px);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }

    .feature-card:hover::before {
      transform: scaleX(1);
    }

    .feature-icon {
      font-size: 32px !important;
      color: #60a5fa;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .feature-label {
      font-size: 0.875rem;
      color: white;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    /* Trust Badges */
    .trust-badges {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.95);
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .badge .material-symbols-outlined {
      font-size: 18px !important;
      color: #60a5fa;
    }

    /* Form Panel (Right) - 50% Width, Perfect Centering, Transparent Wrapper */
    .form-panel {
      flex: 0 0 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: transparent;
      border: none;
    }

    /* Form Card */
    .form-card {
      width: 100%;
      max-width: 450px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 2rem 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      transition: transform 0.3s;
    }

    /* Form Content */
    .form-content {
      padding: 0;
    }

    /* Logo Container */
    .logo-container {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
    }

    .logo-icon {
      font-size: 32px !important;
      color: white;
    }

    /* Form Header - Compact */
    .form-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .form-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.4rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .form-subtitle {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    }

    /* Error Message */
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(254, 242, 242, 0.95);
      border: 1px solid rgba(254, 202, 202, 0.8);
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
    }

    /* Form Styling */
    .auth-form {
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: white;
      margin-bottom: 0.4rem;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      font-size: 19px !important;
      color: rgba(255, 255, 255, 0.6);
    }

    .form-input {
      width: 100%;
      padding: 0.7rem 1rem 0.7rem 2.75rem;
      background: rgba(255, 255, 255, 0.15);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .form-input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(59, 130, 246, 0.6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }

    .password-toggle:hover {
      color: rgba(255, 255, 255, 0.9);
    }
    
    .input-hint.error {
      color: #FF5252 !important; /* Material Red A200 - Very Bright */
      font-weight: 700;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      margin-bottom: 0;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
      display: block; /* Ensure it takes full width below the input */
      width: 100%;
    }

    /* Submit Button */
    .submit-button {
      width: 100%;
      padding: 0.8rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
    
    .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .button-icon {
      font-size: 18px !important;
    }

    /* Footer */
    .form-footer {
      text-align: center;
      margin-top: 1.25rem;
    }

    .form-footer p {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .switch-link {
      background: none;
      border: none;
      color: #60a5fa;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      text-decoration: none;
    }

    .switch-link:hover {
      color: #3b82f6;
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 968px) {
      .auth-container {
        overflow-y: auto; /* Allow scrolling on mobile if content overflows */
        height: auto;
        min-height: calc(100vh - 5rem);
      }

      .content-layout {
        flex-direction: column; /* Stack vertically on smaller screens */
        height: auto; /* Allow content to determine height */
        min-height: calc(100vh - 5rem);
      }

      .hero-content-panel {
        flex: 0 0 auto; /* Allow natural height */
        width: 100%;
        padding: 3rem 2rem;
      }
      
      .form-panel {
        flex: 0 0 auto; /* Allow natural height */
        width: 100%;
        padding: 3rem 2rem; /* Add padding for mobile */
      }

      .hero-title {
        font-size: 2rem;
      }

      .features-section {
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
    }
    
    .shake {
      animation: shake 0.5s;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal('');
  token = '';
  email = '';

  isPasswordFocused = false;
  isConfirmFocused = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  isFormValid(): boolean {
    return this.password.length >= 4 &&
      this.password.length <= 6 &&
      this.password === this.confirmPassword;
  }

  onSubmit() {
    this.errorMessage.set('');

    if (!this.isFormValid()) {
      if (this.password !== this.confirmPassword) {
        // this.errorMessage.set('Passwords do not match');
        // this.notificationService.showError('Passwords do not match');
      } else {
        // this.errorMessage.set('Password must be 4-6 characters');
        // this.notificationService.showError('Password must be 4-6 characters');
      }
      return;
    }

    if (!this.email) {
      this.errorMessage.set('Invalid request. Email missing.');
      this.notificationService.showError('Invalid request. Email missing.');
      return;
    }

    // Call AuthService reset password
    console.log('Resetting password for:', this.email);

    // Simulating API call since we are in dev and AuthService.resetPassword might fail if no backend support specific for this flow without tokens
    // But let's try to use the real service first if it exists, as per previous check it does.

    // In dev simulation flow we might not have a valid token if we came from "Open Reset Link (Dev)"
    // The backend `resetPassword` takes { email, newPassword }, so it should work!

    this.authService.resetPassword(this.email, this.password).subscribe({
      next: () => {
        this.notificationService.showSuccess('Password reset successful! Please login.');
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 3000);
      },
      error: (err) => {
        console.error('Reset password error:', err);
        const msg = err.error?.message || 'Failed to reset password';
        this.errorMessage.set(msg);
        this.notificationService.showError(msg);
      }
    });
  }
}
