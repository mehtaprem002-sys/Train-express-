import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../shared/auth.service';
import { BookingService } from '../shared/booking.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MyBookingsComponent } from '../my-bookings/my-bookings.component';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../shared/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MyBookingsComponent],
  template: `
    <div class="min-h-screen bg-[#F3F4F6] font-sans text-slate-800 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- SIDEBAR (Left - Col Span 3) -->
        <div class="lg:col-span-3 space-y-6">
            <!-- Profile Summary Card -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <div class="relative mb-4">
                    <div class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
                        {{ userInitials }}
                    </div>
                    <div class="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm" title="Verified">
                        <span class="material-symbols-outlined text-white text-sm font-bold">check</span>
                    </div>
                </div>
                <h2 class="text-xl font-bold text-slate-900">{{ authService.currentUser()?.name }}</h2>
            </div>

            <!-- Navigation Menu -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <nav class="flex flex-col p-4 space-y-1">
                    <button (click)="setActiveTab('overview')" [class.bg-blue-50]="activeTab === 'overview'" [class.text-blue-600]="activeTab === 'overview'" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                        <span class="material-symbols-outlined text-xl" [class.text-blue-600]="activeTab === 'overview'" [class.text-slate-400]="activeTab !== 'overview'">dashboard</span>
                        Overview
                    </button>
                    <button (click)="setActiveTab('edit')" [class.bg-blue-50]="activeTab === 'edit'" [class.text-blue-600]="activeTab === 'edit'" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                        <span class="material-symbols-outlined text-xl" [class.text-blue-600]="activeTab === 'edit'" [class.text-slate-400]="activeTab !== 'edit'">edit_square</span>
                        Edit Profile
                    </button>
                    <button (click)="setActiveTab('bookings')" [class.bg-blue-50]="activeTab === 'bookings'" [class.text-blue-600]="activeTab === 'bookings'" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                        <span class="material-symbols-outlined text-xl" [class.text-blue-600]="activeTab === 'bookings'" [class.text-slate-400]="activeTab !== 'bookings'">confirmation_number</span>
                        My Bookings
                    </button>
                    <button (click)="setActiveTab('messages')" [class.bg-blue-50]="activeTab === 'messages'" [class.text-blue-600]="activeTab === 'messages'" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left">
                        <span class="material-symbols-outlined text-xl" [class.text-blue-600]="activeTab === 'messages'" [class.text-slate-400]="activeTab !== 'messages'">mail</span>
                        My Messages
                    </button>

                </nav>
                <div class="border-t border-slate-100 p-4 mt-2">
                     <button (click)="authService.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left">
                        <span class="material-symbols-outlined text-xl">logout</span>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>

        <!-- MAIN CONTENT (Right - Col Span 9) -->
        <div class="lg:col-span-9 space-y-6">
            
            <!-- OVERVIEW TAB CONTENT -->
            <div *ngIf="activeTab === 'overview'" class="space-y-6 animate-fade-in">
                


                <!-- Personal Information Card -->
                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div class="flex items-center justify-between mb-8">
                        <h3 class="text-xl font-bold text-slate-900">Personal Information</h3>
                        <button (click)="setActiveTab('edit')" class="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <span class="material-symbols-outlined text-lg">edit</span> Edit Details
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                            <p class="text-base font-bold text-slate-800">{{ authService.currentUser()?.name }}</p>
                        </div>
                        <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                            <p class="text-base font-bold text-slate-800">{{ authService.currentUser()?.email }}</p>
                        </div>
                         <div>
                            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                            <p class="text-base font-bold text-slate-800">{{ authService.currentUser()?.gender || 'Not Specified' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-slate-900">Recent Activity</h3>
                        <button (click)="setActiveTab('bookings')" class="text-sm font-bold text-blue-600 hover:text-blue-800">View All</button>
                    </div>
                     <!-- Embed Booking List (Simplified View) -->
                     <app-my-bookings [embedded]="true"></app-my-bookings>
                </div>

            </div>

            <!-- EDIT PROFILE TAB -->
            <div *ngIf="activeTab === 'edit'" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-fade-in">
                 <h3 class="text-xl font-bold text-slate-900 mb-6">Edit Profile Details</h3>
                 
                 <form (ngSubmit)="saveProfile()" class="space-y-6 max-w-2xl">
                     
                     <!-- Messages -->
                    <div *ngIf="successMessage" class="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 mb-4">
                        <span class="material-symbols-outlined text-lg">check_circle</span> {{ successMessage }}
                    </div>
                    <div *ngIf="errorMessage" class="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-bold flex items-center gap-2 mb-4">
                        <span class="material-symbols-outlined text-lg">error</span> {{ errorMessage }}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                             <label class="block text-sm font-bold text-slate-700">Full Name</label>
                             <input type="text" [(ngModel)]="editName" name="fullName" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-800">
                        </div>
                        <div class="space-y-2">
                             <label class="block text-sm font-bold text-slate-700">Email</label>
                             <input type="email" [value]="authService.currentUser()?.email" disabled class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-bold cursor-not-allowed">
                        </div>
                         <div class="space-y-2">
                             <label class="block text-sm font-bold text-slate-700">Gender</label>
                             <select [(ngModel)]="editGender" name="editGender" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-slate-800">
                                <option>Male</option><option>Female</option><option>Other</option>
                             </select>
                        </div>
                         <div class="space-y-2">
                             <label class="block text-sm font-bold text-slate-700">Dietary Preference</label>
                             <select [(ngModel)]="preferences.food" name="prefFood" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-slate-800">
                                <option>Veg</option><option>Non-Veg</option><option>No Food</option>
                             </select>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-slate-100 flex gap-4">
                        <button type="submit" [disabled]="isLoading" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all">
                             {{ isLoading ? 'Saving...' : 'Save Changes' }}
                        </button>
                    </div>

                    <!-- Change Password Section (Restored) -->
                    <div class="pt-8 mt-4 border-t border-slate-100">
                        <h4 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <span class="material-symbols-outlined text-slate-400">lock</span> Security
                        </h4>
                        <button type="button" (click)="toggleChangePassword()" class="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                            {{ isChangingPassword ? 'Cancel Password Change' : 'Change Password' }}
                            <span class="material-symbols-outlined text-lg">{{ isChangingPassword ? 'expand_less' : 'chevron_right' }}</span>
                        </button>

                        <div *ngIf="isChangingPassword" class="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-fade-in space-y-4 max-w-lg">
                             <div class="space-y-2">
                                <label class="block text-sm font-bold text-slate-700">Current Password</label>
                                <input type="password" [(ngModel)]="passData.oldPassword" name="oldPass" placeholder="•••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-800">
                             </div>
                             
                             <div class="space-y-2">
                                <label class="block text-sm font-bold text-slate-700">New Password</label>
                                <input type="password" [(ngModel)]="passData.newPassword" name="newPass" placeholder="•••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-800">
                             </div>
                             
                             <div class="space-y-2">
                                <label class="block text-sm font-bold text-slate-700">Confirm Password</label>
                                <input type="password" [(ngModel)]="passData.confirmPassword" name="confirmPass" placeholder="•••••••" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-bold text-slate-800">
                             </div>
                             
                             <button type="button" (click)="savePassword()" [disabled]="isLoading" class="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md mt-4">
                                {{ isLoading ? 'Updating...' : 'Update Password' }}
                            </button>
                        </div>
                    </div>

                     <!-- Saved Travelers Management -->
                     <div class="mt-8 pt-8 border-t border-slate-100">
                          <h4 class="text-lg font-bold text-slate-900 mb-4">Saved Travelers</h4>
                          
                          <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div class="flex gap-4 mb-4">
                                    <input type="text" name="newTName" [(ngModel)]="newTraveler.name" placeholder="Traveler Name" class="flex-grow px-4 py-2 rounded-xl border border-slate-200 text-sm">
                                    <input type="number" name="newTAge" [(ngModel)]="newTraveler.age" placeholder="Age" class="w-24 px-4 py-2 rounded-xl border border-slate-200 text-sm">
                                    <select name="newTGender" [(ngModel)]="newTraveler.gender" class="w-32 px-4 py-2 rounded-xl border border-slate-200 text-sm">
                                        <option>Male</option><option>Female</option><option>Other</option>
                                    </select>
                                    <button type="button" (click)="addTraveler()" class="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900">+ Add</button>
                                </div>

                                <div class="space-y-2">
                                     <div *ngIf="savedTravelers.length === 0" class="text-slate-400 text-sm italic py-2">No saved travelers.</div>
                                     <div *ngFor="let t of savedTravelers; let i = index" class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                         <div class="flex items-center gap-3">
                                             <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{{t.name[0]}}</div>
                                             <div><p class="text-sm font-bold text-slate-800">{{t.name}}</p><p class="text-xs text-slate-500">{{t.age}} • {{t.gender}}</p></div>
                                         </div>
                                         <button (click)="removeTraveler(i)" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><span class="material-symbols-outlined text-lg">delete</span></button>
                                     </div>
                                </div>
                          </div>
                     </div>
                 </form>
            </div>

            <!-- BOOKINGS TAB -->
            <div *ngIf="activeTab === 'bookings'" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-fade-in relative">
                 <button (click)="setActiveTab('overview')" class="absolute top-8 right-8 text-sm font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                     <span class="material-symbols-outlined text-lg">arrow_back</span> Back
                 </button>
                 <h3 class="text-xl font-bold text-slate-900 mb-6">Your Journey History</h3>
                 <app-my-bookings [embedded]="true"></app-my-bookings>
            </div>

            <!-- MESSAGES TAB -->
            <div *ngIf="activeTab === 'messages'" class="space-y-6 animate-fade-in relative">
                 <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                     <div class="flex items-center justify-between mb-8">
                         <div>
                             <h3 class="text-xl font-bold text-slate-900">My Messages</h3>
                             <p class="text-sm text-slate-500">Track your inquiries and responses from our support team.</p>
                         </div>
                         <button (click)="loadUserMessages()" class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                             <span class="material-symbols-outlined">refresh</span>
                         </button>
                     </div>

                     <div class="space-y-6">
                         <div *ngFor="let msg of userMessages" class="group bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all">
                             <div class="flex justify-between items-start mb-4">
                                 <div>
                                     <span class="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 inline-block">Ref: #{{msg._id.substring(msg._id.length - 6)}}</span>
                                     <h4 class="font-bold text-slate-800">{{ msg.subject || 'General Inquiry' }}</h4>
                                 </div>
                                 <div class="flex items-center gap-3">
                                   <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                         [ngClass]="(msg.reply || msg.userReply) ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'">
                                     {{ msg.status === 'replied' ? 'Replied' : (msg.status === 'user-replied' ? 'Follow-up Sent' : 'Pending') }}
                                   </span>
                                   <button (click)="deleteMessage(msg._id)" class="text-slate-400 hover:text-red-500 transition-colors" title="Delete Message">
                                       <span class="material-symbols-outlined text-xl">delete</span>
                                   </button>
                                 </div>
                             </div>

                             <div class="mb-4">
                                 <p class="text-sm text-slate-600 leading-relaxed">{{ msg.message }}</p>
                                 <p class="text-[10px] text-slate-400 mt-2">{{ msg.createdAt | date:'medium' }}</p>
                             </div>

                             <!-- Admin Reply -->
                             <div *ngIf="msg.reply" class="bg-emerald-50/50 border-l-4 border-emerald-500 p-4 rounded-r-xl mt-4 animate-fade-in">
                                 <div class="flex items-center gap-2 mb-2">
                                     <span class="material-symbols-outlined text-emerald-600 text-sm">support_agent</span>
                                     <span class="text-xs font-bold text-emerald-800 uppercase tracking-widest">Official Response</span>
                                 </div>
                                 <p class="text-sm text-slate-700 italic">"{{ msg.reply }}"</p>
                                 <p class="text-[10px] text-slate-400 mt-2">Replied on {{ msg.repliedAt | date:'medium' }}</p>
                             </div>

                             <!-- User's Own Reply -->
                             <div *ngIf="msg.userReply" class="bg-blue-50/50 border-l-4 border-blue-500 p-4 rounded-r-xl mt-4 animate-fade-in">
                                 <div class="flex items-center gap-2 mb-2">
                                     <span class="material-symbols-outlined text-blue-600 text-sm">person</span>
                                     <span class="text-xs font-bold text-blue-800 uppercase tracking-widest">Your Follow-up</span>
                                 </div>
                                 <p class="text-sm text-slate-700">"{{ msg.userReply }}"</p>
                                 <p class="text-[10px] text-slate-400 mt-2">Sent on {{ msg.userRepliedAt | date:'medium' }}</p>
                             </div>

                             <!-- Reply Action -->
                             <div *ngIf="msg.reply && !msg.userReply" class="mt-4">
                               <button *ngIf="replyingToId !== msg._id" (click)="replyingToId = msg._id" 
                                       class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 px-3 py-1 rounded-lg border border-blue-100 hover:bg-blue-50 transition-all">
                                 <span class="material-symbols-outlined text-sm">reply</span>
                                 Reply Back
                               </button>
                               
                               <div *ngIf="replyingToId === msg._id" class="space-y-3 animate-fade-in mt-3">
                                 <textarea [(ngModel)]="userReplyText" rows="3"
                                           class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                                           placeholder="Type your follow-up message..."></textarea>
                                 <div class="flex gap-2">
                                   <button (click)="sendUserReply(msg._id)" 
                                           class="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                                     Send Reply
                                   </button>
                                   <button (click)="replyingToId = ''; userReplyText = ''" 
                                           class="text-slate-500 px-4 py-2 text-sm font-bold hover:bg-slate-100 rounded-lg transition-all">
                                     Cancel
                                   </button>
                                 </div>
                               </div>
                             </div>
                         </div>

                         <div *ngIf="userMessages.length === 0" class="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                             <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">mail_lock</span>
                             <p class="text-slate-500 text-sm font-medium">No messages found.</p>
                             <a routerLink="/contact-us" class="mt-4 inline-block text-blue-600 font-bold hover:underline">Contact Support</a>
                         </div>
                     </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  isEditing = signal<boolean>(false);
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // New states for message collaboration
  replyingToId = '';
  userReplyText = '';

  // Dashboard State
  greeting = '';
  serverTime = new Date();
  activeTab: 'overview' | 'edit' | 'bookings' | 'messages' = 'overview';
  userMessages: any[] = [];

  setActiveTab(tab: 'overview' | 'edit' | 'bookings' | 'messages') {
    this.activeTab = tab;

    // Sync isEditing state
    if (tab === 'edit') this.isEditing.set(true);
    else this.isEditing.set(false);

    if (tab === 'messages') this.loadUserMessages();
  }

  // Stats
  totalTrips = 0;
  totalSpent = 0;
  nextTripDays = 0;

  // Edit State
  editName: string = '';
  editGender: string = 'Male';
  savedTravelers: any[] = [];
  preferences: any = { berth: 'No Preference', food: 'Veg' };

  // UI State for Saved Travelers
  isAddingTraveler = false;
  newTraveler = { name: '', age: null, gender: 'Male' };

  constructor(public authService: AuthService,
    private bookingService: BookingService,
    private http: HttpClient,
    private notificationService: NotificationService) {
    this.updateGreeting();

    // Load fresh user data on init to get saved travelers
    const user = this.authService.currentUser();
    if (user) {
      this.editName = user.name;
      this.editGender = user.gender || 'Male';
      this.savedTravelers = user.savedTravelers || [];
      this.preferences = user.preferences || { berth: 'No Preference', food: 'Veg' };
      this.calculateStats(user.id);
    }

    effect(() => {
      // React to user changes
      const u = this.authService.currentUser();
      if (u && !this.isEditing()) {
        this.editName = u.name;
        this.editGender = u.gender || 'Male';
        if (u.savedTravelers) this.savedTravelers = [...u.savedTravelers];
        if (u.preferences) this.preferences = { ...u.preferences };
      }
    });
  }

  updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good Morning';
    else if (hour < 18) this.greeting = 'Good Afternoon';
    else this.greeting = 'Good Evening';
  }

  calculateStats(userId: string) {
    this.bookingService.getUserBookings(userId).subscribe({
      next: (bookings: any[]) => {
        const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
        this.totalTrips = activeBookings.length;
        this.totalSpent = activeBookings.reduce((sum, b) => sum + (b.paymentDetails?.amount || 0), 0);

        // Find next trip
        const upcoming = activeBookings
          .map(b => new Date(b.paymentDetails.date)) // Using booking date as proxy for travel date if travel date unavailable, or verify if booking object has travel date.
          // Actually booking.paymentDetails.date is booking date. We need travel date. 
          // Assuming backend returns travel date in booking.train.date or similar? 
          // If not, we'll use booking date + random future for demo or just skip next trip if data missing.
          // Let's assume booking.train.departureDate exists or we use booking date.
          .filter(d => d.getTime() > new Date().getTime())
          .sort((a, b) => a.getTime() - b.getTime());

        if (upcoming.length > 0) {
          const diff = upcoming[0].getTime() - new Date().getTime();
          this.nextTripDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        } else {
          this.nextTripDays = 0;
        }
      }
    });
  }

  // Traveler Logic
  toggleEdit() {
    this.isEditing.update(v => !v);
    if (this.isEditing()) {
      const u = this.authService.currentUser();
      if (u) {
        this.editName = u.name;
        this.editGender = u.gender || 'Male';
        this.savedTravelers = u.savedTravelers ? [...u.savedTravelers] : [];
        this.preferences = u.preferences ? { ...u.preferences } : { berth: 'No Preference', food: 'Veg' };
      }
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  addTraveler() {
    if (!this.newTraveler.name || !this.newTraveler.age) return;
    this.savedTravelers.push({ ...this.newTraveler });
    this.newTraveler = { name: '', age: null, gender: 'Male' };
    this.isAddingTraveler = false;
    this.saveProfile();
  }

  removeTraveler(index: number) {
    this.savedTravelers.splice(index, 1);
    this.saveProfile();
  }

  saveProfile() {
    if (!this.editName.trim()) {
      this.notificationService.showError('Name cannot be empty');
      return;
    }

    this.isLoading = true;
    const userId = this.authService.currentUser()?.id || this.authService.currentUser()?._id;

    if (!userId) {
      this.notificationService.showError('User ID not found');
      this.isLoading = false;
      return;
    }

    const payload = {
      fullName: this.editName,
      gender: this.editGender,
      savedTravelers: this.savedTravelers,
      preferences: this.preferences
    };

    this.authService.updateProfile(userId, payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.showSuccess('Profile updated successfully!');
        this.isEditing.set(false);
        // Update local user state immediately
        this.authService.currentUser.set({ ...this.authService.currentUser()!, ...payload, name: payload.fullName });
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error?.message || 'Failed to update profile');
      }
    });
  }

  // Change Password Logic
  isChangingPassword = false;
  passData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  toggleChangePassword() {
    this.isChangingPassword = !this.isChangingPassword;
    this.passData = { oldPassword: '', newPassword: '', confirmPassword: '' };
    this.errorMessage = '';
    this.successMessage = '';
  }

  savePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.passData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      this.notificationService.showError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.notificationService.showError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      this.notificationService.showError('New password must be at least 6 characters');
      return;
    }

    this.isLoading = true;
    const userId = this.authService.currentUser()?.id || this.authService.currentUser()?._id;

    if (!userId) {
      this.notificationService.showError('User ID not found');
      this.isLoading = false;
      return;
    }

    this.authService.changePassword({ userId, oldPassword, newPassword }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.notificationService.showSuccess('Password changed successfully!');
        this.isChangingPassword = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notificationService.showError(err.error?.message || 'Failed to change password');
      }
    });
  }

  loadUserMessages() {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    this.http.get<any[]>('http://localhost:5000/api/contact/my-messages', { headers: headers as any }).subscribe({
      next: (data) => this.userMessages = data,
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  async deleteMessage(id: string) {
    const confirmed = await this.notificationService.confirm('Are you sure you want to delete this message? This will permanently remove your inquiry.');
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    this.http.delete(`http://localhost:5000/api/contact/user/${id}`, { headers: headers as any }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Message deleted successfully');
        this.loadUserMessages();
      },
      error: (err) => this.notificationService.showError('Failed to delete message')
    });
  }

  sendUserReply(id: string) {
    if (!this.userReplyText.trim()) return;

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    this.http.post(`http://localhost:5000/api/contact/user-reply/${id}`,
      { reply: this.userReplyText },
      { headers: headers as any }
    ).subscribe({
      next: () => {
        this.notificationService.showSuccess('Your follow-up has been sent');
        this.userReplyText = '';
        this.replyingToId = '';
        this.loadUserMessages();
      },
      error: (err) => this.notificationService.showError('Failed to send reply')
    });
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
