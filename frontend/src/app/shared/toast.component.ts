import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <div *ngFor="let toast of notificationService.toasts()" 
             class="pointer-events-auto min-w-[300px] p-4 rounded-xl shadow-2xl transition-all animate-fade-in-slide"
             [ngClass]="{
                'bg-white border border-slate-200 border-l-4 border-l-green-500 text-slate-900': toast.type === 'success',
                'bg-white border border-slate-200 border-l-4 border-l-red-500 text-slate-900': toast.type === 'error'
             }">
            <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl" 
                      [class.text-green-600]="toast.type === 'success'"
                      [class.text-red-600]="toast.type === 'error'">
                    {{ toast.type === 'success' ? 'check_circle' : 'error' }}
                </span>
                <p class="font-medium text-sm">{{ toast.message }}</p>
                <button (click)="notificationService.removeToast(toast.id)" class="ml-auto opacity-70 hover:opacity-100">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
        </div>
    </div>
    `
})
export class ToastComponent {
    constructor(public notificationService: NotificationService) { }
}
