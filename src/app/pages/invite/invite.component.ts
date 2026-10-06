import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.scss'
})
export class InviteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  screenState: 'VALIDATING' | 'FORM' | 'SUCCESS' | 'ERROR' = 'VALIDATING';
  errorMessage: string = '';
  
  // Dados do clube retornados pela API
  coachName: string = '';
  teamName: string = '';
  token: string = '';

  // Payload do Atleta
  athleteData = {
    name: '',
    email: '',
    password: '',
    dateOfBirth: ''
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token && isPlatformBrowser(this.platformId)) {
        this.verifyToken();
      } else if (isPlatformBrowser(this.platformId)) {
        this.setInternalError('Link de convite inválido ou ausente.');
      }
    });
  }

  private verifyToken(): void {
    this.authService.validateInviteToken(this.token).subscribe({
      next: (res) => {
        this.coachName = res.coachName;
        this.teamName = res.teamName;
        this.screenState = 'FORM';
      },
      error: (err) => {
        this.setInternalError(err.error?.message || 'Este convite expirou ou já atingiu o limite de usos.');
      }
    });
  }

  onAthleteRegister(): void {
    const payload = {
      token: this.token,
      ...this.athleteData
    };

    this.authService.registerAthleteViaInvite(payload).subscribe({
      next: () => {
        this.screenState = 'SUCCESS';
      },
      error: (err) => {
        this.setInternalError(err.error?.message || 'Houve um problema ao efetuar seu cadastro.');
      }
    });
  }

  private setInternalError(msg: string): void {
    this.errorMessage = msg;
    this.screenState = 'ERROR';
  }

}
