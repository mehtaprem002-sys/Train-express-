import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../shared/booking.service';
import { TrainService } from '../shared/train.service';

@Component({
    selector: 'app-pnr-status',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12 pt-24">
    <!-- Header -->
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Check Train Status</h1>
            <p class="text-slate-500 dark:text-slate-400">Get PNR status or track your train's live position</p>
        </div>

        <!-- Tabs -->
        <div class="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-8 max-w-md mx-auto">
            <button (click)="activeTab = 'pnr'" 
                [class.bg-white]="activeTab === 'pnr'"
                [class.dark:bg-slate-700]="activeTab === 'pnr'"
                [class.shadow-md]="activeTab === 'pnr'"
                [class.text-primary]="activeTab === 'pnr'"
                class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-500 dark:text-slate-400">
                PNR Status
            </button>
            <button (click)="activeTab = 'live'" 
                [class.bg-white]="activeTab === 'live'"
                [class.dark:bg-slate-700]="activeTab === 'live'"
                [class.shadow-md]="activeTab === 'live'"
                [class.text-primary]="activeTab === 'live'"
                class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all text-slate-500 dark:text-slate-400">
                Live Status
            </button>
        </div>

        <!-- PNR Search Card -->
        <div *ngIf="activeTab === 'pnr'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <form (ngSubmit)="checkStatus()" class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-slate-400">confirmation_number</span>
                    </div>
                    <input [(ngModel)]="pnrNumber" name="pnrNumber" 
                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                        placeholder="Enter 10-digit PNR Number" 
                        type="text">
                </div>
                <button [disabled]="!pnrNumber || loading" type="submit" 
                    class="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[160px]">
                    <span *ngIf="loading && !liveStatus" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span *ngIf="!loading || liveStatus">Get PNR Status</span>
                </button>
            </form>
        </div>

        <!-- Live Status Search Card -->
        <div *ngIf="activeTab === 'live'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <form (ngSubmit)="checkLiveStatus()" class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-slate-400">train</span>
                    </div>
                    <input [(ngModel)]="trainNumber" name="trainNumber" 
                        class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
                        placeholder="Enter Train Number (e.g. 12951)" 
                        type="text">
                </div>
                <button [disabled]="!trainNumber || loading" type="submit" 
                    class="bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[160px]">
                    <span *ngIf="loading && !pnrStatus" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span *ngIf="!loading || pnrStatus">Check Live Status</span>
                </button>
            </form>
        </div>

        <!-- Error Message -->
         <div *ngIf="errorMessage" class="mt-8 animate-fade-in text-center p-4 bg-red-100 text-red-700 rounded-xl">
            <p>{{ errorMessage }}</p>
        </div>

        <!-- PNR Result Card -->
        <div *ngIf="pnrStatus && activeTab === 'pnr'" class="mt-8 animate-fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <!-- Status Header -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <p class="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">PNR Number</p>
                        <p class="text-2xl font-bold tracking-widest">{{ pnrStatus.pnr }}</p>
                    </div>
                    <div class="text-right">
                        <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span class="text-sm font-bold">{{ pnrStatus.status }}</span>
                        </div>
                    </div>
                </div>

                <!-- Train Details -->
                <div class="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ pnrStatus.trainName }}</h3>
                            <p class="text-slate-500 text-sm">Train No: {{ pnrStatus.trainNo }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-slate-900 dark:text-white font-bold">{{ pnrStatus.date }}</p>
                            <p class="text-slate-500 text-sm">Journey Date</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-8 relative">
                        <div class="flex-1">
                            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ pnrStatus.departureTime }}</p>
                            <p class="text-slate-500 text-sm font-medium">{{ pnrStatus.from }}</p>
                        </div>
                        <div class="flex flex-col items-center px-4">
                            <span class="material-symbols-outlined text-slate-300">arrow_forward</span>
                            <p class="text-xs text-slate-400 mt-1">{{ pnrStatus.duration }}</p>
                        </div>
                        <div class="flex-1 text-right">
                            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ pnrStatus.arrivalTime }}</p>
                            <p class="text-slate-500 text-sm font-medium">{{ pnrStatus.to }}</p>
                        </div>
                    </div>
                </div>

                <!-- Passengers -->
                <div class="p-6">
                    <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Passenger Details</h4>
                    <div class="space-y-3">
                        <div *ngFor="let pass of pnrStatus.passengers" class="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300">
                                    <span class="material-symbols-outlined text-sm">person</span>
                                </div>
                                <span class="font-bold text-slate-700 dark:text-slate-300">{{ pass.name }}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <span class="text-sm text-slate-500">Coach: <span class="font-bold text-slate-700 dark:text-slate-300">{{ pass.coach }}</span></span>
                                <span class="text-sm text-slate-500">Berth: <span class="font-bold text-slate-700 dark:text-slate-300">{{ pass.berth }}</span></span>
                                <span class="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">{{ pass.status }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Live Status Results (Timeline) -->
<div *ngIf="liveStatus && activeTab === 'live'" class="mt-8 animate-fade-in max-w-4xl mx-auto">
    <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <!-- Premium Header -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 p-12 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            
            <div class="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div class="flex items-center gap-2 mb-3">
                        <span class="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border border-emerald-500/30">Live Tracking</span>
                        <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>
                    <h3 class="text-3xl font-black tracking-tight mb-1">{{ liveStatus.trainName }}</h3>
                    <p class="text-slate-400 font-mono text-lg font-bold">{{ liveStatus.trainNumber }}</p>
                </div>
                
                <div class="flex flex-col items-end">
                    <div class="text-right bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                        <p class="text-slate-400 text-xs font-bold uppercase mb-1">Current Status</p>
                        <p class="text-2xl font-black tracking-wide" [ngClass]="liveStatus.delay > 0 ? 'text-orange-400' : 'text-emerald-400'">
                            {{ liveStatus.status }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Timeline Container -->
        <div class="p-8 md:p-12">
            <div class="relative">
                <!-- Vertical Rail -->
                <div class="absolute left-[23.5px] top-6 bottom-6 w-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                
                <div class="space-y-12">
                    <div *ngFor="let stop of liveStatus.fullSchedule; let i = index" class="relative pl-16 group">
                        <!-- Timeline Node -->
                        <div class="absolute left-0 top-1 flex items-center justify-center">
                            <!-- Node Icon/Circle -->
                            <div class="w-[48px] h-[48px] rounded-2xl flex items-center justify-center transition-all duration-500 relative z-20"
                                [ngClass]="{
                                    'bg-emerald-500 shadow-xl shadow-emerald-500/40 scale-110': stop.status === 'current',
                                    'bg-emerald-100 dark:bg-emerald-900/30 scale-100': stop.status === 'passed',
                                    'bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800': stop.status === 'upcoming'
                                }">
                                <span *ngIf="stop.status === 'current'" class="material-symbols-outlined text-white text-2xl animate-bounce-slow">train</span>
                                <div *ngIf="stop.status === 'passed'" class="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <div *ngIf="stop.status === 'upcoming'" class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                            </div>
                            
                            <!-- Active Progress Line (Solid Emerald) -->
                            <!-- Show green line if this station is passed OR (current AND departed) -->
                            <div *ngIf="i < liveStatus.fullSchedule.length - 1 && (stop.status === 'passed' || (stop.status === 'current' && stop.isEnRoute))" 
                                class="absolute left-[23.5px] top-12 w-1 bg-emerald-500 h-[calc(100%+48px)] z-10 transition-all duration-700"></div>


                        </div>

                        <!-- Content Wrapper -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 px-6 rounded-3xl transition-all duration-300 border border-transparent"
                            [ngClass]="stop.status === 'current' ? 'bg-emerald-500/5 border-emerald-500/20' : ''">
                            
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-1">
                                    <h4 class="text-xl font-bold tracking-tight text-slate-800 dark:text-white"
                                        [ngClass]="stop.status === 'upcoming' ? 'opacity-50' : ''">
                                        {{ stop.station }}
                                    </h4>
                                    <span class="text-xs font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                                        {{ stop.code }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                                    <span class="flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-[16px]">map</span>
                                        {{ stop.distanceFromStart }} km
                                    </span>
                                    <span *ngIf="stop.status === 'current'" class="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                                        <span class="relative flex h-2 w-2">
                                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        {{ stop.isEnRoute ? 'En Route to Next' : 'At Station' }}
                                    </span>
                                </div>
                            </div>


                            <div class="flex gap-8 md:text-right">
                                <div>
                                    <p class="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Arrival</p>
                                    <div class="flex flex-col">
                                        <span class="text-base font-black text-slate-800 dark:text-white"
                                            [ngClass]="stop.status === 'upcoming' ? 'opacity-50' : ''">
                                            {{ stop.estimatedArrival }}
                                        </span>
                                        <span class="text-[10px] font-bold text-slate-400 line-through tracking-tighter">{{ stop.arrival }}</span>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Departure</p>
                                    <div class="flex flex-col">
                                        <span class="text-base font-black text-slate-800 dark:text-white"
                                            [ngClass]="stop.status === 'upcoming' ? 'opacity-50' : ''">
                                            {{ stop.estimatedDeparture }}
                                        </span>
                                        <span class="text-[10px] font-bold text-slate-400 line-through tracking-tighter">{{ stop.departure }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Footer -->
        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-xl">update</span>
                </div>
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Sync</p>
                    <p class="text-sm font-black text-slate-700 dark:text-slate-300">{{ liveStatus.lastUpdated }}</p>
                </div>
            </div>
            <button (click)="checkLiveStatus()" class="flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95 shadow-sm">
                <span class="material-symbols-outlined text-base">refresh</span>
                Refresh Status
            </button>
        </div>
    </div>
</div>
        
        <div class="mt-8 text-center">
             <a routerLink="/" class="text-primary hover:text-primary-dark font-semibold inline-flex items-center gap-2 transition-colors">
                <span class="material-symbols-outlined text-sm">arrow_back</span> Back to Home
             </a>
        </div>
    </div>
</div>
    `
})
export class PnrStatusComponent {
    activeTab: 'pnr' | 'live' = 'pnr';
    pnrNumber = '';
    trainNumber = '';
    loading = false;
    pnrStatus: any = null;
    liveStatus: any = null;
    errorMessage = '';

    constructor(
        private bookingService: BookingService,
        private trainService: TrainService
    ) { }

    checkStatus() {
        if (!this.pnrNumber) return;

        this.loading = true;
        this.pnrStatus = null;
        this.liveStatus = null;
        this.errorMessage = '';

        this.bookingService.getBookingByPnr(this.pnrNumber).subscribe({
            next: (booking: any) => {
                this.loading = false;
                if (booking) {
                    this.pnrStatus = {
                        pnr: booking.pnr,
                        status: booking.status || 'CONFIRMED',
                        trainName: booking.train.name,
                        trainNo: booking.train.number,
                        date: new Date(booking.paymentDetails.date).toLocaleDateString(),
                        from: booking.train.from,
                        to: booking.train.to,
                        departureTime: booking.train.departure,
                        arrivalTime: booking.train.arrival,
                        duration: 'N/A', // Duration is not stored in booking
                        passengers: booking.passengers.map((p: any) => ({
                            name: p.name,
                            coach: p.coach || 'N/A',
                            berth: p.seatNumber || p.berth || 'N/A',
                            status: p.status || 'CNF'
                        }))
                    };
                } else {
                    this.errorMessage = 'PNR details not found.';
                }
            },
            error: (err: any) => {
                this.loading = false;
                console.error('Error fetching PNR status:', err);
                this.errorMessage = 'PNR details not found. Please check the number and try again.';
            }
        });
    }

    checkLiveStatus() {
        if (!this.trainNumber) return;

        this.loading = true;
        this.liveStatus = null;
        this.pnrStatus = null;
        this.errorMessage = '';

        this.trainService.getLiveStatus(this.trainNumber).subscribe({
            next: (data: any) => {
                this.loading = false;
                this.liveStatus = data;
            },
            error: (err: any) => {
                this.loading = false;
                this.errorMessage = 'Could not fetch live status for this train. Please check the train number.';
            }
        });
    }
}
