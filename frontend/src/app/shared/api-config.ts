import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfig {
  // Base API URL - can be changed for different environments
  readonly apiUrl = 'http://localhost:5000/api';
}
