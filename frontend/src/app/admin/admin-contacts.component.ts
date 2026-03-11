import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../shared/notification.service';

@Component({
  selector: 'app-admin-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 min-h-screen py-8">
      <div class="sm:flex sm:items-center mb-8">
        <div class="sm:flex-auto">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Inbound Messages</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage user inquiries, send replies, and track communication status.</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 gap-6">
        <div *ngFor="let contact of contacts()" 
             class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <span class="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white">{{ contact.name }}</h3>
                  <p class="text-xs text-slate-500">{{ contact.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="contact.status === 'replied' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'">
                  {{ contact.status || 'pending' }}
                </span>
                <button (click)="deleteMessage(contact._id || contact.id)" 
                        class="text-slate-400 hover:text-red-500 transition-colors">
                  <span class="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</p>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ contact.subject || 'General Inquiry' }}</p>
            </div>

            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mb-4">
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ contact.message }}</p>
              <p class="text-[10px] text-slate-400 mt-2">{{ contact.createdAt | date:'medium' }}</p>
            </div>

            <!-- User Follow-up -->
            <div *ngIf="contact.userReply" class="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50/30">
              <p class="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">User's Follow-up</p>
              <p class="text-sm text-slate-700 dark:text-slate-300">"{{ contact.userReply }}"</p>
              <p class="text-[10px] text-slate-400 mt-1">{{ contact.userRepliedAt | date:'medium' }}</p>
            </div>

            <!-- Reply Action -->
            <div *ngIf="!contact.reply" class="mt-4">
              <button *ngIf="selectedId !== contact._id" (click)="selectedId = contact._id" 
                      class="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">reply</span>
                Send Reply
              </button>
              
              <div *ngIf="selectedId === contact._id" class="space-y-3 animate-fade-in">
                <textarea [(ngModel)]="replyText" rows="3"
                          class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                          placeholder="Type your response..."></textarea>
                <div class="flex gap-2">
                  <button (click)="sendReply(contact._id)" 
                          class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                    Send
                  </button>
                  <button (click)="selectedId = ''; replyText = ''" 
                          class="text-slate-500 px-4 py-2 text-sm font-bold hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="contacts().length === 0" class="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200">
           <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">mail_lock</span>
           <p class="text-slate-500 font-medium">No messages in your inbox yet.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  `]
})
export class AdminContactsComponent implements OnInit {
  contacts = signal<any[]>([]);
  selectedId = '';
  replyText = '';

  constructor(private http: HttpClient, private notificationService: NotificationService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.fetchContacts();
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers };
  }

  fetchContacts() {
    this.http.get<any[]>('http://localhost:5000/api/contact', this.getHeaders()).subscribe({
      next: (data) => {
        this.contacts.set(data);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching contacts:', err)
    });
  }

  sendReply(id: string) {
    if (!this.replyText) return;

    this.http.post(`http://localhost:5000/api/contact/reply/${id}`, { reply: this.replyText }, this.getHeaders()).subscribe({
      next: () => {
        this.notificationService.showSuccess('Reply sent successfully');
        this.replyText = '';
        this.selectedId = '';
        this.fetchContacts();
      },
      error: (err) => this.notificationService.showError('Failed to send reply')
    });
  }

  async deleteMessage(id: string) {
    const confirmed = await this.notificationService.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    this.http.delete(`http://localhost:5000/api/contact/${id}`, this.getHeaders()).subscribe({
      next: () => {
        this.notificationService.showSuccess('Message deleted successfully');
        this.fetchContacts();
      },
      error: (err) => this.notificationService.showError('Failed to delete message')
    });
  }
}
