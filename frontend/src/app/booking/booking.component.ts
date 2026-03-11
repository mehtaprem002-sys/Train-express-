import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { Location } from '@angular/common';
import { SeatSelectionComponent } from './seat-selection/seat-selection.component';
// import { BookingService } from '../shared/booking.service'; // To be implemented/mocked

@Component({
    selector: 'app-booking',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, SeatSelectionComponent],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      <!-- Stepper Header -->
      <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Step 3 of 4</p>
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Passenger Information</h1>
                    </div>
                    <div class="hidden sm:block text-slate-500 text-sm font-medium">{{ selectedSeats.length > 0 ? '75% Complete' : '35% Complete' }}</div>
                </div>
                <!-- Progress Bar -->
                <div class="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full shadow-lg shadow-primary/20 transition-all duration-500 ease-out" [style.width]="selectedSeats.length > 0 ? '70%' : '35%'"></div>
                </div>
                
                <!-- Steps Text -->
                <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <div class="flex items-center gap-1 text-primary"><span class="material-symbols-outlined text-sm">check_circle</span> Search</div>
                    
                    <div class="flex items-center gap-1" [ngClass]="{'text-primary': selectedSeats.length > 0, 'text-slate-400': selectedSeats.length === 0}">
                        <span class="material-symbols-outlined text-sm">{{ selectedSeats.length > 0 ? 'check_circle' : 'radio_button_unchecked' }}</span> 
                        Seats
                    </div>

                    <div class="flex items-center gap-1 text-primary"><span class="material-symbols-outlined text-sm">radio_button_checked</span> Passenger</div>
                    <div class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">radio_button_unchecked</span> Payment</div>
                </div>
            </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Forms -->
        <div class="lg:col-span-2 space-y-6">
            
            <!-- Seat Selection Card (Compact) -->
             <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-all" (click)="showSeatMap.set(true)">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-2xl">event_seat</span>
                    </div>
                    <div>
                        <h2 class="font-bold text-slate-900 dark:text-white text-lg">Seat Selection</h2>
                        <p class="text-slate-500 text-sm" *ngIf="selectedSeats.length === 0">Choose your preferred seats <span class="text-red-500 font-bold">*</span></p>
                        <div *ngIf="selectedSeats.length > 0" class="flex flex-wrap gap-2 mt-1">
                            <span *ngFor="let seat of selectedSeats" class="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {{ seat.number }} ({{ seat.type }})
                            </span>
                        </div>
                    </div>
                </div>
                 <button type="button" class="text-primary font-bold text-sm hover:underline">
                    {{ selectedSeats.length > 0 ? 'Change' : 'Select' }}
                </button>
            </div>
            <app-seat-selection *ngIf="showSeatMap() && selectedClass" 
                [coachType]="selectedClass.type || 'SL'"
                [totalPassengers]="passengers.length"
                [availableSeats]="selectedClass.availability?.count || 0"
                [availabilityStatus]="selectedClass.availability?.status || 'AVL'"
                [trainNumber]="train?.number"
                [travelDate]="travelDate"
                (close)="showSeatMap.set(false)"
                (confirm)="onSeatsConfirmed($event)">
            </app-seat-selection>

            <!-- Passenger Forms -->
            <form [formGroup]="bookingForm" (ngSubmit)="confirmBooking()" class="space-y-6">
                <div formArrayName="passengers" class="space-y-6">
                    <div *ngFor="let passenger of passengers.controls; let i=index" [formGroupName]="i" 
                        class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
                        
                        <!-- Header -->
                        <div class="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <span class="material-symbols-outlined text-slate-400">person</span>
                                <h3 class="font-bold text-slate-900 dark:text-white">Passenger {{ i + 1 }}</h3>
                                <span *ngIf="i === 0" class="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Primary</span>
                            </div>
                            <button *ngIf="passengers.length > 1" (click)="removePassenger(i)" type="button" class="text-slate-400 hover:text-red-500 transition-colors">
                                <span class="material-symbols-outlined">delete</span>
                            </button>
                        </div>

                        <!-- Body -->
                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Name -->
                            <div class="col-span-2">
                                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                <input formControlName="name" type="text" 
                                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                <div *ngIf="passenger.get('name')?.invalid && passenger.get('name')?.touched" class="text-red-500 text-xs mt-1 font-medium">Name is required</div>
                            </div>

                            <!-- Age -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Age</label>
                                <input formControlName="age" type="number" 
                                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                <div *ngIf="passenger.get('age')?.invalid && passenger.get('age')?.touched" class="text-red-500 text-xs mt-1 font-medium">Valid age required</div>
                            </div>

                            <!-- Gender -->
                            <div>
                                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                                <div class="relative">
                                    <select formControlName="gender" style="-webkit-appearance: none; -moz-appearance: none; appearance: none; background: none;"
                                        class="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <span class="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                            
                            <!-- Preference -->
                            <div class="col-span-2">
                                 <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Berth Preference</label>
                                 <div class="relative">
                                    <select formControlName="preference" style="-webkit-appearance: none; -moz-appearance: none; appearance: none; background: none;"
                                        class="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium">
                                        <option value="No Preference">No Preference</option>
                                        <option value="Window Side">Window Side</option>
                                    </select>
                                    <span class="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Passenger Button -->
                <button type="button" (click)="addPassenger()" [disabled]="passengers.length >= 5"
                    class="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group">
                    <span class="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                    Add Another Passenger
                </button>

                <!-- Contact Info (Static for now) -->
                <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 class="font-bold text-slate-900 dark:text-white mb-4">Contact Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                             <input type="text" [value]="currentUser?.email" disabled class="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed">
                        </div>
                        <div>
                             <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                             <input type="text" value="+91 XXXXX XXXXX" disabled class="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed">
                        </div>
                    </div>
                     <div class="mt-4 flex items-center gap-2 text-slate-500 text-sm">
                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                        Ticket details will be sent to this email
                    </div>
                </div>

            </form>
        </div>

        <!-- Right Column: Sidebar -->
        <div class="lg:col-span-1">
            <div class="sticky top-32 space-y-6">
                <!-- Journey Summary Card -->
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div class="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Journey Summary</h3>
                        
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">From</p>
                                <p class="text-xl font-bold text-slate-900 dark:text-white">{{ train?.from }}</p>
                                <p class="text-sm text-slate-500">{{ train?.departure }}</p>
                            </div>
                            <span class="material-symbols-outlined text-slate-300 mt-2">arrow_forward</span>
                            <div class="text-right">
                                <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">To</p>
                                <p class="text-xl font-bold text-slate-900 dark:text-white">{{ train?.to }}</p>
                                <p class="text-sm text-slate-500">{{ train?.arrival }}</p>
                            </div>
                        </div>

                        <div class="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                <span class="material-symbols-outlined">train</span>
                            </div>
                            <div>
                                <p class="font-bold text-slate-900 dark:text-white text-sm">{{ train?.number }} • {{ train?.name }}</p>
                                <p class="text-xs text-slate-500">{{ travelDate | date:'mediumDate' }} • {{ selectedClass?.type }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="p-6 bg-slate-50/50 dark:bg-slate-800">
                         <div class="space-y-3 text-sm">
                            <div class="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Base Fare ({{ passengers.length }} X ₹{{ selectedClass?.price }})</span>
                                <span class="font-medium text-slate-900 dark:text-white">₹{{ baseFare }}</span>
                            </div>
                             <div class="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Tax & Fees</span>
                                <span class="font-medium text-slate-900 dark:text-white">₹11.80</span>
                            </div>
                            <div class="flex justify-between text-green-600 font-bold" *ngIf="false">
                                <span>Seat Selection</span>
                                <span>Free</span>
                            </div>
                            
                            <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end mt-4">
                                <div>
                                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total Amount</p>
                                    <p class="text-3xl font-bold text-slate-900 dark:text-white">₹{{ totalAmount }}</p>
                                </div>
                                <span class="text-[10px] text-slate-400 mb-1">Incl. all taxes</span>
                            </div>
                         </div>
                    </div>
                    
                    <div class="p-4 bg-slate-100 dark:bg-slate-900/80 text-[10px] text-slate-500 flex gap-2 leading-tight">
                        <span class="material-symbols-outlined text-sm">info</span>
                        Refundable up to 24 hours before departure. Terms and conditions apply.
                    </div>
                </div>

                <!-- Action Button in Sidebar for desktop -->
                <div class="hidden lg:block">
                     <button type="button" (click)="confirmBooking()" [disabled]="bookingForm.invalid || selectedSeats.length !== passengers.length"
                        class="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                        Continue to Payment
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Action Button (Fixed Bottom) -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 z-40 flex items-center justify-between shadow-2xl">
            <div>
                 <p class="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</p>
                 <p class="text-xl font-bold text-slate-900 dark:text-white">₹{{ totalAmount }}</p>
            </div>
            <button type="button" (click)="confirmBooking()" [disabled]="bookingForm.invalid || selectedSeats.length !== passengers.length"
                class="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                Continue
                <span class="material-symbols-outlined">arrow_forward</span>
            </button>
        </div>

      </div>
    </div>
    `,
    styles: [`:host { display: block; }`]
})
export class BookingComponent implements OnInit {
    bookingForm: FormGroup;
    train: any;
    selectedClass: any;
    travelDate: string = '';

    showSeatMap = signal<boolean>(false);
    selectedSeats: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService,
        private location: Location
    ) {
        this.bookingForm = this.fb.group({
            passengers: this.fb.array([])
        });

        // Get train data from state
        const navigation = this.router.getCurrentNavigation();
        if (navigation?.extras?.state) {
            this.train = navigation.extras.state['train'];
            this.selectedClass = navigation.extras.state['selectedClass'];
            this.travelDate = navigation.extras.state['travelDate'];

            if (navigation.extras.state['passengers']) {
                navigation.extras.state['passengers'].forEach((p: any) => this.addPassenger(p));
            } else {
                this.addPassenger();
                // If it's a fresh navigation from search results, clear any previously saved seats
                sessionStorage.removeItem('selectedSeats');
            }

            // Save basic booking context to session storage for reloads
            sessionStorage.setItem('currentBookingTrain', JSON.stringify(this.train));
            sessionStorage.setItem('currentBookingClass', JSON.stringify(this.selectedClass));
            sessionStorage.setItem('currentBookingDate', this.travelDate);
        } else {
            // Restore from session storage if state is missing (e.g. on reload)
            const savedTrain = sessionStorage.getItem('currentBookingTrain');
            const savedClass = sessionStorage.getItem('currentBookingClass');
            const savedDate = sessionStorage.getItem('currentBookingDate');

            if (savedTrain && savedClass && savedDate) {
                this.train = JSON.parse(savedTrain);
                this.selectedClass = JSON.parse(savedClass);
                this.travelDate = savedDate;
            }
            this.addPassenger();
        }

        // Restore selected seats if they exist in session storage
        const savedSeats = sessionStorage.getItem('selectedSeats');
        if (savedSeats) {
            try {
                this.selectedSeats = JSON.parse(savedSeats);
            } catch (e) {
                console.error("Error parsing saved seats", e);
            }
        }
    }

    ngOnInit() {
        if (!this.train) {
            // Validate logic
            const trainId = this.route.snapshot.paramMap.get('trainId');
            if (!trainId) {
                this.router.navigate(['/']);
            }
        }

        // Auth Check
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
        }
    }

    get passengers() {
        return this.bookingForm.get('passengers') as FormArray;
    }

    get currentUser() {
        return this.authService.currentUser();
    }

    get baseFare() {
        if (!this.selectedClass) return 0;
        let total = 0;
        this.passengers.controls.forEach(control => {
            const age = control.get('age')?.value;
            // Matches Payment Logic
            if (age && age < 15) {
                total += this.selectedClass.price * 0.5;
            } else {
                total += this.selectedClass.price;
            }
        });
        return total;
    }

    get totalAmount() {
        const tax = 11.80; // Fixed fee
        return this.baseFare + tax;
    }

    addPassenger(data?: any) {
        if (this.passengers.length >= 5) {
            alert('Maximum 5 passengers allowed per booking.');
            return;
        }
        const passengerForm = this.fb.group({
            name: [data ? data.name : '', [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)]],
            age: [data ? data.age : '', [Validators.required, Validators.min(1), Validators.max(99)]],
            gender: [data ? data.gender : '', Validators.required],
            preference: [data ? data.preference : 'No Preference']
        });

        // Business Logic Subscription
        passengerForm.get('age')?.valueChanges.subscribe(age => {
            if (age && Number(age) > 50) {
                passengerForm.patchValue({ preference: 'Window Side' }, { emitEvent: false });
            }
        });

        this.passengers.push(passengerForm);
    }

    removePassenger(index: number) {
        this.passengers.removeAt(index);
    }

    goBack() {
        this.router.navigate(['/search-results'], {
            queryParams: {
                from: this.train?.from,
                to: this.train?.to,
                date: this.travelDate
            }
        });
    }

    confirmBooking() {
        if (this.bookingForm.valid && this.selectedSeats.length === this.passengers.length) {
            const bookingData = {
                train: this.train,
                class: this.selectedClass,
                passengers: this.bookingForm.value.passengers,
                user: this.authService.currentUser() || {},
                date: this.travelDate,
                selectedSeats: this.selectedSeats
            };

            this.router.navigate(['/payment'], {
                state: { bookingData: bookingData }
            });
        } else {
            this.bookingForm.markAllAsTouched();
            if (this.selectedSeats.length !== this.passengers.length) {
                alert('Please select seats for all passengers before proceeding.');
            }
        }
    }

    onSeatsConfirmed(seats: any[]) {
        this.selectedSeats = seats;
        sessionStorage.setItem('selectedSeats', JSON.stringify(seats));
        this.showSeatMap.set(false);
    }
}


