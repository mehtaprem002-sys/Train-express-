import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="notificationService.confirmDialog() as dialog" 
         class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700 transform scale-100 transition-all">
            <div class="flex items-center gap-4 mb-4">
                <div class="h-10 w-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <span class="material-symbols-outlined">warning</span>
                </div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-white">Confirm Action</h3>
            </div>
            
            <p class="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                {{ dialog.message }}
            </p>

            <div class="flex justify-end gap-3">
                <button (click)="dialog.resolve(false)" 
                    class="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                </button>
                <button (click)="dialog.resolve(true)" 
                    class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity">
                    Confirm
                </button>
            </div>
        </div>
    </div>
    `
})
export class ConfirmModalComponent {
    constructor(public notificationService: NotificationService) { }
}
