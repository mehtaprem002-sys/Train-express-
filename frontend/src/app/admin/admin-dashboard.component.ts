import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../shared/notification.service';
import { Router } from '@angular/router';
import { AdminTrainsComponent } from './admin-trains.component';
import { AdminStationsComponent } from './admin-stations.component';
import { AdminUsersComponent } from './admin-users.component';
import { AdminContactsComponent } from './admin-contacts.component';
import { AdminBookingsComponent } from './admin-bookings.component';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, AdminTrainsComponent, AdminStationsComponent, AdminUsersComponent, AdminContactsComponent, AdminBookingsComponent],
    templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
    activeTab: 'overview' | 'trains' | 'stations' | 'users' | 'bookings' | 'messages' = 'overview';

    bookingsCount = signal(0);
    revenueTotal = signal(0);
    trainsCount = signal(0);
    usersCount = signal(0);
    stationsCount = signal(0);

    recentBookings = signal<any[]>([]);
    users = signal<any[]>([]);
    allBookings = signal<any[]>([]);
    messages = signal<any[]>([]);
    replyText = '';
    selectedMessage: any = null;
    errorMessage = signal('');

    constructor(private http: HttpClient, private notificationService: NotificationService, private cdr: ChangeDetectorRef, private router: Router) { }

    ngOnInit() {
        this.fetchStats();
        this.loadMessages();
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

    fetchStats() {
        this.errorMessage.set('');

        // Fetch Trains
        this.http.get<any[]>('http://localhost:5000/api/trains/admin/all', this.getHeaders()).subscribe({
            next: (trains) => {
                this.trainsCount.set(trains.length);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching trains:', err);
                this.errorMessage.set(`Error fetching trains: ${err.status}`);
                this.handleAuthError(err);
                this.cdr.detectChanges();
            }
        });

        // Fetch Users
        this.http.get<any[]>('http://localhost:5000/api/auth/users', this.getHeaders()).subscribe({
            next: (data) => {
                this.usersCount.set(data.length);
                this.users.set(data);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching users:', err);
                this.errorMessage.set(`Error fetching users: ${err.status}`);
                this.handleAuthError(err);
                this.cdr.detectChanges();
            }
        });

        // Fetch Stations
        this.http.get<any[]>('http://localhost:5000/api/trains/admin/stations', this.getHeaders()).subscribe({
            next: (stations) => {
                this.stationsCount.set(stations.length);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching stations:', err);
                this.errorMessage.set(`Error fetching stations: ${err.status}`);
                this.handleAuthError(err);
                this.cdr.detectChanges();
            }
        });

        // Fetch Bookings
        this.http.get<any[]>('http://localhost:5000/api/bookings/all', this.getHeaders()).subscribe({
            next: (bookings) => {
                const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
                const revenue = activeBookings.reduce((sum, b) => sum + (b.paymentDetails?.amount || 0), 0);

                this.bookingsCount.set(activeBookings.length);
                this.revenueTotal.set(revenue);
                this.allBookings.set(bookings.map(b => ({
                    ...b,
                    travelDate: b.date || b.travelDate
                })));

                this.recentBookings.set(activeBookings.slice(0, 5).map(b => ({
                    ...b,
                    avatar: `https://ui-avatars.com/api/?name=${b.user?.name || 'Guest'}&background=random`,
                    memberType: b.user?.role === 'ADMIN' ? 'Premium Member' : 'Standard User'
                })));
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error fetching bookings:', err);
                this.errorMessage.set(`Error fetching bookings: ${err.status}`);
                this.handleAuthError(err);
                this.cdr.detectChanges();
            }
        });
    }

    async deleteUser(userId: string) {
        const confirmed = await this.notificationService.confirm('Are you sure you want to delete this user?');
        if (!confirmed) return;
        this.http.delete(`http://localhost:5000/api/auth/users/${userId}`, this.getHeaders()).subscribe({
            next: () => {
                this.notificationService.showSuccess('User deleted successfully');
                this.fetchStats();
            },
            error: (err) => this.notificationService.showError('Failed to delete user')
        });
    }

    async cancelBooking(bookingId: string) {
        const confirmed = await this.notificationService.confirm('Are you sure you want to cancel this booking?');
        if (!confirmed) return;

        this.http.post(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {}, this.getHeaders()).subscribe({
            next: () => {
                this.notificationService.showSuccess('Booking cancelled successfully');
                this.fetchStats();
            },
            error: (err) => this.notificationService.showError('Failed to cancel booking')
        });
    }

    loadMessages() {
        this.http.get<any[]>('http://localhost:5000/api/contact', this.getHeaders()).subscribe({
            next: (data: any) => {
                this.messages.set(data);
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load messages', err)
        });
    }

    replyToMessage() {
        if (!this.replyText || !this.selectedMessage) return;

        this.http.post(`http://localhost:5000/api/contact/reply/${this.selectedMessage._id || this.selectedMessage.id}`,
            { reply: this.replyText }, this.getHeaders()).subscribe({
                next: () => {
                    this.notificationService.showSuccess('Reply sent successfully');
                    this.replyText = '';
                    this.selectedMessage = null;
                    this.loadMessages();
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
                this.loadMessages();
            },
            error: (err) => this.notificationService.showError('Failed to delete message')
        });
    }

    setActiveTab(tab: any) {
        this.activeTab = tab;
        this.cdr.detectChanges();
    }

    private handleAuthError(err: any) {
        if (err.status === 401) {
            this.notificationService.showError('Session expired. Please login again.');
            this.logout();
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        this.router.navigate(['/admin/login']);
    }
}
