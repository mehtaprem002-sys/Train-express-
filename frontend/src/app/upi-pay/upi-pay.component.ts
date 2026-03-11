import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-upi-pay',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div class="w-full max-w-sm bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700 p-6 flex flex-col relative animate-fade-in-up">
        
        <div class="text-center mb-6 pt-4">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
            <span class="material-symbols-outlined text-3xl">qr_code_scanner</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white mb-1">Pay via UPI</h1>
          <p class="text-slate-400 text-sm">Train Express Secure Payment Checkout</p>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center justify-center py-10 space-y-4">
            <div class="w-10 h-10 border-4 border-slate-700 border-t-primary rounded-full animate-spin"></div>
            <p class="text-slate-400 font-medium">Fetching details...</p>
        </div>
        
        <div *ngIf="!loading && error" class="text-center py-10">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-500 mb-3">
                <span class="material-symbols-outlined">error</span>
            </div>
            <p class="text-red-400 font-bold mb-1">Payment Session Invalid</p>
            <p class="text-sm text-slate-500">{{ error }}</p>
        </div>

        <div *ngIf="!loading && !error && bookingData" class="space-y-6">
            <div class="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                <div class="flex justify-between items-center mb-4">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount To Pay</div>
                    <div class="text-2xl font-black text-white">₹{{ amount }}</div>
                </div>

                <div class="h-px w-full bg-slate-700/50 mb-4"></div>

                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-400">Train</span>
                        <span class="text-sm font-bold text-white">{{ bookingData.train?.number }} ({{ bookingData.train?.name }})</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-400">Route</span>
                        <span class="text-sm font-bold text-white text-right">{{ bookingData.train?.from }} <span class="text-slate-500 mx-1">→</span> {{ bookingData.train?.to }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-400">Date</span>
                        <span class="text-sm font-bold text-white">{{ bookingData.date | date:'mediumDate' }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-slate-400">Travellers</span>
                        <span class="text-sm font-bold text-white">{{ bookingData.passengers?.length }} Person(s)</span>
                    </div>
                </div>
            </div>

            <button *ngIf="status === 'pending'" (click)="completePayment()"
                class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl py-4 font-black text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex justify-center items-center gap-2">
                <span class="material-symbols-outlined">lock</span>
                Pay Securely Now
            </button>

             <div *ngIf="status === 'completed'" class="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                 <span class="material-symbols-outlined text-green-500 text-4xl mb-2">check_circle</span>
                 <p class="text-green-400 font-bold text-lg">Payment Successful!</p>
                 <p class="text-sm text-slate-400 mt-1">Please look at your computer or desktop screen now. It should auto-complete your booking.</p>
             </div>
        </div>

        <div class="text-center mt-6">
            <span class="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-bold uppercase tracking-widest">
                <span class="material-symbols-outlined text-[12px]">security</span>
                Verified by TrainExpress Platform
            </span>
        </div>
      </div>
    </div>
  `
})
export class UpiPayComponent implements OnInit {
    intentId: string = '';
    bookingData: any;
    amount: number = 0;
    status: string = 'pending';
    loading: boolean = true;
    error: string = '';

    constructor(private route: ActivatedRoute, private http: HttpClient) { }

    ngOnInit() {
        this.intentId = this.route.snapshot.paramMap.get('id') || '';
        if (this.intentId) {
            this.fetchIntent();
        } else {
            this.error = 'No payment ID found in URL';
            this.loading = false;
        }
    }

    fetchIntent() {
        const backendHost = window.location.hostname;
        this.http.get<any>(`http://${backendHost}:5000/api/payments/intent/${this.intentId}`).subscribe({
            next: (res) => {
                this.status = res.status;
                this.bookingData = res.bookingData || null;
                this.amount = res.bookingData?.paymentDetails?.amount || 0;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Could not fetch payment details. Link might have expired or is invalid.';
                this.loading = false;
            }
        });
    }

    completePayment() {
        const backendHost = window.location.hostname;
        this.loading = true;
        this.http.post<any>(`http://${backendHost}:5000/api/payments/intent/${this.intentId}/complete`, {}).subscribe({
            next: (res) => {
                this.status = 'completed';
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to process payment. Try again.';
                this.loading = false;
            }
        });
    }
}
