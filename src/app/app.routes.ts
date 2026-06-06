import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent
    },
    { 
        path: 'login', 
        component: AuthComponent
    },
    {
        path: 'verify-email',
        component: VerifyEmailComponent
    }
];
