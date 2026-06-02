import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { ComoFuncionaComponent } from './components/como-funciona/como-funciona.component';
import { RecursosComponent } from './components/recursos/recursos.component';
import { PlanosComponent } from './components/planos/planos.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent, 
    HeroComponent, 
    ComoFuncionaComponent,
    RecursosComponent,
    PlanosComponent,
    FooterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
