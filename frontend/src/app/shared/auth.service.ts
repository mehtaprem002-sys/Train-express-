import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/api/auth';
    // Signal to track login state
    isLoggedIn = signal<boolean>(false);
    currentUser = signal<any>(null);

    constructor(private router: Router, private http: HttpClient) {
        if (typeof localStorage !== 'undefined') {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (savedUser && token) {
                this.isLoggedIn.set(true);
                this.currentUser.set(JSON.parse(savedUser));
            } else if (savedUser) {
                // Clear broken session
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }

    register(userData: any) {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    login(credentials: any, returnUrl: string = '/') {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: any) => {
                this.isLoggedIn.set(true);
                this.currentUser.set(response.user);
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(response.user));
                    localStorage.setItem('token', response.token);
                }
                this.router.navigateByUrl(returnUrl);
            })
        );
    }

    logout() {
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        this.router.navigate(['/login']);
    }

    verifyEmail(email: string) {
        return this.http.post(`${this.apiUrl}/verify-email`, { email });
    }

    resetPassword(email: string, newPassword: string) {
        return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword });
    }

    changePassword(data: any) {
        return this.http.post(`${this.apiUrl}/change-password`, data);
    }

    updateProfile(userId: string, data: any) {
        return this.http.put(`${this.apiUrl}/users/${userId}`, data).pipe(
            tap((response: any) => {
                // Update local state
                this.currentUser.set(response.user);
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
            })
        );
    }

    // ADMIN: Get All Users
    getAllUsers(): Observable<any> {
        return this.http.get(`${this.apiUrl}/users`);
    }

    // ADMIN: Delete User
    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${userId}`);
    }
}
