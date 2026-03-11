import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      <!-- Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div class="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10">
        
        <!-- Header -->
        <div class="text-center mb-12 animate-fade-in">
          <h1 class="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Contact Our Team</h1>
          <p class="text-slate-500 text-base max-w-xl mx-auto leading-relaxed font-light">
            Have questions about your journey or need help with a booking? 
            Our dedicated support team is available 24/7 to assist you.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          <!-- Left Column: Contact Info -->
          <div class="space-y-10 animate-slide-in-left">
            
            <div class="space-y-6">
              <h2 class="text-xl font-bold text-slate-800">Reach Out to Us</h2>
              
              <div class="flex items-start gap-4 group">
                <div class="w-12 h-12 rounded-xl bg-white shadow-lg shadow-indigo-500/5 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 border border-slate-100 shrink-0">
                  <span class="material-symbols-outlined text-2xl">mail</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-sm mb-0.5">Email Us</h3>
                  <p class="text-slate-500 text-sm mb-0.5 line-clamp-1">Support team responds within 2 hours.</p>
                  <a href="mailto:support@trainexpress.com" class="text-indigo-600 font-bold text-sm hover:underline">support@trainexpress.com</a>
                </div>
              </div>

              <div class="flex items-start gap-4 group">
                <div class="w-12 h-12 rounded-xl bg-white shadow-lg shadow-indigo-500/5 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 border border-slate-100 shrink-0">
                  <span class="material-symbols-outlined text-2xl">call</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-sm mb-0.5">Call Us</h3>
                  <p class="text-slate-500 text-sm mb-0.5">Mon - Fri, 9am to 6pm IST.</p>
                  <a href="tel:+919876543210" class="text-emerald-600 font-bold text-sm hover:underline">+91 98765 43210</a>
                </div>
              </div>

              <div class="flex items-start gap-4 group">
                <div class="w-12 h-12 rounded-xl bg-white shadow-lg shadow-indigo-500/5 flex items-center justify-center text-orange-600 transition-transform group-hover:scale-110 border border-slate-100 shrink-0">
                  <span class="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-800 text-sm mb-0.5">Visit Us</h3>
                  <p class="text-slate-500 text-sm leading-snug">Railway Plaza, New Delhi, 110001</p>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div class="pt-6 border-t border-slate-200">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Follow Our Journey</h3>
              <div class="flex gap-3">
                <button class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-xs text-slate-600 hover:bg-slate-900 hover:text-white transition-all">𝕏</button>
                <button class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-xs text-slate-600 hover:bg-indigo-600 hover:text-white transition-all">FB</button>
                <button class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-xs text-slate-600 hover:bg-pink-600 hover:text-white transition-all">IG</button>
              </div>
            </div>
          </div>

          <!-- Right Column: Contact Form -->
          <div class="animate-slide-in-right">
            <div class="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-[24px] shadow-xl shadow-indigo-500/5 border border-white/50 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
              
              <h2 class="text-xl font-bold text-slate-800 mb-6 relative z-10">Send a Message</h2>

              <form (submit)="submitForm()" class="space-y-4 relative z-10">
                <!-- Success/Error Feedback -->
                <div *ngIf="status" class="mb-6 p-4 rounded-xl text-center font-medium animate-fade-in"
                  [ngClass]="status.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'">
                  {{ status.message }}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
                    <input type="text" [(ngModel)]="contactForm.name" name="name" 
                      class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                      required>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
                    <input type="email" [(ngModel)]="contactForm.email" name="email" 
                      class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                      required>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Subject</label>
                  <select [(ngModel)]="contactForm.subject" name="subject"
                    class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium appearance-none">
                    <option value="Booking Query">Booking Query</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Your Message</label>
                  <textarea [(ngModel)]="contactForm.message" name="message" rows="3"
                    class="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium resize-none shadow-sm"
                    required></textarea>
                </div>

                <div class="pt-2">
                  <button type="submit" [disabled]="submitting"
                    class="w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 text-sm">
                    <span *ngIf="!submitting" class="flex items-center gap-2">
                      Send Message
                      <span class="material-symbols-outlined text-lg">send</span>
                    </span>
                    <span *ngIf="submitting" class="flex items-center gap-2">
                      Sending...
                      <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    .animate-slide-in-left { animation: slideInLeft 1s ease-out forwards; }
    .animate-slide-in-right { animation: slideInRight 1s ease-out forwards; }
  `]
})
export class ContactUsComponent {
  contactForm = {
    name: '',
    email: '',
    subject: 'Booking Query',
    message: ''
  };

  submitting = false;
  status: { success: boolean, message: string } | null = null;

  constructor(private http: HttpClient) { }

  async submitForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.status = { success: false, message: 'Please fill in all required fields.' };
      return;
    }

    this.submitting = true;
    this.status = null;

    try {
      // Get token from local storage
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await firstValueFrom(
        this.http.post('http://localhost:5000/api/contact', this.contactForm, { headers })
      );

      this.status = {
        success: true,
        message: 'Message sent successfully! We will get back to you shortly.'
      };

      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        subject: 'Booking Query',
        message: ''
      };

    } catch (error) {
      console.error('Form submission error:', error);
      this.status = {
        success: false,
        message: 'Oops! Something went wrong. Please try again later.'
      };
    } finally {
      this.submitting = false;
    }
  }
}
