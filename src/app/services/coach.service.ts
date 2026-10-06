import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Athlete, PendingAthlete } from '../models/athlete';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/tecnico`;

  getMyAthletes(): Observable<Athlete[]> {
    return this.http.get<Athlete[]>(`${this.API_URL}/meus-atletas`);
  }

  addAthlete(athleteData: { name: string; dateOfBirth: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/adiconar-atleta`, athleteData);
  }

  generateInviteToken(): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.API_URL}/convites`, null);
  }

  getPendingAthletes(): Observable<PendingAthlete[]> {
    return this.http.get<PendingAthlete[]>(`${this.API_URL}/atletas/pendentes`);
  }

  approveAthlete(athleteId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/atletas/${athleteId}/aprovar`, null);
  }
}
