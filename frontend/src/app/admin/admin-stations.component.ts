import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../shared/notification.service';

@Component({
    selector: 'app-admin-stations',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-6 animate-fade-in">
        <div class="flex justify-between items-center">
            <div>
                 <h2 class="text-3xl font-bold text-slate-800 dark:text-white">Station Management</h2>
                 <p class="text-slate-500 mt-1">Add, update, or remove railway stations.</p>
            </div>
            <button (click)="openModal()" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                <span class="material-symbols-outlined">add_location</span>
                Add Station
            </button>
        </div>

        <!-- Stations Table -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table class="w-full text-left text-sm">
                 <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th class="px-6 py-4">Code</th>
                         <th class="px-6 py-4">Station Name</th>
                         <th class="px-6 py-4">City</th>
                         <th class="px-6 py-4">State/Region</th>
                         <th class="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                     <tr *ngFor="let station of stations" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td class="px-6 py-4 font-mono font-bold text-primary dark:text-blue-400">{{ station.code }}</td>
                         <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ station.name }}</td>
                         <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ station.city }}</td>
                         <td class="px-6 py-4">
                             <span class="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs font-bold">{{ station.state || station.region }}</span>
                         </td>
                         <td class="px-6 py-4 text-right">
                             <button (click)="editStation(station)" class="text-blue-500 hover:text-blue-700 mr-3 transition-colors">
                                 <span class="material-symbols-outlined">edit</span>
                             </button>
                             <button (click)="deleteStation(station._id)" class="text-red-500 hover:text-red-700 transition-colors">
                                 <span class="material-symbols-outlined">delete</span>
                             </button>
                         </td>
                     </tr>
                 </tbody>
             </table>
        </div>

        <!-- Modal -->
        <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
             <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                 <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                     <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ isEditing ? 'Edit Station' : 'Add New Station' }}</h3>
                     <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
                         <span class="material-symbols-outlined">close</span>
                     </button>
                 </div>
                 
                 <form (ngSubmit)="saveStation()" class="p-6 space-y-4">
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Station Code</label>
                             <input [(ngModel)]="currentStation.code" name="code" type="text" placeholder="e.g. NDLS" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" required>
                         </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Station Name</label>
                             <input [(ngModel)]="currentStation.name" name="name" type="text" placeholder="e.g. New Delhi" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" required>
                         </div>
                     </div>

                     <div>
                         <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">City</label>
                         <input [(ngModel)]="currentStation.city" name="city" type="text" placeholder="e.g. Delhi" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" required>
                     </div>

                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">State</label>
                             <input [(ngModel)]="currentStation.state" name="state" type="text" placeholder="e.g. Delhi" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                         </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Region</label>
                             <select [(ngModel)]="currentStation.region" name="region" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                                 <option value="North">North</option>
                                 <option value="South">South</option>
                                 <option value="East">East</option>
                                 <option value="West">West</option>
                                 <option value="Central">Central</option>
                             </select>
                         </div>
                     </div>

                     <div class="pt-4 flex justify-end gap-3">
                         <button type="button" (click)="closeModal()" class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition-colors">Cancel</button>
                         <button type="submit" class="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg transition-all active:scale-95">
                             {{ isEditing ? 'Update Station' : 'Create Station' }}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    </div>
  `
})
export class AdminStationsComponent implements OnInit {
    stations: any[] = [];
    showModal = false;
    isEditing = false;
    currentStation: any = {};

    private apiUrl = 'http://localhost:5000/api/trains/admin/stations';

    constructor(private http: HttpClient, private notificationService: NotificationService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.fetchStations();
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

    fetchStations() {
        this.http.get<any[]>(this.apiUrl, this.getHeaders()).subscribe({
            next: (data) => {
                this.stations = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to fetch stations', err)
        });
    }

    openModal() {
        this.currentStation = { code: '', name: '', city: '', state: '', region: 'North' };
        this.isEditing = false;
        this.showModal = true;
    }

    editStation(station: any) {
        this.currentStation = { ...station };
        this.isEditing = true;
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    saveStation() {
        if (this.isEditing) {
            this.http.put(`${this.apiUrl}/${this.currentStation._id}`, this.currentStation, this.getHeaders()).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Station updated successfully');
                    this.fetchStations();
                    this.closeModal();
                },
                error: () => this.notificationService.showError('Failed to update station')
            });
        } else {
            this.http.post(this.apiUrl, this.currentStation, this.getHeaders()).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Station created successfully');
                    this.fetchStations();
                    this.closeModal();
                },
                error: () => this.notificationService.showError('Failed to create station')
            });
        }
    }

    async deleteStation(id: string) {
        const confirmed = await this.notificationService.confirm('Are you sure you want to delete this station?');
        if (!confirmed) return;

        this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders()).subscribe({
            next: () => {
                this.notificationService.showSuccess('Station deleted successfully');
                this.fetchStations();
            },
            error: () => this.notificationService.showError('Failed to delete station')
        });
    }
}
