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
    if (!this.loginData.login || !this.loginData.password) return;

    const payload: LoginRequest = {
      login: this.loginData.login,
      password: this.loginData.password
    }

    this.authService.login(payload).subscribe({
      next: (response) => {
        console.log("Login feito com sucesso!");
      },
      error: (err) => {
        let errorMessage = 'Login ou senha inválido';
        if (err.error && err.error.detail) {
          errorMessage = err.error.detail; 
        }

        this.triggerPopup('error', 'Não foi possivel logar.', errorMessage);
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerPassword !== this.confirmPassword) return;

    const payload: RegisterRequest = {
      login: this.registerEmail,
      password: this.registerPassword,
      role: 'tecnico',
      name: this.registerName,
      team: this.registerTeam
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.triggerPopup('success', 'Conta Criada!', 'Conta criada com sucesso! Faça login para continuar.');
        this.isLoginMode = true;
        
        this.registerName = '';
        this.registerEmail = '';
        this.registerTeam = '';
        this.registerPassword = '';
        this.confirmPassword = '';
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


  toggleMode(loginMode: boolean): void {
    this.isLoginMode = loginMode;
    this.registerName = '';
    this.registerEmail = '';
    this.registerTeam = '';
    this.registerPassword = '';
    this.confirmPassword = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ── VALIDAÇÕES EM TEMPO REAL ──
  get hasMinLength(): boolean {
    return this.registerPassword.length >= 8;
  }

  get hasNumber(): boolean {
    return /\d/.test(this.registerPassword); // Verifica se tem dígito
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.registerPassword); // Verifica caractere especial
  }

  get passwordsMatch(): boolean {
    return this.registerPassword !== '' && this.registerPassword === this.confirmPassword;
  }
}