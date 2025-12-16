import { Routes } from '@angular/router';
import { AuthScreen } from './auth-screen/auth-screen';
import { Dashboard } from './dashboard/dashboard';
import { Citizen } from './citizen/citizen';

export const routes: Routes = [
  { path: '', component: AuthScreen },
  { path: 'dashboard', component: Dashboard },
  { path:'citizen', component:Citizen},
  { path: '**', redirectTo: '' }
];
