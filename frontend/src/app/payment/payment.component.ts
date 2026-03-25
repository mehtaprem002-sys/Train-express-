import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookingService } from '../shared/booking.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

function expiryDateValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    if (!/^\d{2}\/\d{2}$/.test(value)) return { pattern: true };
    const [month, year] = value.split('/').map(Number);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = Number(now.getFullYear().toString().slice(-2));
    if (month < 1 || month > 12) return { invalidMonth: true };
    if (year < currentYear) return { pastYear: true };
    if (year === currentYear && month < currentMonth) return { pastMonth: true };
    return null;
}

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, QRCodeComponent],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-4 px-4 sm:px-6 lg:px-8 font-sans">
      
      <!-- Secure Header Badge -->
      <div class="flex justify-center mb-4">
        <div class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-sm">lock</span>
            Bank-Grade 256-Bit Encryption
        </div>
      </div>

      <div class="text-center mb-6">
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Complete Your Payment</h1>
        <p class="text-slate-500 dark:text-slate-400" *ngIf="bookingData">
            Booking for Train {{ bookingData.train?.number }} - <span class="font-semibold text-slate-700 dark:text-slate-300">{{ bookingData.train?.name }}</span> 
            from {{ bookingData.train?.from }} to {{ bookingData.train?.to }}.
        </p>
      </div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Payment Methods -->
        <div class="lg:col-span-2">
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                
                <!-- Tabs -->
                <div class="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto">
                    <button (click)="selectedPaymentMethod.set('CARD')" 
                        [ngClass]="selectedPaymentMethod() === 'CARD' ? 'text-primary border-b-2 border-primary bg-white dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                        class="flex flex-col items-center gap-2 px-8 py-6 transition-colors min-w-[120px]">
                        <span class="material-symbols-outlined text-2xl">credit_card</span>
                        <span class="text-xs font-bold tracking-wide">CREDIT/DEBIT</span>
                    </button>
                    <button (click)="selectUPI()"
                        [ngClass]="selectedPaymentMethod() === 'UPI' ? 'text-primary border-b-2 border-primary bg-white dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                        class="flex flex-col items-center gap-2 px-8 py-6 transition-colors min-w-[120px]">
                        <span class="material-symbols-outlined text-2xl">qr_code_scanner</span>
                        <span class="text-xs font-bold tracking-wide">UPI / QR</span>
                    </button>
                    <button (click)="selectedPaymentMethod.set('NETBANKING')"
                        [ngClass]="selectedPaymentMethod() === 'NETBANKING' ? 'text-primary border-b-2 border-primary bg-white dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                        class="flex flex-col items-center gap-2 px-8 py-6 transition-colors min-w-[120px]">
                        <span class="material-symbols-outlined text-2xl">account_balance</span>
                        <span class="text-xs font-bold tracking-wide">NET BANKING</span>
                    </button>
                    <button (click)="selectedPaymentMethod.set('WALLET')"
                        [ngClass]="selectedPaymentMethod() === 'WALLET' ? 'text-primary border-b-2 border-primary bg-white dark:bg-slate-800' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                        class="flex flex-col items-center gap-2 px-8 py-6 transition-colors min-w-[120px]">
                        <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
                        <span class="text-xs font-bold tracking-wide">WALLETS</span>
                    </button>
                </div>

                <div class="p-8 md:p-10 min-h-[400px]">
                    <!-- Card Payment Form -->
                    <form *ngIf="selectedPaymentMethod() === 'CARD'" [formGroup]="cardForm" (ngSubmit)="processPayment()" class="space-y-6 max-w-lg animate-fade-in-up">
                         
                         <!-- Cardholder Name -->
                         <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Cardholder Name</label>
                            <input formControlName="name" type="text" 
                                (input)="restrictName($event)"
                                class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-400">
                            <div *ngIf="cardForm.get('name')?.invalid && cardForm.get('name')?.touched" class="text-red-500 text-xs mt-1 font-medium ml-1">Name is required</div>
                        </div>

                        <!-- Card Number -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Card Number</label>
                            <div class="relative">
                                <input formControlName="cardNumber" type="text" maxlength="19"
                                    (input)="formatCardNumber($event)"
                                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono tracking-wider font-medium placeholder:text-slate-400"
                                    placeholder="0000 0000 0000 0000">
                                <span class="material-symbols-outlined absolute right-4 top-3.5 text-slate-400">credit_card</span>
                            </div>
                            <div *ngIf="cardForm.get('cardNumber')?.invalid && cardForm.get('cardNumber')?.touched" class="text-red-500 text-xs mt-1 font-medium ml-1">Valid 16-digit number required</div>
                        </div>

                        <div class="grid grid-cols-2 gap-6">
                            <!-- Expiry -->
                            <div>
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Expiry Date</label>
                                <input formControlName="expiry" type="text" maxlength="5"
                                    (input)="formatExpiry($event)"
                                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center font-medium placeholder:text-slate-400"
                                    placeholder="MM / YY">
                                <div *ngIf="cardForm.get('expiry')?.invalid && cardForm.get('expiry')?.touched" class="text-red-500 text-xs mt-1 font-medium ml-1">Valid expiry required</div>
                            </div>

                            <!-- CVV -->
                            <div>
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">CVV</label>
                                <div class="relative">
                                    <input formControlName="cvv" [type]="showCVV() ? 'text' : 'password'" maxlength="3"
                                        (input)="restrictNumbers($event)"
                                        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center font-mono font-medium placeholder:text-slate-400 pr-10"
                                        placeholder="123">
                                    <button type="button" (click)="showCVV.set(!showCVV())" 
                                        class="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none">
                                        <span class="material-symbols-outlined text-lg">{{ showCVV() ? 'visibility' : 'visibility_off' }}</span>
                                    </button>
                                </div>
                                <div *ngIf="cardForm.get('cvv')?.invalid && cardForm.get('cvv')?.touched" class="text-red-500 text-xs mt-1 font-medium ml-1">Required</div>
                            </div>
                        </div>

                        <!-- Save Card -->
                        <div class="flex items-center gap-3 pt-2">
                            <div class="relative flex items-center">
                                <input type="checkbox" id="saveCard" class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 checked:border-primary checked:bg-primary transition-all">
                                <span class="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[14px] pointer-events-none opacity-0 peer-checked:opacity-100">check</span>
                            </div>
                            <label for="saveCard" class="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">Save card for future faster payments</label>
                        </div>

                        <!-- Mobile Pay Button (Visible only on small screens) -->
                        <button type="submit" [disabled]="cardForm.invalid"
                            class="md:hidden w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-lg flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">lock</span>
                            Pay Securely
                        </button>
                    </form>

                    <!-- UPI Payment Form -->
                    <div *ngIf="selectedPaymentMethod() === 'UPI'" class="space-y-6 max-w-lg text-center animate-fade-in-up">
                        <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center">
                            <h3 class="font-bold text-slate-900 dark:text-white mb-2">Scan QR Code</h3>
                            <p class="text-xs text-slate-500 mb-6">Scan with any UPI app on your phone</p>
                            
                            <div class="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-center">
                                <qrcode *ngIf="qrCodeUrl" [qrdata]="qrCodeUrl" [width]="112" [errorCorrectionLevel]="'M'"></qrcode>
                                <div *ngIf="!qrCodeUrl" class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                            </div>
                            
                            <p class="text-[10px] text-slate-400 font-bold uppercase mb-4 tracking-wider animate-pulse">Waiting for scan...</p>
                            
                            <div class="w-full relative flex items-center py-2">
                                <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                                <span class="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">OR</span>
                                <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                            </div>

                            <div class="w-full mt-4">
                                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 text-left">Enter UPI ID</label>
                                <div class="flex gap-2">
                                    <input type="text" [(ngModel)]="upiId" placeholder="username@upi"
                                        class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-400">
                                    <button type="button" (click)="verifyUpi()" [disabled]="!upiId.includes('@')"
                                        class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase tracking-wider">
                                        Verify
                                    </button>
                                </div>
                                <div *ngIf="upiVerified" class="text-green-500 text-xs mt-2 font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">check_circle</span> Verified User
                                </div>
                            </div>
                        </div>

                         <button type="button" (click)="processPayment()" [disabled]="!upiVerified"
                            class="md:hidden w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-lg flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined">lock</span>
                            Pay Securely
                        </button>
                    </div>

                    <!-- Net Banking Form -->
                    <div *ngIf="selectedPaymentMethod() === 'NETBANKING'" class="space-y-6 max-w-lg animate-fade-in-up">
                        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Popular Banks</h3>
                        <div class="grid grid-cols-3 gap-3 mb-6">
                            <button *ngFor="let bank of ['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB', 'BOB']" 
                                (click)="selectedBank = bank"
                                [ngClass]="selectedBank === bank ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800'"
                                class="border-2 rounded-xl py-4 flex flex-col items-center justify-center gap-2 transition-all group">
                                <span class="material-symbols-outlined text-2xl opacity-60 group-hover:opacity-100">account_balance</span>
                                <span class="text-xs font-bold">{{ bank }}</span>
                            </button>
                        </div>
                        
                        <div>
                            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Other Banks</label>
                            <div class="relative">
                                <select [(ngModel)]="selectedBank"
                                    class="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                    <option value="">Select a Bank...</option>
                                    <option value="Kotak">Kotak Mahindra Bank</option>
                                    <option value="Yes">Yes Bank</option>
                                    <option value="IDFC">IDFC First Bank</option>
                                    <option value="IndusInd">IndusInd Bank</option>
                                </select>
                                <span class="material-symbols-outlined absolute right-4 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <!-- Wallets Form -->
                    <div *ngIf="selectedPaymentMethod() === 'WALLET'" class="space-y-6 max-w-lg animate-fade-in-up">
                        <div class="grid grid-cols-1 gap-3">
                            <button *ngFor="let wallet of ['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik']" 
                                (click)="selectedWallet = wallet"
                                [ngClass]="selectedWallet === wallet ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'"
                                class="border rounded-xl p-4 flex items-center gap-4 transition-all text-left">
                                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex flex-shrink-0 items-center justify-center text-slate-500">
                                     <span class="material-symbols-outlined text-xl">account_balance_wallet</span>
                                </div>
                                <span class="font-bold text-slate-700 dark:text-slate-300 flex-1">{{ wallet }}</span>
                                <span class="material-symbols-outlined text-primary" *ngIf="selectedWallet === wallet">check_circle</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trust Badges -->
            <div class="flex justify-center gap-8 mt-8 opacity-60 grayscale filter">
                <div class="flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-400">security</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">PCI COMPLIANT</span>
                </div>
                 <div class="flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-400">verified_user</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">NORTON SECURED</span>
                </div>
                 <div class="flex flex-col items-center gap-1">
                    <span class="material-symbols-outlined text-3xl text-slate-600 dark:text-slate-400">lock</span>
                    <span class="text-[10px] font-bold text-slate-500 uppercase">SSL ENCRYPTED</span>
                </div>
            </div>
        </div>

        <!-- Right Column: Summary -->
        <div class="lg:col-span-1 space-y-6">
            
            <!-- Journey Details Card -->
            <div class="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 mb-6" *ngIf="bookingData">
                
                <div class="flex items-center gap-3 mb-4">
                     <div class="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900">
                        <span class="material-symbols-outlined">train</span>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ bookingData.train?.from }} → {{ bookingData.train?.to }}</div>
                        <div class="font-bold text-slate-900 dark:text-white text-sm">
                            {{ bookingData.date | date:'mediumDate' }} • {{ bookingData.train?.departure }} <span class="text-slate-400 font-normal mx-1">to</span> {{ bookingData.train?.arrival }}
                        </div>
                    </div>
                </div>
                
                <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ bookingData.class?.type }} Class • Seats: <span class="font-bold text-slate-700 dark:text-slate-300">
                        <ng-container *ngIf="bookingData.selectedSeats?.length > 0; else autoAssign">
                            <span *ngFor="let seat of bookingData.selectedSeats; let last = last">
                                {{ seat.number }} ({{ seat.type }})<span *ngIf="!last">, </span>
                            </span>
                        </ng-container>
                        <ng-template #autoAssign>Auto-Assign</ng-template>
                    </span>
                </p>
            </div>

            <!-- Order Summary Card -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>
                
                <div *ngIf="bookingData" class="space-y-4 mb-8">
                    <div class="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span>Base Fare ({{ bookingData.passengers?.length }} Traveller{{bookingData.passengers?.length > 1 ? 's' : ''}})</span>
                        <span class="text-slate-900 dark:text-white font-bold">₹{{ totalBaseFare | number:'1.0-2' }}</span>
                    </div>
                    <div class="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                        <span>Tax & GST</span>
                        <span class="text-slate-900 dark:text-white font-bold">₹{{ gst | number:'1.0-2' }}</span>
                    </div>
                </div>

                <div class="pt-6 border-t border-slate-100 dark:border-slate-700 mb-8">
                    <div class="flex justify-between items-end mb-1">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-4xl font-extrabold text-slate-900 dark:text-white">₹{{ finalAmount | number:'1.0-2' }}</span>
                        <span class="bg-green-100 text-green-700 rounded-full p-1">
                            <span class="material-symbols-outlined text-sm">check</span>
                        </span>
                    </div>
                </div>

                <button (click)="processPayment()" [disabled]="!isPaymentValid()"
                    class="hidden md:flex w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed justify-center items-center gap-2 text-lg">
                    <span class="material-symbols-outlined">lock</span>
                    Pay Securely
                </button>
                
                <p class="text-[10px] text-slate-400 text-center mt-4 leading-relaxed">
                    By clicking "Pay Securely", you agree to TrainExpress's Terms of Service and Privacy Policy.
                </p>

                 <!-- Error Message Display -->
                 <div *ngIf="errorMessage" class="mt-4 p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">error</span>
                    {{ errorMessage }}
                </div>
            </div>

        </div>

      </div>
    </div>
    `,
    styles: [`:host { display: block; }`]
})
export class PaymentComponent implements OnInit, OnDestroy {
    selectedPaymentMethod = signal<'CARD' | 'UPI' | 'NETBANKING' | 'WALLET'>('CARD');
    showCVV = signal<boolean>(false);
    cardForm: FormGroup;
    bookingData: any;
    totalBaseFare = 0;
    gst = 0;
    finalAmount = 0;
    errorMessage: string = '';

    upiId: string = '';
    upiVerified: boolean = false;
    selectedBank: string = '';
    selectedWallet: string = '';

    qrPaymentIntentId: string = '';
    qrCodeUrl: string = '';
    qrPollingInterval: any;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private location: Location,
        private bookingService: BookingService,
        private http: HttpClient
    ) {
        this.cardForm = this.fb.group({
            cardNumber: ['', [Validators.required, Validators.pattern(/^(\d{4}\s?){4}$/)]],
            expiry: ['', [Validators.required, expiryDateValidator]],
            cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
            name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]]
        });
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.bookingData = navigation.extras.state['bookingData'];
            this.calculateFare();
        }
    }

    ngOnInit() {
        if (!this.bookingData) {
            // Handle reload case or testing if needed
        }
    }

    ngOnDestroy() {
        if (this.qrPollingInterval) {
            clearInterval(this.qrPollingInterval);
        }
    }

    selectUPI() {
        this.selectedPaymentMethod.set('UPI');
        if (!this.qrPaymentIntentId && this.bookingData) {
            const safeBooking = {
                ...this.bookingData,
                paymentDetails: { amount: this.finalAmount }
            };
            this.http.post<any>('http://localhost:5000/api/payments/intent', safeBooking).subscribe({
                next: (res) => {
                    this.qrPaymentIntentId = res.id;
                    const phoneIp = res.localIp || window.location.hostname;
                    this.qrCodeUrl = window.location.protocol + '//' + phoneIp + ':' + window.location.port + '/upi-pay/' + res.id;
                    this.startPolling();
                },
                error: (err) => {
                    console.error('Failed to create payment intent');
                }
            });
        }
    }

    startPolling() {
        this.qrPollingInterval = setInterval(() => {
            if (!this.qrPaymentIntentId) return;
            this.http.get<any>(`http://localhost:5000/api/payments/intent/${this.qrPaymentIntentId}`).subscribe(res => {
                if (res.status === 'completed') {
                    clearInterval(this.qrPollingInterval);
                    this.upiVerified = true;
                    this.processPayment();
                }
            });
        }, 3000);
    }

    formatCardNumber(event: any) {
        this.errorMessage = '';
        let input = event.target;
        let value = input.value.replace(/\D/g, '');
        value = value.substring(0, 16);
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        input.value = formatted;
        this.cardForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });
    }

    formatExpiry(event: any) {
        this.errorMessage = '';
        let input = event.target;
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
        input.value = value;
        this.cardForm.get('expiry')?.setValue(value, { emitEvent: false });
    }

    restrictNumbers(event: any) {
        this.errorMessage = '';
        const input = event.target;
        input.value = input.value.replace(/\D/g, '');
        this.cardForm.get('cvv')?.setValue(input.value);
    }

    restrictName(event: any) {
        this.errorMessage = '';
        const input = event.target;
        input.value = input.value.replace(/[^a-zA-Z\s]/g, '');
        this.cardForm.get('name')?.setValue(input.value);
    }

    calculateFare() {
        if (!this.bookingData) return;
        const pricePerTicket = this.bookingData.class?.price || 0;
        let base = 0;
        this.bookingData.passengers.forEach((p: any) => {
            if (p.age < 15) base += pricePerTicket * 0.5;
            else base += pricePerTicket;
        });
        this.totalBaseFare = base;
        this.gst = 11;
        this.finalAmount = this.totalBaseFare + this.gst;
    }

    goBack() {
        if (this.bookingData) {
            this.router.navigate(['/booking', this.bookingData.train.number], {
                state: {
                    train: this.bookingData.train,
                    selectedClass: this.bookingData.class,
                    travelDate: this.bookingData.date,
                    passengers: this.bookingData.passengers
                }
            });
        } else {
            this.location.back();
        }
    }

    verifyUpi() {
        if (this.upiId.includes('@')) {
            // Mock validation
            setTimeout(() => {
                this.upiVerified = true;
            }, 800);
        }
    }

    isPaymentValid(): boolean {
        switch (this.selectedPaymentMethod()) {
            case 'CARD': return this.cardForm.valid;
            case 'UPI': return this.upiVerified;
            case 'NETBANKING': return this.selectedBank !== '';
            case 'WALLET': return this.selectedWallet !== '';
            default: return false;
        }
    }

    processPayment() {
        if (!this.isPaymentValid() || !this.bookingData) {
            if (this.selectedPaymentMethod() === 'CARD') {
                this.cardForm.markAllAsTouched();
            } else {
                this.errorMessage = 'Please complete the selected payment details first.';
            }
            return;
        }

        // Generate Random PNR
        const pnr = 'PNR' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

        // Determine Status based on availability
        let bookingStatus = 'Confirmed';
        if (this.bookingData.class?.availability?.text?.startsWith('WL')) {
            bookingStatus = 'Waitlist';
        }

        // Create Full Booking Object
        const finalBooking = {
            pnr: pnr,
            ...this.bookingData,
            selectedSeats: this.bookingData.selectedSeats,
            paymentDetails: {
                method: this.selectedPaymentMethod(),
                amount: this.finalAmount,
                date: new Date().toISOString()
            },
            status: bookingStatus
        };

        // Clean undefined values for Firestore/MongoDB
        const safeBooking = JSON.parse(JSON.stringify(finalBooking));

        // Save to Backend
        this.bookingService.createBooking(safeBooking).subscribe({
            next: (res) => {
                // Use response from backend which contains assigned seats/berths
                this.router.navigate(['/booking-confirmation'], {
                    replaceUrl: true,
                    state: { booking: res }
                });
            },
            error: (err) => {
                console.error('Booking failed', err);
                if (err.status === 401 || err.error?.message === 'Please authenticate') {
                    this.errorMessage = 'Session expired. Please log in again to complete your booking.';
                } else {
                    this.errorMessage = err.error?.error || err.message || 'Failed to save booking. Please try again.';
                }
            }
        });
    }
}
