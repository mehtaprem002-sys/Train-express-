import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from '../shared/api-config';
import { NotificationService } from '../shared/notification.service';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
             <div>
                <h2 class="text-3xl font-bold text-slate-800 dark:text-white">All Bookings</h2>
                <p class="text-slate-500 mt-1">Review all customer reservations and history.</p>
             </div>
             <button (click)="loadBookings()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-all" title="Refresh Bookings">
                <span class="material-symbols-outlined">refresh</span>
             </button>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table class="w-full text-left text-sm">
                 <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th class="px-6 py-4">Booking ID / PNR</th>
                         <th class="px-6 py-4">Customer</th>
                         <th class="px-6 py-4">Route Details</th>
                         <th class="px-6 py-4">Date</th>
                         <th class="px-6 py-4">Amount</th>
                         <th class="px-6 py-4">Status</th>
                         <th class="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                     <tr *ngIf="bookings.length === 0">
                        <td colspan="7" class="px-6 py-10 text-center text-slate-400 italic">No bookings found in the records.</td>
                     </tr>
                     <tr *ngFor="let b of bookings" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td class="px-6 py-4">
                            <p class="font-bold text-slate-900 dark:text-white">{{ b.pnr }}</p>
                            <p class="text-xs text-slate-400 font-mono">{{ b.id || b._id }}</p>
                         </td>
                         <td class="px-6 py-4">
                            <p class="font-medium text-slate-900 dark:text-white">{{ b.user?.name || 'Guest' }}</p>
                            <p class="text-xs text-slate-400">{{ b.user?.email }}</p>
                         </td>
                         <td class="px-6 py-4">
                            <p class="font-bold text-slate-700 dark:text-slate-200">{{ b.train?.name }}</p>
                            <p class="text-xs text-slate-500">{{ b.train?.from }} → {{ b.train?.to || b.to }}</p>
                         </td>
                         <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                             <div>
                                <p class="font-bold">{{ b.travelDate | date:'mediumDate' }}</p>
                                <p class="text-xs mt-1">{{ b.passengers?.length || 0 }} Passenger(s)</p>
                                <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-1">
                                    <span *ngFor="let p of b.passengers" class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                        {{ p.coach || '?' }}/{{ p.seatNumber || '?' }}
                                    </span>
                                </div>
                             </div>
                         </td>
                         <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">
                             ₹{{ b.paymentDetails?.amount | number }}
                         </td>
                         <td class="px-6 py-4">
                             <div class="flex flex-col items-start gap-1.5">
                                 <!-- Non-Waitlist Status Badge -->
                                 <span *ngIf="b.status !== 'Waitlist' && b.status !== 'Waitlisted'" 
                                       [ngClass]="b.status === 'Confirmed' || b.status === 'CNF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" 
                                       class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                     {{ b.status || 'Confirmed' }}
                                 </span>
                                 
                                 <!-- Waitlist Dropdown Badge -->
                                 <div *ngIf="b.status === 'Waitlist' || b.status === 'Waitlisted'" class="relative inline-block">
                                     <select (change)="onWaitlistAction($event, b.id || b._id)" 
                                             class="appearance-none bg-yellow-100 text-yellow-700 pl-2 pr-6 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer transition-colors hover:bg-yellow-200 shadow-sm border border-yellow-200/50">
                                         <option value="WAITLIST" disabled selected>Waitlist</option>
                                         <option value="CONFIRM" class="font-bold bg-white text-green-600">✓ Confirm Ticket</option>
                                     </select>
                                     <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 text-yellow-700">
                                         <span class="material-symbols-outlined" style="font-size: 16px;">arrow_drop_down</span>
                                     </div>
                                 </div>
                             </div>
                         </td>
                         <td class="px-6 py-4 text-right">
                            <button *ngIf="b.status !== 'Cancelled'" (click)="cancelBooking(b.id || b._id)" 
                                class="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors">
                                Cancel
                            </button>
                             <button *ngIf="b.status === 'Cancelled'" (click)="deleteBooking(b.id || b._id)" 
                                 class="px-3 py-1 bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-lg text-xs font-bold transition-colors">
                                 Delete Record
                             </button>
                         </td>
                     </tr>
                 </tbody>
             </table>
        </div>
    </div>
  `
})
export class AdminBookingsComponent implements OnInit {
    bookings: any[] = [];

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfig,
        private notification: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadBookings();
    }

    private getHeaders() {
        const headers: any = {};
        if (typeof localStorage !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return { headers };
    }

    loadBookings() {
        this.http.get<any[]>(`${this.apiConfig.apiUrl}/bookings/all`, this.getHeaders()).subscribe({
            next: (data) => {
                this.bookings = data.map(b => ({
                    ...b,
                    travelDate: b.date || b.travelDate
                }));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load bookings', err);
                if (err.status === 401) {
                    this.notification.showError('Session expired. Please login again.');
                }
            }
        });
    }

    async cancelBooking(bookingId: string) {
        const confirmed = await this.notification.confirm('Are you sure you want to cancel this booking? This will refund the amount based on policy.');
        if (!confirmed) return;

        this.http.post(`${this.apiConfig.apiUrl}/bookings/cancel/${bookingId}`, {}, this.getHeaders()).subscribe({
            next: () => {
                this.notification.showSuccess('Booking cancelled successfully');
                this.loadBookings();
            },
            error: (err) => this.notification.showError('Failed to cancel booking')
        });
    }

    async deleteBooking(bookingId: string) {
        const confirmed = await this.notification.confirm('Are you sure you want to permanently delete this cancelled booking record? This action cannot be undone.');
        if (!confirmed) return;

        this.http.delete(`${this.apiConfig.apiUrl}/bookings/admin/${bookingId}`, this.getHeaders()).subscribe({
            next: () => {
                this.notification.showSuccess('Booking record permanently removed');
                this.loadBookings();
            },
            error: (err) => {
                console.error('Failed to delete booking record', err);
                this.notification.showError('Failed to delete booking record');
            }
        });
    }

    onWaitlistAction(event: Event, bookingId: string) {
        const selectElement = event.target as HTMLSelectElement;
        if (selectElement.value === 'CONFIRM') {
            this.confirmWaitlistBooking(bookingId).finally(() => {
                // Reset dropdown visually to Waitlist in case the user cancelled the prompt
                selectElement.value = 'WAITLIST';
            });
        }
    }

    async confirmWaitlistBooking(bookingId: string) {
        const confirmed = await this.notification.confirm('Are you sure you want to forcibly confirm this waitlisted ticket? This will bypass availability checks and allocate seats.');
        if (!confirmed) return;

        this.http.post(`${this.apiConfig.apiUrl}/bookings/admin/confirm-wl/${bookingId}`, {}, this.getHeaders()).subscribe({
            next: () => {
                this.notification.showSuccess('Waitlist ticket confirmed successfully');
                this.loadBookings();
            },
            error: (err) => {
                console.error('Failed to confirm waitlist ticket', err);
                this.notification.showError('Failed to confirm waitlist ticket');
            }
        });
    }
}
