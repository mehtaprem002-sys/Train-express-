import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TrainService {
    private apiUrl = 'http://localhost:5000/api/trains';

    constructor(private http: HttpClient) { }

    getStations(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/stations`);
    }

    searchTrains(from: string, to: string, date: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/search`, {
            params: { from, to, date }
        });
    }

    getLiveStatus(trainNumber: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/live-status/${trainNumber}`);
    }
}

