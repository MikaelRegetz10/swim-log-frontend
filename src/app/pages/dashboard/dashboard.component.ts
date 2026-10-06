import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CoachService } from '../../services/coach.service';
import { Athlete, PendingAthlete } from '../../models/athlete';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private coachService = inject(CoachService);
  private platformId = inject(PLATFORM_ID);

  athletesList: Athlete[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  activeTab: string = 'dashboard';

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
      this.loadPendingAthletes();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.coachService.getMyAthletes().subscribe({
      next: (data) => {
        this.athletesList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar atletas:', err);
        this.errorMessage = 'Não foi possível carregar os dados do painel.';
        this.isLoading = false;
      }
    });
  }

  calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  changeTab(tabName: string): void {
    this.activeTab = tabName;
  }


  pendingAthletesList: PendingAthlete[] = [];
  generatedInviteUrl: string = '';
  showInviteModal: boolean = false;

  loadPendingAthletes(): void {
    this.coachService.getPendingAthletes().subscribe({
      next: (data) => this.pendingAthletesList = data,
      error: (err) => console.error('Erro ao buscar fila pendente:', err)
    });
  }

  onGenerateInviteClick(): void {
    this.coachService.generateInviteToken().subscribe({
      next: (res) => {
        if (typeof window !== 'undefined') {
          const baseUrl = window.location.origin; 
          const token = res.url.split('token=')[1];
          this.generatedInviteUrl = `${baseUrl}/invite?token=${token}`;
          this.showInviteModal = true;
        }
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || 'Assinatura inválida para geração de convites.');
      }
    });
  }

  onApproveAthlete(id: number): void {
    this.coachService.approveAthlete(id).subscribe({
      next: () => {
        this.pendingAthletesList = this.pendingAthletesList.filter(a => a.id !== id);
        this.loadDashboardData();
      },
      error: (err) => {
        alert(err.error?.message || 'Erro ao aprovar o atleta.');
      }
    });
  }

  copyInviteToClipboard(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.generatedInviteUrl);
      alert('Link de convite copiado para a área de transferência!');
    }
  }
}
