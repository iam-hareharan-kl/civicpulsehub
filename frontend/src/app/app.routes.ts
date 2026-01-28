import { Routes } from '@angular/router';
import { AuthScreen } from './auth-screen/auth-screen';
import { Dashboard } from './dashboard/dashboard';
import { Citizen } from './citizen/citizen';
import { Officer } from './officer/officer';
import { ResetPasswordComponent } from './auth-screen/reset-password';

export const routes: Routes = [
  { path: '', component: AuthScreen },
  { path: 'admin', component: Dashboard },
  { path:'citizen', component:Citizen},
  { path: 'officer', component: Officer },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', redirectTo: '' }
];
