import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { Observable, tap } from 'rxjs';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;  
  
  login(credentials: LoginRequest): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/registro`, userData);
  }

  private saveToken(token: string): void {
    if (typeof window !== 'undefined'){
      localStorage.setItem('swinlog_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined'){
      return localStorage.getItem('swimlog_token');
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined'){
      localStorage.removeItem("swimlog_token")
    }
  }

}
