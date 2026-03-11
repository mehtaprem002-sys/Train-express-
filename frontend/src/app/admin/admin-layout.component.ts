import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterOutlet],
    template: `
    <div class="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans">
      <!-- Sidebar -->
      <aside class="w-64 bg-[#0a2540] text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl z-20">
        <div class="p-6 flex items-center gap-3">
            <div class="bg-white/10 p-2 rounded-lg">
                <span class="material-symbols-outlined text-white text-2xl">train</span>
            </div>
            <div>
                 <h1 class="text-lg font-bold tracking-tight leading-tight">TrainExpress</h1>
                 <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise Admin</p>
            </div>
        </div>

        <nav class="flex-1 overflow-y-auto py-4 px-4 space-y-1">
           <a routerLink="/admin/dashboard" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">dashboard</span>
              <span class="font-semibold text-sm">Dashboard</span>
           </a>
           <a routerLink="/admin/trains" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">train</span>
              <span class="font-semibold text-sm">Manage Trains</span>
           </a>
           <a routerLink="/admin/stations" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">location_on</span>
              <span class="font-semibold text-sm">Stations</span>
           </a>
           <a routerLink="/admin/bookings" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">confirmation_number</span>
              <span class="font-semibold text-sm">Bookings</span>
           </a>
           <a routerLink="/admin/users" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">group</span>
              <span class="font-semibold text-sm">Users</span>
           </a>
           <a routerLink="/admin/messages" routerLinkActive="bg-white/10 text-white shadow-sm" 
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
              <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">mail</span>
              <span class="font-semibold text-sm">Messages</span>
           </a>
        </nav>

        <!-- Sidebar Footer/User Profile -->
        <div class="p-4 border-t border-white/5 mt-auto">
           <div class="flex items-center gap-3 px-2 py-3">
              <div class="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0">
                  SA
              </div>
              <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold truncate">System Administrator</p>
                  <p class="text-[10px] text-slate-500 truncate">Admin Dashboard</p>
              </div>
              <button (click)="logout()" class="text-slate-500 hover:text-red-400 transition-colors">
                  <span class="material-symbols-outlined">logout</span>
              </button>
           </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <!-- Modern Top Header -->
        <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-end z-10">
            <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                    <p class="text-xs font-bold text-slate-800 dark:text-white">{{ today | date:'MMM d, yyyy' }}</p>
                </div>
            </div>
        </header>

        <!-- Main Body -->
        <div class="flex-1 overflow-y-auto p-8 lg:p-10">
            <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
    today = new Date();
    constructor(private router: Router) { }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        this.router.navigate(['/admin/login']);
    }
}
