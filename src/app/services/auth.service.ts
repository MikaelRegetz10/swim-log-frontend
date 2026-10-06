import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { Observable, tap } from 'rxjs';
import { response } from 'express';
import { InviteValidationResponse } from '../models/invite-validation-response';

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
      localStorage.removeItem("swimlog_token");
    }
  }

  verifyEmail(token: string): Observable<{ message: string; status: string }>{
    const params = new HttpParams().set('token', token);

    return this.http.post<{ message: string; status: string}>(
      `${this.API_URL}/verify-email`,
      null,
      { params }
    )
  }


  resendVerification(email: string): Observable<{ message: string; status: string }> {
    const params = new HttpParams().set('email', email);
    
    return this.http.post<{ message: string; status: string }>(
      `${this.API_URL}/resend-verification`, 
      null, 
      { params }
    );
  }

  validateInviteToken(token: string): Observable<InviteValidationResponse> {
    return this.http.get<InviteValidationResponse>(`${this.API_URL}/invite/validate`, {
      params: { token }
    });
  }

  registerAthleteViaInvite(payload: any): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/registrar-atleta-via-convite`, payload);
  }
}
