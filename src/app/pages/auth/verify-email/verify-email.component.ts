import { Component, OnInit, OnDestroy, Renderer2, inject, PLATFORM_ID } from '@angular/core'; 
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  verificationStatus: 'LOADING' | 'SUCCESS' | 'ERROR' = 'LOADING';
  backendMessage: string = 'Verificando suas credenciais de acesso...';

  emailInput: string = '';
  isResending: boolean = false;

  // Estados do Pop-up Customizado de Notificação
  showPopup = false;
  popupType: 'success' | 'error' = 'success';
  popupTitle = '';
  popupMessage = '';

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.document && this.document.body) {
        this.renderer.addClass(this.document.body, 'auth-page');
      }
    }

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        if (isPlatformBrowser(this.platformId)) {
          this.executeVerification(token);
        }
      } else {
        this.verificationStatus = 'ERROR';
        this.backendMessage = 'Código de verificação ausente ou corrompido.';
      }
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.document && this.document.body) {
        this.renderer.removeClass(this.document.body, 'auth-page');
      }
    }
  }

  private executeVerification(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response: any) => {
        this.verificationStatus = 'SUCCESS';
        this.backendMessage = response.message;
      },
      error: (err) => {
        this.verificationStatus = 'ERROR';
        
        // 🔑 CORREÇÃO: Puxa o texto de 'message' do seu RestResponseMessage do Java
        if (err.error && err.error.message) {
          this.backendMessage = err.error.message;
        } else if (err.error && err.error.detail) {
          this.backendMessage = err.error.detail;
        } else {
          this.backendMessage = 'Não foi possível verificar o e-mail.';
        }
      }
    });
  }

  get isEmailValid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.emailInput);
  }

  onResendSubmit(): void {
    if (!this.emailInput || !this.isEmailValid) return;
    if (!this.emailInput) return;
    this.isResending = true;

    this.authService.resendVerification(this.emailInput).subscribe({
      next: (response: any) => {
        this.isResending = false;
        // Abre o pop-up avisando que o e-mail foi enviado com sucesso
        this.triggerPopup('success', 'E-mail Enviado!', response.message);
        this.emailInput = '';
      },
      error: (err) => {
        this.isResending = false;
        
        // 🔑 CORREÇÃO: Puxa a mensagem de erro direto do RestResponseMessage do Java
        let errorMessage = 'Não foi possível reenviar o e-mail de verificação.';
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.detail) {
          errorMessage = err.error.detail;
        }

        this.triggerPopup('error', 'Houve um problema', errorMessage);
      }
    });
  }

  triggerPopup(type: 'success' | 'error', title: string, message: string): void {
    this.popupType = type;
    this.popupTitle = title;
    this.popupMessage = message;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }
}