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
            <div class="flex gap-3">
                <button (click)="syncAllStations()" [disabled]="isSyncing" 
                    [class.opacity-50]="isSyncing"
                    class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700">
                    <span class="material-symbols-outlined" [class.animate-spin]="isSyncing">sync</span>
                    {{ isSyncing ? 'Syncing...' : 'Sync All Data' }}
                </button>
                <button (click)="openModal()" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                    <span class="material-symbols-outlined">add_location</span>
                    Add Station
                </button>
            </div>
        </div>

        <!-- Stations Table -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table class="w-full text-left text-sm">
                 <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th class="px-6 py-4">Code</th>
                         <th class="px-6 py-4">Station Name</th>
                         <th class="px-6 py-4">City</th>
                         <th class="px-6 py-4">State</th>
                         <th class="px-6 py-4">Region</th>
                         <th class="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                     <tr *ngFor="let station of stations" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td class="px-6 py-4 font-mono font-bold text-primary dark:text-blue-400">{{ station.code }}</td>
                         <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ station.name }}</td>
                         <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ station.city || '---' }}</td>
                         <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ station.state || '---' }}</td>
                         <td class="px-6 py-4">
                             <span class="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                 {{ station.region }}
                             </span>
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

                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Latitude</label>
                             <input [(ngModel)]="currentStation.latitude" name="lat" type="number" step="any" placeholder="e.g. 23.02" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                         </div>
                         <div>
                             <label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Longitude</label>
                             <input [(ngModel)]="currentStation.longitude" name="lng" type="number" step="any" placeholder="e.g. 72.57" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                         </div>
                     </div>

                     <div class="flex justify-between items-center">
                        <button type="button" (click)="autoFetchCoords()" class="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[14px]">map</span>
                            Auto-Fetch GPS
                        </button>
                        <span class="text-[9px] font-bold text-slate-400">Required for Auto-Distance</span>
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

    isSyncing = false;
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
        this.currentStation = { code: '', name: '', city: '', state: '', region: 'North', latitude: null, longitude: null };
        this.isEditing = false;
        this.showModal = true;
        this.cdr.detectChanges();
    }

    editStation(station: any) {
        // Create a clean copy of the station data
        this.currentStation = JSON.parse(JSON.stringify(station));
        this.isEditing = true;
        this.showModal = true;
        
        // Force Angular to render the modal with the new data
        this.cdr.detectChanges();
    }

    closeModal() {
        this.showModal = false;
    }

    saveStation() {
        if (!this.currentStation.code || !this.currentStation.name) {
            this.notificationService.showError('Station code and name are required');
            return;
        }

        if (this.isEditing) {
            this.http.put(`${this.apiUrl}/${this.currentStation._id}`, this.currentStation, this.getHeaders()).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Station updated successfully');
                    this.fetchStations();
                    this.closeModal();
                },
                error: (err) => {
                    this.notificationService.showError('Failed to update station');
                    console.error(err);
                }
            });
        } else {
            this.http.post(this.apiUrl, this.currentStation, this.getHeaders()).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Station created successfully');
                    this.fetchStations();
                    this.closeModal();
                },
                error: (err) => {
                    this.notificationService.showError('Failed to create station');
                    console.error(err);
                }
            });
        }
    }

    async syncAllStations() {
        if (this.isSyncing) return;
        const confirmed = await this.notificationService.confirm(`This will automatically find GPS, City, and State for all ${this.stations.length} stations. This takes about 1.5s per station. Proceed?`);
        if (!confirmed) return;

        this.isSyncing = true;
        this.notificationService.showSuccess(`Starting Sync for ${this.stations.length} stations...`);

        try {
            for (let i = 0; i < this.stations.length; i++) {
                const station = this.stations[i];
                if (i % 5 === 0 || i === this.stations.length - 1) {
                    this.notificationService.showSuccess(`Processing: ${i + 1}/${this.stations.length}`);
                }
                this.currentStation = JSON.parse(JSON.stringify(station));
                await this.performAutoFetchInternal();
                if (this.currentStation.latitude) {
                    await this.http.put(`${this.apiUrl}/${this.currentStation._id}`, this.currentStation, this.getHeaders()).toPromise();
                }
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            this.notificationService.showSuccess('All stations synced successfully!');
            this.fetchStations();
        } catch (error) {
            console.error('Sync error:', error);
            this.notificationService.showError('Sync interrupted or failed');
        } finally {
            this.isSyncing = false;
            this.cdr.detectChanges();
        }
    }

    async autoFetchCoords() {
        if (!this.currentStation.name) {
            this.notificationService.showError('Please enter station name first');
            return;
        }
        this.notificationService.showSuccess('Fetching coordinates...');
        const found = await this.performAutoFetchInternal();
        if (!found) {
            this.notificationService.showError('Could not find location automatically');
        }
    }

    private async performAutoFetchInternal(): Promise<boolean> {
        const queries = [
            `${this.currentStation.name} railway station, India`,
            `${this.currentStation.name} station, India`,
            `${this.currentStation.name}, India`
        ];

        let found = false;
        for (const q of queries) {
            if (found) break;
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=10&addressdetails=1`;
            try {
                const res: any = await this.http.get(url).toPromise();
                if (res && res.length > 0) {
                    const stations = res.filter((r: any) => r.class === 'railway' || r.type === 'station');
                    const candidates = stations.length > 0 ? stations : res;
                    const r = this.currentStation.region;
                    let bestMatch = candidates[0];

                    if (r === 'South') bestMatch = candidates.find((c: any) => parseFloat(c.lat) < 20) || candidates[0];
                    else if (r === 'North') bestMatch = candidates.find((c: any) => parseFloat(c.lat) > 23) || candidates[0];
                    else if (r === 'West') bestMatch = candidates.find((c: any) => parseFloat(c.lon) < 76) || candidates[0];
                    else if (r === 'East') bestMatch = candidates.find((c: any) => parseFloat(c.lon) > 83) || candidates[0];

                    const address = bestMatch.address || {};
                    this.currentStation.latitude = parseFloat(bestMatch.lat);
                    this.currentStation.longitude = parseFloat(bestMatch.lon);
                    this.currentStation.city = address.city || address.town || address.village || address.municipality || address.city_district || address.district || '';
                    this.currentStation.state = address.state || address.province || address.state_district || '';

                    this.notificationService.showSuccess('GPS Coordinates found!');
                    this.cdr.detectChanges();
                    found = true;
                }
            } catch (e) {}
            if (!found) await new Promise(resolve => setTimeout(resolve, 300));
        }
        return found;
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
