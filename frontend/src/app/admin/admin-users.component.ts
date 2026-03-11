import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiConfig } from '../shared/api-config';
import { NotificationService } from '../shared/notification.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-6 animate-fade-in">
        <div>
             <h2 class="text-3xl font-bold text-slate-800 dark:text-white">User Management</h2>
             <p class="text-slate-500 mt-1">View registered customers.</p>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             <table class="w-full text-left text-sm">
                 <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200 dark:border-slate-700">
                     <tr>
                         <th class="px-6 py-4">Name</th>
                         <th class="px-6 py-4">Email</th>
                         <th class="px-6 py-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                     <tr *ngFor="let u of users" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                         <td class="px-6 py-4 font-bold text-slate-900 dark:text-white">{{ u.fullName || u.name }}</td>
                         <td class="px-6 py-4 text-slate-600 dark:text-slate-300">{{ u.email }}</td>
                         <td class="px-6 py-4 text-right">
                            <button (click)="deleteUser(u.id)" 
                                class="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-bold transition-colors">
                                Delete
                            </button>
                         </td>
                     </tr>
                 </tbody>
             </table>
        </div>
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
    users: any[] = [];

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfig,
        private notification: NotificationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    private getHeaders() {
        const token = localStorage.getItem('token');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return { headers };
    }

    loadUsers() {
        this.http.get<any[]>(`${this.apiConfig.apiUrl}/auth/users`, this.getHeaders()).subscribe({
            next: (data) => {
                this.users = data;
                this.cdr.detectChanges();
            },
            error: (err) => console.error(err)
        });
    }

    async deleteUser(userId: string) {
        const confirmed = await this.notification.confirm('Are you sure you want to delete this user? This action cannot be undone.');
        if (!confirmed) return;

        this.http.delete(`${this.apiConfig.apiUrl}/auth/users/${userId}`, this.getHeaders()).subscribe({
            next: () => {
                this.notification.showSuccess('User deleted successfully');
                this.loadUsers();
            },
            error: (err) => this.notification.showError('Failed to delete user')
        });
    }
}
