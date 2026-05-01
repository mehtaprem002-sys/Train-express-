import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../shared/notification.service';

@Component({
    selector: 'app-admin-trains',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
            <div>
                 <h2 class="text-3xl font-bold text-slate-800 dark:text-white">Train Management</h2>
                 <p class="text-slate-500 mt-1">Add, update, or remove trains.</p>
            </div>
            <button (click)="openModal()" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                <span class="material-symbols-outlined">add</span>
                Add Train
            </button>
        </div>

        <!-- Trains Table -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table class="w-full text-left text-sm">
                 <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th class="px-6 py-4">Number</th>
                         <th class="px-6 py-4">Train Name</th>
                         <th class="px-6 py-4">Route</th>
                         <th class="px-6 py-4">Classes</th>
                         <th class="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                     <tr *ngFor="let train of trains" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td class="px-6 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">{{ train.number }}</td>
                         <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ train.name }}</td>
                          <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                            <div *ngIf="train.schedule && train.schedule.length > 0">
                                {{ train.schedule[0].station }} → {{ train.schedule[train.schedule.length - 1].station }}
                            </div>
                         </td>
                         <td class="px-6 py-4">
                            <div class="flex flex-wrap gap-1">
                                <span *ngFor="let c of train.classes" class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold">{{ c }}</span>
                            </div>
                         </td>
                         <td class="px-6 py-4 text-right">
                             <button (click)="editTrain(train)" class="text-blue-500 hover:text-blue-700 mr-3 transition-colors">
                                 <span class="material-symbols-outlined">edit</span>
                             </button>
                             <button (click)="deleteTrain(train.id)" class="text-red-500 hover:text-red-700 transition-colors">
                                 <span class="material-symbols-outlined">delete</span>
                             </button>
                         </td>
                     </tr>
                 </tbody>
             </table>
        </div>

        <!-- Modal -->
        <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                 <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                     <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ isEditing ? 'Edit Train' : 'Add New Train' }}</h3>
                     <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                         <span class="material-symbols-outlined">close</span>
                     </button>
                 </div>
                 
                 <form (ngSubmit)="saveTrain()" class="p-6 space-y-4">
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1">Train Number</label>
                             <input [(ngModel)]="currentTrain.number" name="number" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required>
                         </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1">Train Name</label>
                             <input [(ngModel)]="currentTrain.name" name="name" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required>
                         </div>
                     </div>

                     <div class="grid grid-cols-2 gap-4">
                         <div>
                            <label class="block text-xs font-bold text-slate-500 mb-1">{{ getGlobalPriceLabel() }}</label>
                            <input [(ngModel)]="currentTrain.basePrice" name="basePrice" type="number" placeholder="Full journey base price" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white" required>
                        </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1">Train Type</label>
                             <input [(ngModel)]="currentTrain.type" name="type" type="text" placeholder="e.g. Superfast, Rajdhani" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                         </div>
                     </div>

                     <!-- Advanced Date/Class Overrides -->
                     <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                         <h4 class="text-sm font-bold text-slate-800 dark:text-white mb-3">Custom Overrides (Per Date & Class)</h4>
                         
                         <!-- Override List -->
                         <div *ngIf="overrides.length > 0" class="mb-4 space-y-2">
                             <ng-container *ngFor="let o of overrides; let i = index">
                                 <div *ngIf="isFutureOrToday(o.date)" class="flex flex-col bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs gap-1">
                                     <div class="flex justify-between items-center w-full">
                                         <div>
                                             <span class="font-bold text-slate-700 dark:text-slate-300">{{ o.date | date:'MMM d, y' }}</span>
                                             <span class="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mx-2">{{ o.classType }}</span>
                                             <span *ngIf="o.availableSeats !== null" class="text-green-600 font-bold">AVL {{ o.availableSeats }}</span>
                                             <span *ngIf="o.waitlistSeats !== null" class="text-yellow-600 font-bold ml-1">WL {{ o.waitlistSeats }}</span>
                                             <span *ngIf="o.price !== null && o.price !== undefined" class="ml-2 font-medium">₹{{ o.price }}</span>
                                         </div>
                                         <button type="button" (click)="removeOverride(i)" class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><span class="material-symbols-outlined text-[16px]">delete</span></button>
                                     </div>
                                     <div *ngIf="o.trainNo || o.departureTime || o.arrivalTime" class="text-[10px] text-slate-500 flex gap-3 border-t border-slate-100 dark:border-slate-700 pt-1">
                                          <span *ngIf="o.trainNo" class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">train</span> Number: <b>{{o.trainNo}}</b></span>
                                           <span *ngIf="o.departureTime" class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span> Departure: <b>{{o.departureTime}}</b></span>
                                           <span *ngIf="o.arrivalTime" class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">schedule</span> Arrival: <b>{{o.arrivalTime}}</b></span>
                                     </div>
                                 </div>
                             </ng-container>
                         </div>

                         <!-- Add Override Form -->
                         <div class="grid grid-cols-5 gap-2 items-end">
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Date</label>
                                  <input type="date" [min]="minDate" [(ngModel)]="overrideDateInput" (ngModelChange)="onOverrideInputChanged()" name="oDate" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Class</label>
                                  <select [(ngModel)]="overrideClassInput" (ngModelChange)="onOverrideInputChanged()" name="oClass" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                                      <option value="">Select</option>
                                      <option *ngFor="let c of classesInput.split(',')" [value]="c.trim()">{{ c.trim() }}</option>
                                  </select>
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">AVL</label>
                                  <input type="number" [(ngModel)]="overrideAvailInput" name="oAvl" placeholder="AVL" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">WL</label>
                                  <input type="number" [(ngModel)]="overrideWaitlistInput" name="oWl" placeholder="WL" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Price (₹)</label>
                                  <input type="number" [(ngModel)]="overridePriceInput" name="oPrice" placeholder="₹" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                         </div>
                         
                         <!-- Row 2: Train No & Times -->
                         <div class="grid grid-cols-3 gap-2 items-end mt-2">
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Override Train Number</label>
                                  <input type="text" [(ngModel)]="overrideTrainNoInput" name="oTrainNo" placeholder="No change" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Departure Time</label>
                                  <input type="text" [(ngModel)]="overrideDepTimeInput" (ngModelChange)="autoDistributeScheduleTimes()" name="oDepTime" placeholder="HH:mm" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                              <div class="col-span-1">
                                  <label class="block text-[10px] font-bold text-slate-500 mb-1">Arrival Time</label>
                                  <input type="text" [(ngModel)]="overrideArrTimeInput" (ngModelChange)="autoDistributeScheduleTimes()" name="oArrTime" placeholder="HH:mm" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs">
                              </div>
                         </div>

                         <button type="button" (click)="addOverride()" class="mt-3 w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            + Add Override
                         </button>
                     </div>

                     <!-- Simplified for prototype: Comma separated runsOn -->
                     <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Runs On (Comma separated: Mon,Tue...)</label>
                         <input [(ngModel)]="runsOnInput" name="runsOn" type="text" placeholder="Mon,Tue,Wed,Thu,Fri,Sat,Sun" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                     </div>

                     <!-- Simplified Classes -->
                      <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1">Classes (Comma separated: SL,3A,2A...)</label>
                         <input [(ngModel)]="classesInput" name="classes" type="text" placeholder="SL,3A,2A" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                     </div>

                     <!-- Professional Route Management Section -->
                     <div class="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Train Route / Schedule</h4>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage stops, times and distances</p>
                            </div>
                            <div class="flex gap-2">
                                <button type="button" (click)="suggestStops()" class="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-[14px]">auto_fix</span>
                                    Suggest
                                </button>
                                <button type="button" (click)="addStop()" class="text-[10px] bg-primary text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-md shadow-primary/20">
                                    <span class="material-symbols-outlined text-[14px]">add_location</span>
                                    Add Stop
                                </button>
                            </div>
                        </div>

                        <!-- Table Header -->
                        <div class="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Station Name</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Departure / Arrival</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Distance (KM)</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Day</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></span>
                        </div>

                        <!-- Table Body -->
                        <div class="max-h-[350px] overflow-y-auto custom-scrollbar">
                            <div *ngFor="let stop of currentSchedule; let i = index; let even = even; trackBy: trackByStops" 
                                 [ngClass]="even ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'"
                                 class="grid grid-cols-[2.5fr_1fr_1fr_1fr_0.5fr] gap-4 px-4 py-3 items-center border-b border-slate-50 dark:border-slate-800 group transition-colors hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10">
                                
                                <div class="flex items-center gap-3">
                                    <span class="text-[10px] font-black text-slate-300 w-4">#{{i+1}}</span>
                                    <div class="flex-1">
                                        <select [(ngModel)]="stop.station" (ngModelChange)="onStationChange(i)" [name]="'stopName'+stop.id" 
                                            class="w-full bg-transparent border-none p-0 text-xs font-black text-slate-800 dark:text-white focus:ring-0 cursor-pointer">
                                            <option value="">Select Station</option>
                                            <option *ngFor="let s of allStations" [value]="s.name">{{ s.name }} ({{ s.code }})</option>
                                        </select>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ stop.code || '----' }}</div>
                                    </div>
                                </div>

                                <div class="space-y-1">
                                    <input [(ngModel)]="stop.departure" [name]="'stopDep'+stop.id" type="text" placeholder="Departure HH:mm" 
                                        class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-[11px] font-bold text-center focus:ring-1 focus:ring-primary/30">
                                    <input [(ngModel)]="stop.arrival" [name]="'stopArr'+stop.id" type="text" placeholder="Arrival HH:mm" 
                                        class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-[11px] font-bold text-center focus:ring-1 focus:ring-primary/30">
                                </div>

                                <div class="text-center">
                                    <input [(ngModel)]="stop.distanceFromStart" [name]="'stopDist'+stop.id" type="number" 
                                        class="w-16 bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-[11px] font-bold text-center focus:ring-1 focus:ring-primary/30">
                                </div>

                                <div class="text-center">
                                    <span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ getStopDay(currentSchedule, i) }}</span>
                                </div>

                                <div class="flex justify-end">
                                    <button *ngIf="currentSchedule.length > 2" type="button" (click)="removeStop(i)" 
                                        class="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <span class="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                     </div>

                     <div class="pt-4 flex justify-end gap-3">
                         <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition-colors">Cancel</button>
                         <button type="submit" class="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-colors">
                             {{ isEditing ? 'Update' : 'Create' }}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    </div>
  `,
})
export class AdminTrainsComponent implements OnInit {
    trains: any[] = [];
    showModal = false;
    isEditing = false;

    // Form Model
    currentTrain: any = {};
    runsOnInput = '';
    overrides: any[] = [];
    overrideDateInput = '';
    overrideClassInput = '';
    overrideAvailInput: number | null = null;
    overrideWaitlistInput: number | null = null;
    overridePriceInput: number | null = null;
    overrideTrainNoInput = '';
    overrideDepTimeInput = '';
    overrideArrTimeInput = '';
    classesInput = '';
    sourceStation = '';
    destStation = '';
    minDate = '';
    allStations: any[] = [];
    currentSchedule: any[] = [];

    private apiUrl = 'http://localhost:5000/api/trains';

    constructor(private http: HttpClient, private notification: NotificationService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        this.minDate = `${y}-${m}-${d}`;
        this.fetchTrains();
        this.fetchStations();
    }

    trackByStops(index: number, item: any) {
        // Return object identity. This preserves form focus/values when splicing the array.
        return item;
    }

    getGlobalPriceLabel() {
        const classes = (this.classesInput || '').split(',').map(c => c.trim().toUpperCase());
        let ref = 'SL';
        if (classes.includes('SL')) {
            ref = 'SL';
        } else if (classes.includes('3A')) {
            ref = '3A';
        } else if (classes.includes('CC')) {
            ref = 'CC';
        } else if (classes.length > 0 && classes[0] !== '') {
            ref = classes[0];
        }
        return `Global Base Price (₹) - ${ref} Class`;
    }

    fetchStations() {
        this.http.get<any[]>(`${this.apiUrl}/admin/stations`, this.getHeaders()).subscribe({
            next: (data) => {
                this.allStations = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Fetch stations failed', err)
        });
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

    isFutureOrToday(dateStr: string): boolean {
        if (!dateStr) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);
        return checkDate >= today;
    }

    fetchTrains() {
        this.http.get<any[]>(`${this.apiUrl}/admin/all`, this.getHeaders()).subscribe({
            next: (data) => {
                this.trains = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error(err)
        });
    }

    openModal() {
        this.currentTrain = { 
            number: '', 
            name: '', 
            runsOn: [], 
            classes: [], 
            schedule: [],
            basePrice: 550,
            type: 'Superfast'
        };
        this.runsOnInput = '';
        this.overrides = [];
        this.classesInput = '';
        this.overrideTrainNoInput = '';
        this.overrideDepTimeInput = '';
        this.overrideArrTimeInput = '';
        this.currentSchedule = [
            { id: Date.now(), station: '', code: '', arrival: '08:00', departure: '08:00', distanceFromStart: 0 },
            { id: Date.now() + 1, station: '', code: '', arrival: '20:00', departure: '20:00', distanceFromStart: 500 }
        ];
        this.isEditing = false;
        this.showModal = true;
    }

    editTrain(train: any) {
        this.currentTrain = { ...train };
        this.runsOnInput = train.runsOn ? train.runsOn.join(',') : '';
        this.overrides = train.overrides ? [...train.overrides] : [];
        this.classesInput = train.classes ? train.classes.join(',') : '';

        // Extract schedule for editing
        this.currentSchedule = train.schedule ? JSON.parse(JSON.stringify(train.schedule)) : [
            { id: Date.now(), station: '', code: '', arrival: '08:00', departure: '08:00', distanceFromStart: 0 },
            { id: Date.now() + 1, station: '', code: '', arrival: '20:00', departure: '20:00', distanceFromStart: 500 }
        ];

        // Ensure each existing stop has a unique ID for form tracking
        this.currentSchedule.forEach((s, idx) => {
            if (!s.id) s.id = Date.now() + idx + Math.floor(Math.random() * 1000);
        });
        if (this.currentSchedule.length > 0) {
            this.sourceStation = this.currentSchedule[0].station;
            this.destStation = this.currentSchedule[this.currentSchedule.length - 1].station;
        }

        this.overrideTrainNoInput = train.number;
        this.overrideDepTimeInput = (train.schedule && train.schedule.length > 0 && train.schedule[0].departure) ? train.schedule[0].departure : (train.departureTime || '08:00');
        this.overrideArrTimeInput = (train.schedule && train.schedule.length > 0 && train.schedule[train.schedule.length - 1].arrival) ? train.schedule[train.schedule.length - 1].arrival : (train.arrivalTime || '20:00');
        this.isEditing = true;
        this.showModal = true;
    }

    onOverrideInputChanged() {
        if (this.isEditing && this.currentTrain.id && this.overrideDateInput && this.overrideClassInput) {
            const params = `date=${this.overrideDateInput}&classType=${this.overrideClassInput}&tempBasePrice=${this.currentTrain.basePrice}&tempClasses=${this.classesInput}`;
            this.http.get<any>(`${this.apiUrl}/${this.currentTrain.id}/simulate?${params}`, this.getHeaders())
            .subscribe({
                next: (data) => {
                    this.overridePriceInput = data.price;
                    this.overrideTrainNoInput = data.trainNumber;
                    this.overrideDepTimeInput = data.departureTime;
                    this.overrideArrTimeInput = data.arrivalTime;
                    
                    // Auto-fill availability based on simulation
                    if (data.availability.status === 'AVL') {
                        this.overrideAvailInput = data.availability.count;
                        this.overrideWaitlistInput = null;
                    } else if (data.availability.status === 'WL') {
                        this.overrideWaitlistInput = data.availability.count;
                        this.overrideAvailInput = null;
                    } else {
                        this.overrideAvailInput = null;
                        this.overrideWaitlistInput = null;
                    }
                     this.cdr.detectChanges();
                },
                error: (err) => console.error('Simulation failed', err)
            });
        }
    }



    // --- AUTO DISTANCE LOGIC ---
    calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    recalculateRouteDistances() {
        if (this.currentSchedule.length < 1) return;

        // Source is always 0 KM
        this.currentSchedule[0].distanceFromStart = 0;

        for (let i = 1; i < this.currentSchedule.length; i++) {
            const prevStop = this.currentSchedule[i - 1];
            const currentStop = this.currentSchedule[i];

            const prevStation = this.allStations.find(s => s.name === prevStop.station || s.code === prevStop.code);
            const currentStation = this.allStations.find(s => s.name === currentStop.station || s.code === currentStop.code);

            let distBetween = 0;

            if (prevStation && currentStation && prevStation.latitude && currentStation.latitude) {
                distBetween = this.calculateHaversineDistance(
                    prevStation.latitude, prevStation.longitude,
                    currentStation.latitude, currentStation.longitude
                );
            }

            // Fallback: If calculation fails or stations are same or coordinates missing
            if (distBetween <= 0) {
                // Return a reasonable default increment
                distBetween = 50; 
            }

            // User said "previously km were changing" - they prefer dynamic updates.
            // We update the distance always, unless it would result in a zero/negative.
            currentStop.distanceFromStart = prevStop.distanceFromStart + distBetween;
        }
        this.cdr.detectChanges();
    }

    // --- SMART TIME DISTRIBUTION ---
    timeToMins(t: string): number {
        if (!t || !t.includes(':')) return 0;
        const [h, m] = t.split(':').map(Number);
        return (isNaN(h) || isNaN(m)) ? 0 : (h * 60) + m;
    }

    minsToTime(m: number): string {
        let normalizedMins = m % (24 * 60);
        if (normalizedMins < 0) normalizedMins += 24 * 60;
        const h = Math.floor(normalizedMins / 60);
        const mm = normalizedMins % 60;
        return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    autoDistributeScheduleTimes() {
        // Only run if we have start time, end time and at least 2 stops
        if (!this.overrideDepTimeInput || !this.overrideArrTimeInput || !this.currentSchedule || this.currentSchedule.length < 2) return;
        
        // Validate HH:mm format properly
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(this.overrideDepTimeInput.trim()) || !timeRegex.test(this.overrideArrTimeInput.trim())) return;

        const startMins = this.timeToMins(this.overrideDepTimeInput.trim());
        const endMins = this.timeToMins(this.overrideArrTimeInput.trim());
        
        let totalDuration = endMins - startMins;
        if (totalDuration <= 0) totalDuration += 24 * 60; // Handle overnight

        // Find total distance from schedule
        const lastStop = this.currentSchedule[this.currentSchedule.length - 1];
        const totalDist = lastStop.distanceFromStart || 1;
        
        // 1. Update first stop
        this.currentSchedule[0].departure = this.overrideDepTimeInput.trim();
        this.currentSchedule[0].arrival = this.minsToTime(startMins - 2); 

        // 2. Update last stop
        this.currentSchedule[this.currentSchedule.length - 1].arrival = this.overrideArrTimeInput.trim();
        this.currentSchedule[this.currentSchedule.length - 1].departure = this.overrideArrTimeInput.trim();

        // 3. Proportional distribution for middle stops
        for (let i = 1; i < this.currentSchedule.length - 1; i++) {
            const stop = this.currentSchedule[i];
            const stopDist = stop.distanceFromStart || 0;
            const ratio = stopDist / totalDist;
            
            const arrivalMins = startMins + (totalDuration * ratio);
            stop.arrival = this.minsToTime(Math.round(arrivalMins));
            stop.departure = this.minsToTime(Math.round(arrivalMins) + 2); // 2 min halt
        }

        this.cdr.detectChanges();
    }

    addStop() {
        // Insert before destination station
        const newStop = { id: Date.now() + Math.floor(Math.random() * 1000), station: '', code: '', arrival: '', departure: '', distanceFromStart: 0 };
        if (this.currentSchedule.length >= 2) {
            this.currentSchedule.splice(this.currentSchedule.length - 1, 0, newStop);
        } else {
            this.currentSchedule.push(newStop);
        }
        this.recalculateRouteDistances();
    }

    removeStop(index: number) {
        if (this.currentSchedule.length > 2) {
            this.currentSchedule.splice(index, 1);
            this.recalculateRouteDistances();
        } else {
            alert("Train must have at least Source and Destination.");
        }
    }

    onStationChange(index: number) {
        const selectedStationName = this.currentSchedule[index].station;
        const stationObj = this.allStations.find(s => s.name === selectedStationName);
        if (stationObj) {
            this.currentSchedule[index].code = stationObj.code;
        }
        
        // Sync source/dest if edge stations changed
        if (index === 0) this.sourceStation = selectedStationName;
        if (index === this.currentSchedule.length - 1) this.destStation = selectedStationName;

        this.recalculateRouteDistances();
    }

    suggestStops() {
        if (this.currentSchedule.length < 2) {
            alert('Please select Source and Destination first.');
            return;
        }
        
        const sourceCode = this.currentSchedule[0].code;
        const destCode = this.currentSchedule[this.currentSchedule.length - 1].code;
        
        if (!sourceCode || !destCode) {
            alert('Source and Destination must have station codes.');
            return;
        }

        // FIND BEST MATCH: Search for any train that contains BOTH source and destination in order
        let bestMatch: any = null;
        let bestSubSchedule: any[] = [];

        for (const train of this.trains) {
            if (train.id === this.currentTrain.id || !train.schedule) continue;

            const sourceIdx = train.schedule.findIndex((s: any) => s.code === sourceCode);
            const destIdx = train.schedule.findIndex((s: any) => s.code === destCode);

            // Valid path found if source exists before destination
            if (sourceIdx !== -1 && destIdx !== -1 && sourceIdx < destIdx) {
                const subSchedule = train.schedule.slice(sourceIdx, destIdx + 1);
                
                // If we find multiple, prefer the one with most stops (more detailed)
                if (!bestMatch || subSchedule.length > bestSubSchedule.length) {
                    bestMatch = train;
                    bestSubSchedule = subSchedule;
                }
            }
        }

        if (bestMatch) {
            if (confirm(`Found route path in "${bestMatch.name}" (#${bestMatch.number}). Copy ${bestSubSchedule.length} stations?`)) {
                // Deep copy the segment but only keep stations and codes, clear times
                this.currentSchedule = bestSubSchedule.map((s: any) => ({
                    station: s.station,
                    code: s.code,
                    arrival: '',
                    departure: '',
                    distanceFromStart: 0
                }));
                
                // Recalculate distances based on new stations
                this.recalculateRouteDistances();
                
                // Sync UI variables
                this.sourceStation = this.currentSchedule[0].station;
                this.destStation = this.currentSchedule[this.currentSchedule.length - 1].station;
                
                this.notification.showSuccess(`Imported route stations from ${bestMatch.name}`);
                this.cdr.detectChanges();
            }
        } else {
            alert('No existing train found that covers this specific path.');
        }
    }

    getStopDay(schedule: any[], index: number): string {
        if (!schedule || schedule.length === 0 || index === 0) return 'Day 1';
        
        let day = 1;
        for (let i = 1; i <= index; i++) {
            const prev = schedule[i - 1].departure || '00:00';
            const curr = schedule[i].arrival || '00:00';
            if (curr < prev) day++;
        }
        return `Day ${day}`;
    }

    addOverride() {
        if (!this.overrideDateInput || !this.overrideClassInput) {
            alert('Date and Class are required to add an override.');
            return;
        }
        if (!this.isFutureOrToday(this.overrideDateInput)) {
            alert('Cannot add an override for a past date.');
            return;
        }
        this.overrides.push({
            date: this.overrideDateInput,
            classType: this.overrideClassInput,
            availableSeats: this.overrideAvailInput !== null && String(this.overrideAvailInput).trim() !== '' ? Number(this.overrideAvailInput) : null,
            waitlistSeats: this.overrideWaitlistInput !== null && String(this.overrideWaitlistInput).trim() !== '' ? Number(this.overrideWaitlistInput) : null,
            price: this.overridePriceInput !== null && String(this.overridePriceInput).trim() !== '' ? Number(this.overridePriceInput) : null,
            trainNo: this.overrideTrainNoInput || null,
            departureTime: this.overrideDepTimeInput || null,
            arrivalTime: this.overrideArrTimeInput || null
        });
        
        this.overrideAvailInput = null;
        this.overrideWaitlistInput = null;
        this.overridePriceInput = null;
        this.overrideTrainNoInput = '';
        this.overrideDepTimeInput = '';
        this.overrideArrTimeInput = '';
    }

    removeOverride(index: number) {
        this.overrides.splice(index, 1);
    }

    closeModal() {
        this.showModal = false;
    }

    async deleteTrain(id: string) {
        const confirmed = await this.notification.confirm('Are you sure you want to delete this train?');
        if (!confirmed) return;

        this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders()).subscribe({
            next: () => {
                this.notification.showSuccess('Train deleted successfully');
                this.fetchTrains();
            },
            error: (err) => {
                this.notification.showError('Failed to delete train');
                console.error(err);
            }
        });
    }

    saveTrain() {
        // Prepare Data
        this.recalculateRouteDistances(); // Ensure distances are up to date before saving
        const runsOn = this.runsOnInput.split(',').map(s => s.trim()).filter(s => s);
        const classes = this.classesInput.split(',').map(s => s.trim()).filter(s => s);

        // Ensure we use the latest managed currentSchedule
        const schedule = this.currentSchedule;
        
        // Sync root source/dest from schedule for display/search
        const from = schedule.length > 0 ? schedule[0].station : '';
        const to = schedule.length > 0 ? schedule[schedule.length - 1].station : '';

        const payload = {
            ...this.currentTrain,
            runsOn,
            classes,
            schedule,
            from,
            to,
            overrides: this.overrides
        };

        if (this.isEditing) {
            this.http.put(`${this.apiUrl}/${this.currentTrain.id}`, payload, this.getHeaders()).subscribe({
                next: () => {
                    this.notification.showSuccess(`Train "${payload.name}" updated successfully`);
                    this.fetchTrains();
                    this.closeModal();
                },
                error: (err) => {
                    const msg = err.error?.error || 'Failed to update train.';
                    this.notification.showError(msg);
                    console.error(err);
                }
            });
        } else {
            this.http.post(this.apiUrl, payload, this.getHeaders()).subscribe({
                next: () => {
                    this.notification.showSuccess(`Train "${payload.name}" created successfully`);
                    this.fetchTrains();
                    this.closeModal();
                },
                error: (err) => {
                    const msg = err.error?.error || 'Failed to create train.';
                    this.notification.showError(msg);
                    console.error(err);
                }
            });
        }
    }
}
