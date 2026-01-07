import { Routes } from '@angular/router';
import { AuthScreen } from './auth-screen/auth-screen';
import { Admin } from './dashboard/dashboard';
import { Citizen } from './citizen/citizen';
import { Officer } from './officer/officer';

export const routes: Routes = [
  { path: '', component: AuthScreen },
  { path: 'admin', component: Admin },
  { path:'citizen', component:Citizen},
  { path: 'officer', component: Officer },
  { path: '**', redirectTo: '' }
];
