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

                     <!-- Advanced Date/Class Overrides -->
                     <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/50">
                         <h4 class="text-sm font-bold text-slate-800 dark:text-white mb-3">Custom Overrides (Per Date & Class)</h4>
                         
                         <!-- Override List -->
                         <div *ngIf="overrides.length > 0" class="mb-4 space-y-2">
                             <ng-container *ngFor="let o of overrides; let i = index">
                                 <div *ngIf="isFutureOrToday(o.date)" class="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                                     <div>
                                         <span class="font-bold text-slate-700 dark:text-slate-300">{{ o.date | date:'MMM d, y' }}</span>
                                         <span class="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mx-2">{{ o.classType }}</span>
                                         <span *ngIf="o.availableSeats !== null" class="text-green-600 font-bold">AVL {{ o.availableSeats }}</span>
                                         <span *ngIf="o.waitlistSeats !== null" class="text-yellow-600 font-bold">WL {{ o.waitlistSeats }}</span>
                                         <span *ngIf="o.price !== null && o.price !== undefined" class="ml-2 font-medium">₹{{ o.price }}</span>
                                     </div>
                                     <button type="button" (click)="removeOverride(i)" class="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><span class="material-symbols-outlined text-[16px]">delete</span></button>
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

                     <!-- Simplified Route Endpoint for now (Just Source/Dest) -->
                     <div class="grid grid-cols-2 gap-4">
                        <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1">Source Station</label>
                             <input [(ngModel)]="sourceStation" name="source" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
                        </div>
                        <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1">Destination Station</label>
                             <input [(ngModel)]="destStation" name="dest" type="text" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white">
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
  `
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
    classesInput = '';
    sourceStation = '';
    destStation = '';
    minDate = '';

    private apiUrl = 'http://localhost:5000/api/trains';

    constructor(private http: HttpClient, private notification: NotificationService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        this.minDate = `${y}-${m}-${d}`;
        this.fetchTrains();
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
        this.currentTrain = { number: '', name: '', runsOn: [], classes: [], schedule: [] };
        this.runsOnInput = '';
        this.overrides = [];
        this.classesInput = '';
        this.sourceStation = '';
        this.destStation = '';
        this.isEditing = false;
        this.showModal = true;
    }

    editTrain(train: any) {
        this.currentTrain = { ...train };
        this.runsOnInput = train.runsOn ? train.runsOn.join(',') : '';
        this.overrides = train.overrides ? [...train.overrides] : [];
        this.classesInput = train.classes ? train.classes.join(',') : '';

        // Extract endpoints from schedule for simplified editing
        if (train.schedule && train.schedule.length > 0) {
            this.sourceStation = train.schedule[0].station;
            this.destStation = train.schedule[train.schedule.length - 1].station;
        }

        this.isEditing = true;
        this.showModal = true;
    }

    onOverrideInputChanged() {
        if (this.isEditing && this.currentTrain.id && this.overrideDateInput && this.overrideClassInput) {
            this.http.get<any>(`${this.apiUrl}/${this.currentTrain.id}/simulate?date=${this.overrideDateInput}&classType=${this.overrideClassInput}`, this.getHeaders())
            .subscribe({
                next: (data) => {
                    this.overridePriceInput = data.price;
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
            price: this.overridePriceInput !== null && String(this.overridePriceInput).trim() !== '' ? Number(this.overridePriceInput) : null
        });
        
        this.overrideAvailInput = null;
        this.overrideWaitlistInput = null;
        this.overridePriceInput = null;
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

        this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders()).subscribe(() => {
            this.fetchTrains();
        });
    }

    saveTrain() {
        // Prepare Data
        const runsOn = this.runsOnInput.split(',').map(s => s.trim()).filter(s => s);
        const classes = this.classesInput.split(',').map(s => s.trim()).filter(s => s);

        // Preserve existing schedule for editing, or construct minimum viable schedule for new trains
        let schedule = this.currentTrain.schedule ? [...this.currentTrain.schedule] : [];

        if (this.isEditing && schedule.length >= 2) {
            schedule[0] = { ...schedule[0], station: this.sourceStation };
            schedule[schedule.length - 1] = { ...schedule[schedule.length - 1], station: this.destStation };
        } else {
            schedule = [
                { station: this.sourceStation, departure: '08:00', arrival: '08:00', distanceFromStart: 0 },
                { station: this.destStation, departure: '20:00', arrival: '20:00', distanceFromStart: 500 }
            ];
        }

        const payload = {
            ...this.currentTrain,
            runsOn,
            classes,
            schedule,
            from: this.sourceStation,
            to: this.destStation,
            basePrice: this.isEditing ? this.currentTrain.basePrice : 500,
            overrides: this.overrides
        };

        if (this.isEditing) {
            this.http.put(`${this.apiUrl}/${this.currentTrain.id}`, payload, this.getHeaders()).subscribe(() => {
                this.fetchTrains();
                this.closeModal();
            });
        } else {
            this.http.post(this.apiUrl, payload, this.getHeaders()).subscribe(() => {
                this.fetchTrains();
                this.closeModal();
            });
        }
    }
}
