import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CallbackComponent } from './callback/callback.component';
import { BusinessComponent } from './dashboard/business/business.component';
import { CustomerSupportComponent } from './dashboard/customer-support/customer-support.component';

export const ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'dashboard/business', component: BusinessComponent },
  { path: 'dashboard/customersupport', component: CustomerSupportComponent },
  { path: '**', redirectTo: '' }
];
