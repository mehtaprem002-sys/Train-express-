import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BookingService } from '../shared/booking.service';

@Component({
    selector: 'app-booking-confirmation',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-screen flex items-center justify-center p-4 pt-16 font-sans bg-slate-50">
      <div class="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full max-w-[650px] p-6 md:px-8 md:py-6 border border-slate-100">
        
        <!-- Header Section -->
        <div class="flex flex-col items-center justify-center mb-5">
          <div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-slate-900 mb-1">Booking Confirmed!</h2>
          <p class="text-slate-500">Your ticket has been successfully booked.</p>
        </div>
        
        <!-- Details Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          
          <!-- PNR & Amount Row -->
          <div class="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PNR NUMBER</p>
              <p class="text-2xl font-bold text-[#1877F2]">{{ booking?.pnr }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">TOTAL AMOUNT</p>
              <p class="text-2xl font-extrabold text-slate-900">₹{{ booking?.paymentDetails?.amount }}</p>
            </div>
          </div>
          
          <!-- Journey Details Row -->
          <div class="border-b border-slate-100 pb-4 mb-4">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">JOURNEY DETAILS</p>
            <div class="flex justify-between items-center mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900">{{ booking?.train?.from }}</h3>
                <p class="text-sm text-slate-500">{{ booking?.train?.departure || '15:00' }}</p>
              </div>
              
              <div class="flex-none px-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              <div class="flex-1 text-right">
                <h3 class="text-lg font-bold text-slate-900">{{ booking?.train?.to }}</h3>
                <p class="text-sm text-slate-500">{{ booking?.train?.arrival || '18:00' }}</p>
              </div>
            </div>
            <div class="inline-block bg-slate-50 text-slate-700 text-sm font-medium px-4 py-1.5 rounded-xl border border-slate-100">
              {{ booking?.train?.name }} ({{ booking?.train?.number }})
            </div>
          </div>
          
          <!-- Passengers Row -->
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">PASSENGERS</p>
            <div class="space-y-3">
              <div *ngFor="let p of booking?.passengers; let i = index" class="flex justify-between items-center">
                <div class="flex items-center space-x-3">
                  <div class="w-7 h-7 bg-slate-100 text-slate-600 text-xs font-bold rounded-full flex items-center justify-center">{{ i + 1 }}</div>
                  <div>
                    <span class="font-bold text-slate-900">{{ p.name }}</span>
                    <span class="text-sm text-slate-400 ml-2">({{ p.age }} yrs, {{ p.gender }})</span>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-slate-800">{{ getPassengerStatus(i, p) }}</p>
                  <p class="text-xs text-slate-400">No Preference</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Actions Row -->
        <div class="flex space-x-4">
          <button (click)="downloadTicket()" [disabled]="!booking" class="flex-1 flex justify-center items-center space-x-2 bg-white border border-slate-200 text-slate-800 py-3 rounded-xl font-bold hover:bg-slate-50 transition duration-200 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Ticket</span>
          </button>
          
          <button [routerLink]="['/']" class="flex-1 flex justify-center items-center space-x-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Go Home</span>
          </button>
        </div>
        
      </div>
    </div>

    <!-- Hidden Ticket Template for PDF Generation (Untouched) -->
    <div class="absolute -left-[9999px] top-0 opacity-0 pointer-events-none">
        <div #ticketContent class="w-[800px] bg-white p-8 text-slate-900 font-sans border-2 border-slate-800" style="font-family: Arial, sans-serif;">
            
            <!-- Header -->
            <div class="text-center border-b-2 border-slate-800 pb-4 mb-4">
                <h2 class="text-xl font-bold uppercase underline mb-2">Electronic Reservation Slip (ERS)</h2>
                <div class="flex justify-between items-center px-8">
                     <div class="text-left">
                        <p class="font-bold text-sm">Booked From</p>
                        <p class="text-lg font-bold uppercase">{{ booking?.train?.from || 'N/A' }}</p>
                     </div>
                     <div class="text-center">
                        <div class="bg-blue-900 text-white px-4 py-1.5 rounded-lg font-bold text-sm mb-2 uppercase inline-block shadow-sm">Boarding At</div>
                        <p class="text-lg font-bold uppercase mt-1">{{ booking?.train?.from || 'N/A' }}</p>
                        <p class="text-sm">Departure: {{ booking?.train?.departure || 'N/A' }}</p>
                     </div>
                     <div class="text-right">
                        <p class="font-bold text-sm text-slate-500">To</p>
                        <p class="text-lg font-bold uppercase">{{ booking?.train?.to || 'N/A' }}</p>
                        <p class="text-sm">Arrival: {{ booking?.train?.arrival || 'N/A' }}</p>
                     </div>
                </div>
            </div>

            <!-- Train Details Table -->
            <table class="w-full border-collapse border border-slate-400 mb-6 text-sm">
                <tr class="bg-slate-100">
                    <th class="border border-slate-400 p-2 text-left">PNR</th>
                    <th class="border border-slate-400 p-2 text-left">Train No./Name</th>
                    <th class="border border-slate-400 p-2 text-left">Class</th>
                    <th class="border border-slate-400 p-2 text-left">Booking Date</th>
                </tr>
                <tr>
                    <td class="border border-slate-400 p-2 font-bold text-blue-700">{{ booking?.pnr || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2 font-bold">{{ booking?.train?.number || 'N/A' }} / {{ booking?.train?.name || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2 font-bold">{{ booking?.class?.type || booking?.train?.selectedClass || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2">{{ booking?.paymentDetails?.date ? (booking?.paymentDetails?.date | date:'medium') : 'N/A' }}</td>
                </tr>
                 <tr>
                    <td class="border border-slate-400 p-2 font-bold bg-slate-50">Quota</td>
                    <td class="border border-slate-400 p-2" colspan="3">GENERAL (GN)</td>
                </tr>
            </table>

            <!-- Passenger Details -->
            <h3 class="font-bold border-b border-slate-400 mb-2 pb-1">Passenger Details</h3>
            <table class="w-full border-collapse border border-slate-400 mb-6 text-sm">
                 <tr class="bg-slate-100">
                    <th class="border border-slate-400 p-2 text-left">#</th>
                    <th class="border border-slate-400 p-2 text-left">Name</th>
                    <th class="border border-slate-400 p-2 text-center">Age</th>
                    <th class="border border-slate-400 p-2 text-center">Gender</th>
                    <th class="border border-slate-400 p-2 text-left">Booking Status</th>
                    <th class="border border-slate-400 p-2 text-left">Current Status</th>
                </tr>
                <tr *ngFor="let p of booking?.passengers; let i = index">
                    <td class="border border-slate-400 p-2">{{ i + 1 }}</td>
                    <td class="border border-slate-400 p-2 font-bold">{{ p.name || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ p.age || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2 text-center">{{ p.gender || 'N/A' }}</td>
                    <td class="border border-slate-400 p-2 font-bold" [class.text-red-600]="booking?.status === 'Waitlist'" [class.text-green-600]="booking?.status === 'Confirmed'">
                        {{ getPassengerStatus(i, p) }}
                    </td>
                    <td class="border border-slate-400 p-2 font-bold" [class.text-red-600]="booking?.status === 'Waitlist'" [class.text-green-600]="booking?.status === 'Confirmed'">
                        {{ getPassengerStatus(i, p) }}
                    </td>
                </tr>
            </table>

            <!-- Payment & QR -->
            <div class="flex border-t border-slate-400 pt-4">
                <div class="w-2/3 pr-8">
                     <h3 class="font-bold border-b border-slate-400 mb-2 pb-1">Payment Details</h3>
                     <div class="flex justify-between text-sm mb-1">
                        <span>Ticket Fare</span>
                        <span>₹{{ fareBreakdown.base }}</span>
                     </div>
                     <div class="flex justify-between text-sm mb-1">
                        <span>Convenience Fee (incl. GST)</span>
                        <span>₹{{ fareBreakdown.tax }}</span>
                     </div>
                     <div class="flex justify-between font-bold text-base mt-2 pt-2 border-t border-slate-200">
                        <span>Total Fare</span>
                        <span>₹{{ booking?.paymentDetails?.amount || 0 }}</span>
                     </div>
                     <p class="text-xs text-slate-500 mt-2">* PG Charges as applicable (Additional)</p>
                </div>
                <div class="w-1/3 flex flex-col items-center justify-center border-l border-slate-400 pl-4">
                     <!-- QR Code Placeholder -->
                     <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{booking?.pnr || 'N/A'}}" alt="QR Code" class="w-32 h-32 mb-2">
                     <p class="text-[10px] text-center text-slate-500">Scan to verify PNR</p>
                </div>
            </div>

            <!-- Footer Instructions -->
            <div class="mt-8 text-[10px] text-slate-600 border-t-2 border-slate-800 pt-2">
                <p class="mb-1 font-bold">* IR recovers only 57% of cost of travel on an average.</p>
                <div class="grid grid-cols-2 gap-4">
                     <div>
                        <p><strong>Indian Railways GST Details:</strong></p>
                        <p>Invoice Number: PS{{ booking?.pnr || 'N/A' }}</p>
                        <p>Supplier Information: Indian Railways New Delhi</p>
                     </div>
                     <div>
                        <p><strong>Recipient Information:</strong></p>
                        <p>Name: {{ booking?.passengers?.[0]?.name || 'N/A' }}</p>
                        <p>GSTIN: NA</p>
                     </div>
                </div>
                <ul class="list-disc pl-4 mt-4 space-y-1">
                    <li>Prescribed Original ID proof is required while travelling along with SMS/ VRM/ ERS otherwise will be treated as without ticket and penalized.</li>
                    <li>This ticket is booked on a personal User ID, its sale/purchase is an offence.</li>
                    <li>Contact us at care@trainexpress.com for any queries.</li>
                </ul>
            </div>

        </div>
    </div>
  `,
    styles: []
})
export class BookingConfirmationComponent implements OnInit {
    booking: any;
    @ViewChild('ticketContent') ticketElement!: ElementRef;

    constructor(private router: Router, private bookingService: BookingService) {
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.booking = navigation.extras.state['booking'];
        }

        // Redirect if no booking data is available
        if (!this.booking) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        if (!this.booking) {
            this.router.navigate(['/']);
        } else {
            window.history.pushState(null, '', window.location.href);
        }
    }

    @HostListener('window:popstate', ['$event'])
    onPopState(event: any) {
        this.router.navigate(['/']);
    }

    get fareBreakdown() {
        if (!this.booking) return { base: 0, tax: 0 };
        const total = this.booking.paymentDetails.amount;
        const tax = Math.round(total * 0.05); // Approx from Payment logic
        return {
            base: total - tax,
            tax: tax
        };
    }

    downloadTicket() {
        if (!this.booking || !this.booking._id) return;

        this.bookingService.downloadTicket(this.booking._id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ticket-${this.booking.pnr || 'download'}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: (err) => {
                console.error('Download failed', err);
                alert('Failed to download ticket. Please try again.');
            }
        });
    }

    getPassengerStatus(index: number, passenger: any) {
        if (this.booking?.status === 'Waitlist') {
            const availText = this.booking?.class?.availability?.text || '';
            // Match "WL <number>" format
            const match = availText.match(/WL\s*(\d+)/i);

            if (match && match[1]) {
                const baseWL = parseInt(match[1], 10);
                // Increment based on passenger index (0-based) => Base + 1 + index
                const currentWL = baseWL + 1 + index;
                return `WL ${currentWL}`;
            }
            // Fallback if parsing fails
            return `WL/${index + 1}`;
        }
        // Confirmed
        return `CNF/${passenger.coach}/${passenger.seatNumber}/${passenger.berthType}`;
    }
}
