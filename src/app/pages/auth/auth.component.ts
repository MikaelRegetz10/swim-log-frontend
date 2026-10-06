import { Component, OnInit, OnDestroy, Renderer2, Inject, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode: boolean = true;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false; 
  selectedPlan: string = 'starter';

  loginData = { login: '', password: ''};

  registerName = '';
  registerEmail = '';
  registerTeam = '';
  registerPassword = '';
  confirmPassword = '';
  acceptTerms = false;

  // Flags para acionar validação visual apenas após envio
  loginSubmitted = false;
  registerSubmitted = false;

  showPopup = false;
  popupType: 'success' | 'error' = 'success';
  popupTitle = '';
  popupMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: any
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(this.document.body, 'auth-page');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(this.document.body, 'auth-page');
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

  onLoginSubmit(): void {
    this.loginSubmitted = true;
    if (!this.loginData.login || !this.loginData.password) return;

    const payload: LoginRequest = {
      login: this.loginData.login,
      password: this.loginData.password
    };

    this.authService.login(payload).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        let errorMessage = 'Login ou senha inválido';
        if (err.error && err.error.detail) {
          errorMessage = err.error.detail; 
        }
        this.triggerPopup('error', 'Não foi possível logar.', errorMessage);
      }
    });
  }

  onRegisterSubmit(): void {
    this.registerSubmitted = true;

    if (!this.registerName.trim() || !this.registerTeam.trim()) {
      this.triggerPopup('error', 'Campos obrigatórios', 'Por favor, preencha todos os campos do formulário.');
      return;
    }

    if (!this.isEmailValid) {
      this.triggerPopup('error', 'E-mail inválido', 'Por favor, insira um endereço de e-mail válido.');
      return;
    }

    if (!this.isPasswordValid) {
      this.triggerPopup('error', 'Senha fraca', 'A senha precisa atender a todos os requisitos de segurança.');
      return;
    }

    if (!this.passwordsMatch) {
      this.triggerPopup('error', 'Senhas não coincidem', 'A confirmação de senha deve ser igual à senha cadastrada.');
      return;
    }

    if (!this.acceptTerms) {
      this.triggerPopup('error', 'Termos de Uso', 'Você precisa aceitar os Termos de Uso para criar uma conta.');
      return;
    }

    const payload: RegisterRequest = {
      login: this.registerEmail,
      password: this.registerPassword,
      role: 'tecnico',
      name: this.registerName,
      team: this.registerTeam
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.triggerPopup('success', 'Conta Criada!', 'Conta criada com sucesso! Faça login para continuar.');
        this.isLoginMode = true;
        this.resetForms();        
      },
      error: (err) => {
        console.error('Erro no cadastro:', err);
        let errorMessage = 'Erro ao registrar técnico. Verifique os dados enviados.';
        if (err.error && err.error.detail) {
          errorMessage = err.error.detail; 
        }
        this.triggerPopup('error', 'Não foi possível cadastrar', errorMessage);
      }
    });
  }

  private resetForms(): void {
    this.registerName = '';
    this.registerEmail = '';
    this.registerTeam = '';
    this.registerPassword = '';
    this.confirmPassword = '';
    this.acceptTerms = false;
    this.loginData.login = '';
    this.loginData.password = '';
    this.loginSubmitted = false;
    this.registerSubmitted = false;
  }

  toggleMode(loginMode: boolean): void {
    this.isLoginMode = loginMode;
    this.resetForms();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ── VALIDAÇÕES ──
  get isEmailValid(): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(this.registerEmail.trim());
  }

  get hasMinLength(): boolean {
    return this.registerPassword.length >= 8;
  }

  get hasNumber(): boolean {
    return /\d/.test(this.registerPassword);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.registerPassword);
  }

  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasNumber && this.hasSpecialChar;
  }

  get passwordsMatch(): boolean {
    return this.registerPassword !== '' && this.registerPassword === this.confirmPassword;
  }
}