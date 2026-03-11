import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl = 'http://localhost:5000/api/bookings';

    constructor(private http: HttpClient) { }

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

    createBooking(bookingData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, bookingData, this.getHeaders());
    }

    getUserBookings(userId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`, this.getHeaders());
    }

    getBookingByPnr(pnr: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/pnr/${pnr}`, this.getHeaders());
    }

    cancelBooking(id: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cancel/${id}`, {}, this.getHeaders());
    }

    deleteBooking(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders());
    }

    deleteBookingAdmin(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/admin/${id}`, this.getHeaders());
    }

    downloadTicket(id: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, { ...this.getHeaders(), responseType: 'blob' });
    }

    getBookedSeats(trainNumber: string, date: string, classType: string): Observable<number[]> {
        return this.http.get<number[]>(`${this.apiUrl}/seats/booked`, {
            params: { trainNumber, date, classType },
            ...this.getHeaders()
        });
    }
}
