import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../shared/booking.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Select Your Seats</h2>
            <p class="text-slate-500 text-sm mt-1">{{ coachType }} Coach Layout • {{ selectedSeats.length }} / {{ totalPassengers }} Selected</p>
          </div>
          <button (click)="close.emit()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Legend -->
        <div class="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 flex gap-6 text-xs font-bold uppercase tracking-wider justify-center border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border-2 border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-600"></div>
            <span class="text-slate-500">Available</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 cursor-not-allowed"></div>
            <span class="text-slate-400">Booked</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
              <span class="material-symbols-outlined text-[10px]">check</span>
            </div>
            <span class="text-primary">Selected</span>
          </div>
        </div>

        <!-- Seat Map Container -->
        <div class="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900">
          <div class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl p-2 shadow-sm border border-slate-200 dark:border-slate-700 relative">
            
            <!-- Coach Label -->
            <div class="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-slate-300 font-bold text-4xl tracking-widest pointer-events-none opacity-20">
              {{ coachType || 'COACH' }}
            </div>

            <div class="space-y-4">
              <ng-container *ngFor="let row of rows; let i = index">
                <!-- Standard Row -->
                 <div class="flex justify-between gap-8 relative px-4 py-2" [class.border-b]="i < rows.length - 1" [class.border-slate-100]="i < rows.length - 1" [class.dark:border-slate-700]="i < rows.length - 1">
                    
                    <!-- Left Side (Lower, Middle, Upper) -->
                    <div class="grid gap-3" [ngClass]="getLeftGridClass()">
                        <div *ngFor="let seat of row.left" (click)="toggleSeat(seat)"
                            [class.bg-slate-200]="seat.isBooked" [class.dark:bg-slate-700]="seat.isBooked" [class.cursor-not-allowed]="seat.isBooked"
                            [class.bg-primary]="isSelected(seat)" [class.text-white]="isSelected(seat)" [class.border-primary]="isSelected(seat)"
                            [class.bg-white]="!seat.isBooked && !isSelected(seat)" [class.dark:bg-slate-800]="!seat.isBooked && !isSelected(seat)"
                            [class.border-slate-300]="!seat.isBooked && !isSelected(seat)" [class.dark:border-slate-600]="!seat.isBooked && !isSelected(seat)"
                            class="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group relative hover:border-primary hover:text-primary">
                            
                            <span class="text-xs font-bold" [class.text-slate-400]="seat.isBooked">{{ seat.number }}</span>
                            <span class="text-[10px] uppercase" [class.text-slate-400]="seat.isBooked">{{ seat.type | slice:0:1 }}</span>
                            
                            <!-- Tooltip -->
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {{ seat.type }}
                            </div>
                        </div>
                    </div>

                    <!-- Aisle Space -->
                    <div class="w-8 flex items-center justify-center text-slate-300 text-xs tracking-tighter writing-vertical">
                       
                    </div>

                    <!-- Right Side (Side Lower, Side Upper) -->
                    <div class="grid gap-3" [ngClass]="getRightGridClass()">
                         <div *ngFor="let seat of row.right" (click)="toggleSeat(seat)"
                            [class.bg-slate-200]="seat.isBooked" [class.dark:bg-slate-700]="seat.isBooked" [class.cursor-not-allowed]="seat.isBooked"
                            [class.bg-primary]="isSelected(seat)" [class.text-white]="isSelected(seat)" [class.border-primary]="isSelected(seat)"
                            [class.bg-white]="!seat.isBooked && !isSelected(seat)" [class.dark:bg-slate-800]="!seat.isBooked && !isSelected(seat)"
                            [class.border-slate-300]="!seat.isBooked && !isSelected(seat)" [class.dark:border-slate-600]="!seat.isBooked && !isSelected(seat)"
                            class="w-14 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 group relative hover:border-primary hover:text-primary">
                            
                            <span class="text-xs font-bold" [class.text-slate-400]="seat.isBooked">{{ seat.number }}</span>
                            <span class="text-[10px] uppercase" [class.text-slate-400]="seat.isBooked">{{ seat.type | slice:0:2 }}</span>

                             <!-- Tooltip -->
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                {{ seat.type }}
                            </div>
                        </div>
                    </div>

                 </div>
              </ng-container>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
            <div class="text-sm">
                <span class="text-slate-500">Selected:</span>
                <span class="font-bold text-slate-900 dark:text-white ml-2">
                    {{ getSelectedString() || 'None' }}
                </span>
            </div>
            <button (click)="confirmSelection()" 
                [disabled]="selectedSeats.length !== totalPassengers"
                class="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Confirm Seats
            </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .writing-vertical { writing-mode: vertical-rl; text-orientation: mixed; }
  `]
})
export class SeatSelectionComponent implements OnInit {
  @Input() coachType: string = 'SL';
  @Input() totalPassengers: number = 1;
  @Input() availableSeats: number = 0;
  @Input() availabilityStatus: string = 'AVL';
  @Input() trainNumber: string = '';
  @Input() travelDate: string = '';
  @Input() initialSelectedSeats: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<any[]>();

  rows: any[] = [];
  selectedSeats: any[] = [];
  bookedSeatNumbers: number[] = [];

  constructor(private bookingService: BookingService) { }

  ngOnInit() {
    if (this.initialSelectedSeats && this.initialSelectedSeats.length > 0) {
      this.selectedSeats = [...this.initialSelectedSeats];
    }
    if (this.trainNumber && this.travelDate && this.coachType) {
      this.bookingService.getBookedSeats(this.trainNumber, this.travelDate, this.coachType).subscribe({
        next: (seats) => {
          this.bookedSeatNumbers = seats || [];
          this.generateLayout();
        },
        error: (err) => {
          console.error("Failed to fetch booked seats", err);
          this.generateLayout();
        }
      });
    } else {
      this.generateLayout();
    }
  }

  getLeftGridClass() {
    // 1A, 2A = 2 cols. 3A, SL, CC = 3 cols.
    if (this.coachType === '1A' || this.coachType === '2A') return 'grid-cols-2';
    return 'grid-cols-3';
  }

  getRightGridClass() {
    // 1A, CC = 2 cols. Others (Side seats) = 1 col.
    if (this.coachType === '1A' || this.coachType === 'CC' || this.coachType === 'EC') return 'grid-cols-2';
    return 'grid-cols-1';
  }

  generateLayout() {
    this.rows = [];
    const type = this.coachType || 'SL';

    if (type === '1A') {
      this.generateLayout1A();
    } else if (type === '2A') {
      this.generateLayout2A();
    } else if (type === 'CC' || type === 'EC') {
      this.generateLayoutCC();
    } else {
      // Default 3A, SL
      this.generateLayout3A_SL();
    }

    this.applyAvailability();
  }

  generateLayout1A() {
    let seatCounter = 1;
    for (let i = 0; i < 6; i++) { // 6 cabins = 24 seats
      const left = [];
      const right = [];
      left.push({ number: seatCounter++, type: 'Lower' });
      left.push({ number: seatCounter++, type: 'Upper' });
      right.push({ number: seatCounter++, type: 'Lower' });
      right.push({ number: seatCounter++, type: 'Upper' });
      this.rows.push({ left, right });
    }
  }

  generateLayout2A() {
    for (let i = 0; i < 16; i++) { // 16 half-bays = 48 seats
      const base = Math.floor(i / 2) * 6;
      const isFirstHalf = i % 2 === 0;
      const left = [];
      const right = [];
      if (isFirstHalf) {
        left.push({ number: base + 1, type: 'Lower' });
        left.push({ number: base + 2, type: 'Upper' });
        right.push({ number: base + 5, type: 'Side Lower' });
      } else {
        left.push({ number: base + 3, type: 'Lower' });
        left.push({ number: base + 4, type: 'Upper' });
        right.push({ number: base + 6, type: 'Side Upper' });
      }
      this.rows.push({ left, right });
    }
  }

  generateLayout3A_SL() {
    for (let i = 0; i < 18; i++) { // 18 half-bays = 72 seats
      const base = Math.floor(i / 2) * 8;
      const isFirstHalf = i % 2 === 0;
      const left = [];
      const right = [];
      if (isFirstHalf) {
        left.push({ number: base + 1, type: 'Lower' });
        left.push({ number: base + 2, type: 'Middle' });
        left.push({ number: base + 3, type: 'Upper' });
        right.push({ number: base + 7, type: 'Side Lower' });
      } else {
        left.push({ number: base + 4, type: 'Lower' });
        left.push({ number: base + 5, type: 'Middle' });
        left.push({ number: base + 6, type: 'Upper' });
        right.push({ number: base + 8, type: 'Side Upper' });
      }
      this.rows.push({ left, right });
    }
  }

  generateLayoutCC() {
    let seatCounter = 1;
    for (let i = 0; i < 15; i++) { // 15 rows = 75 seats
      const left = [];
      const right = [];
      left.push({ number: seatCounter++, type: 'Window' });
      left.push({ number: seatCounter++, type: 'Middle' });
      left.push({ number: seatCounter++, type: 'Aisle' });
      right.push({ number: seatCounter++, type: 'Aisle' });
      right.push({ number: seatCounter++, type: 'Window' });
      this.rows.push({ left, right });
    }
  }

  applyAvailability() {
    const allSeats: any[] = [];
    this.rows.forEach(r => {
      allSeats.push(...r.left, ...r.right);
    });

    const totalSeats = allSeats.length;
    let availableCountToDisplay = this.availabilityStatus === 'AVL' ? this.availableSeats : 0;

    if (availableCountToDisplay >= totalSeats) {
      // Cap to show at least some booked seats for realism
      availableCountToDisplay = Math.floor(totalSeats * 0.7);
    } else if (availableCountToDisplay < 0) {
      availableCountToDisplay = 0;
    }

    const targetBookedCount = totalSeats - availableCountToDisplay;

    // 1. Mark actual booked seats from the backend
    const actualBookedIndices = new Set<number>();
    allSeats.forEach((seat, index) => {
      if (this.bookedSeatNumbers.includes(seat.number)) {
        actualBookedIndices.add(index);
      }
    });

    // 2. We need to fake more booked seats to match the availability count
    let remainingToFalsify = targetBookedCount - actualBookedIndices.size;
    if (remainingToFalsify < 0) remainingToFalsify = 0;

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let seed = 123456;
    // Get indices of seats that are NOT actual booked seats
    const availableIndices = Array.from({ length: totalSeats }, (_, i) => i).filter(i => !actualBookedIndices.has(i));

    // Fisher-Yates shuffle the available indices
    for (let i = availableIndices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seed++) * (i + 1));
      [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
    }

    const fakeBookedIndices = new Set(availableIndices.slice(0, remainingToFalsify));

    allSeats.forEach((seat, index) => {
      seat.isBooked = actualBookedIndices.has(index) || fakeBookedIndices.has(index);
    });
  }

  toggleSeat(seat: any) {
    if (seat.isBooked) return;

    const index = this.selectedSeats.findIndex(s => s.number === seat.number);
    if (index >= 0) {
      this.selectedSeats.splice(index, 1);
    } else {
      if (this.selectedSeats.length >= this.totalPassengers) {
        this.selectedSeats.shift(); // Remove oldest
      }
      this.selectedSeats.push(seat);
    }
  }

  isSelected(seat: any): boolean {
    return this.selectedSeats.some(s => s.number === seat.number);
  }

  getSelectedString() {
    return this.selectedSeats.map(s => `${s.number} (${s.type})`).join(', ');
  }

  confirmSelection() {
    this.confirm.emit(this.selectedSeats);
  }
}
