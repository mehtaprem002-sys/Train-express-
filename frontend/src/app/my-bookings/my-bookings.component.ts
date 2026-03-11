import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../shared/booking.service';
import { AuthService } from '../shared/auth.service';

@Component({
    selector: 'app-my-bookings',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div [ngClass]="{'min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8': !embedded}">
      <div [ngClass]="{'max-w-4xl mx-auto': !embedded}">
        <h1 *ngIf="!embedded" class="text-3xl font-bold text-slate-900 dark:text-white mb-8">My Bookings</h1>
        <h2 *ngIf="embedded" class="text-xl font-bold text-slate-900 dark:text-white mb-6 mt-8">Recent Bookings</h2>

        <div *ngIf="bookings.length === 0" class="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">confirmation_number</span>
            <p class="text-slate-500 text-sm mb-4">No bookings found</p>
            <a routerLink="/" class="text-primary font-bold hover:underline text-sm">Book your first ticket</a>
        </div>

        <div class="space-y-4">
            <div *ngFor="let booking of bookings" class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                <div class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">PNR Number</p>
                        <p class="text-xl font-mono font-bold text-primary">{{ booking.pnr }}</p>
                    </div>
                    <div class="text-right">
                         <span class="inline-block px-3 py-1 rounded-full text-xs font-bold" 
                            [ngClass]="booking.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'">
                             {{ booking.status }}
                         </span>
                         <p class="text-xs text-slate-400 mt-1">{{ booking.paymentDetails.date | date:'mediumDate' }}</p>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                             <p class="text-lg font-bold text-slate-900 dark:text-white">{{ booking.train.from }}</p>
                             <span class="material-symbols-outlined text-slate-300">arrow_forward</span>
                             <p class="text-lg font-bold text-slate-900 dark:text-white">{{ booking.train.to }}</p>
                        </div>
                        <p class="text-sm text-slate-500">{{ booking.train.name }} ({{ booking.train.number }})</p>
                        <p class="text-sm text-slate-500">{{ booking.train.departure }} - {{ booking.train.arrival }}</p>
                    </div>
                    <div class="text-right flex flex-col items-end gap-2">
                        <p class="text-sm text-slate-500 mb-1">{{ booking.passengers.length }} Passenger(s)</p>
                        <p class="text-xl font-bold text-slate-900 dark:text-white">₹{{ booking.paymentDetails.amount }}</p>
                        
                        <div class="flex gap-2">
                             <button (click)="downloadTicket(booking)" 
                                class="text-primary hover:text-primary-dark text-sm font-bold border border-primary/20 hover:bg-primary/5 dark:border-primary/50 dark:hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">download</span> Ticket
                            </button>

                            <button *ngIf="booking.status !== 'Cancelled'" (click)="initiateCancel(booking)" 
                                class="text-red-500 hover:text-red-700 text-sm font-bold border border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">cancel</span> Cancel
                            </button>

                            <button *ngIf="booking.status === 'Cancelled'" (click)="removeBooking(booking)" 
                                class="text-slate-500 hover:text-red-600 text-sm font-bold border border-slate-200 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">delete</span> Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Custom Cancellation Modal -->
        <div *ngIf="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-outlined text-3xl">warning</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancel Booking?</h3>
                    <p class="text-slate-500 text-sm">
                        Are you sure you want to cancel PNR <strong>{{ selectedBooking?.pnr }}</strong>?
                    </p>
                </div>

                <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-slate-500">Booking Amount</span>
                        <span class="font-bold text-slate-900 dark:text-white">₹{{ selectedBooking?.paymentDetails?.amount | number:'1.0-0' }}</span>
                    </div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-red-500">Cancellation Fee (20%)</span>
                        <span class="font-bold text-red-500">- ₹{{ (selectedBooking?.paymentDetails?.amount - refundAmount) | number:'1.0-0' }}</span>
                    </div>
                    <div class="border-t border-slate-200 dark:border-slate-700 my-2"></div>
                    <div class="flex justify-between text-base font-bold">
                        <span class="text-slate-700 dark:text-slate-300">Refundable Amount</span>
                        <span class="text-green-600">₹{{ refundAmount | number:'1.0-0' }}</span>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button (click)="closeModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        No, Keep it
                    </button>
                    <button (click)="confirmCancel()" class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform active:scale-95">
                        Yes, Cancel
                    </button>
                </div>
            </div>
        </div>

        <!-- Custom Delete Modal -->
        <div *ngIf="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-outlined text-3xl">delete_forever</span>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Remove Record?</h3>
                    <p class="text-slate-500 text-sm">
                        Are you sure you want to permanently remove PNR <strong>{{ selectedBooking?.pnr }}</strong> from your history?
                    </p>
                    <p class="text-red-500 text-xs font-bold mt-2">This action cannot be undone.</p>
                </div>

                <div class="flex gap-3">
                    <button (click)="closeDeleteModal()" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button (click)="confirmDelete()" class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all transform active:scale-95">
                        Yes, Remove
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  `,
    styles: [`:host { display: block; }`]
})
export class MyBookingsComponent implements OnInit {
    @Input() embedded = false;
    bookings: any[] = [];
    isLoading = true;

    showCancelModal = false;
    showDeleteModal = false;
    selectedBooking: any = null;
    refundAmount = 0;

    constructor(
        private bookingService: BookingService,
        private authService: AuthService
    ) { }

    initiateCancel(booking: any) {
        this.selectedBooking = booking;
        this.refundAmount = Math.round(booking.paymentDetails.amount * 0.8);
        this.showCancelModal = true;
    }

    closeModal() {
        this.showCancelModal = false;
        this.selectedBooking = null;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.selectedBooking = null;
    }

    confirmCancel() {
        if (!this.selectedBooking) return;

        // Update booking state on backend
        this.bookingService.cancelBooking(this.selectedBooking.id).subscribe({
            next: (res) => {
                // Instead of removing, we update the local booking status
                const booking = this.bookings.find(b => b.id === this.selectedBooking.id);
                if (booking) {
                    booking.status = 'Cancelled';
                }
                this.closeModal();
            },
            error: (err) => {
                console.error('Cancellation failed', err);
                this.closeModal();
            }
        });
    }

    removeBooking(booking: any) {
        this.selectedBooking = booking;
        this.showDeleteModal = true;
    }

    confirmDelete() {
        if (!this.selectedBooking) return;

        this.bookingService.deleteBooking(this.selectedBooking.id || this.selectedBooking._id).subscribe({
            next: () => {
                this.bookings = this.bookings.filter(b => (b.id || b._id) !== (this.selectedBooking.id || this.selectedBooking._id));
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Failed to remove booking', err);
                alert('Could not remove booking. Please try again.');
                this.closeDeleteModal();
            }
        });
    }

    downloadTicket(booking: any) {
        this.bookingService.downloadTicket(booking.id).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Ticket_${booking.pnr}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                console.error('Download failed', err);
                alert('Failed to download ticket. Please try again.');
            }
        });
    }

    loadBookings() {
        this.isLoading = true;
        const user = this.authService.currentUser();
        if (user && user.id) {
            this.bookingService.getUserBookings(user.id).subscribe({
                next: (data) => {
                    // Do not filter out cancelled bookings so user can see history
                    this.bookings = data;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Failed to fetch bookings', err);
                    this.isLoading = false;
                }
            });
        }
    }

    ngOnInit() {
        this.loadBookings();
    }
}
