import { Injectable, signal } from '@angular/core';

export interface Toast {
    message: string;
    type: 'success' | 'error';
    id: number;
}

export interface ConfirmDialog {
    message: string;
    resolve: (result: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    toasts = signal<Toast[]>([]);
    confirmDialog = signal<ConfirmDialog | null>(null);
    private toastId = 0;

    showSuccess(message: string) {
        this.addToast(message, 'success');
    }

    showError(message: string) {
        this.addToast(message, 'error');
    }

    private addToast(message: string, type: 'success' | 'error') {
        const id = this.toastId++;
        this.toasts.update(toasts => [...toasts, { message, type, id }]);

        // Auto remove
        setTimeout(() => {
            this.removeToast(id);
        }, 3000);
    }

    removeToast(id: number) {
        this.toasts.update(toasts => toasts.filter(t => t.id !== id));
    }

    confirm(message: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.confirmDialog.set({
                message,
                resolve: (result: boolean) => {
                    this.confirmDialog.set(null);
                    resolve(result);
                }
            });
        });
    }
}
