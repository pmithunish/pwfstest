import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';

import { ROUTES } from './app.routes';

import { AuthHttp, AuthConfig } from 'angular2-jwt';

import { AuthService } from './auth/auth.service';
import { CallbackComponent } from './callback/callback.component';

//Services
import { PerilwiseService } from "./services/perilwise.service";

//Material Design Imports
import {MdToolbarModule, MdIconModule, MdButtonModule, MdDialogModule, MdListModule} from '@angular/material';
import {DataTableModule,SharedModule} from 'primeng/primeng';
import { BusinessComponent } from './dashboard/business/business.component';
import { CustomerSupportComponent, ClaimStatusCloseDialog, ClaimStatusReopenDialog } from './dashboard/customer-support/customer-support.component';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
		globalHeaders: [{'Content-Type':'application/json'}],
    tokenGetter: (() => localStorage.getItem('access_token'))
  }), http, options);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CallbackComponent,
    BusinessComponent,
    CustomerSupportComponent,
    ClaimStatusCloseDialog,
    ClaimStatusReopenDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
    MdToolbarModule,
    MdIconModule,
    MdButtonModule,
    DataTableModule,
    SharedModule,
    MdDialogModule,
    MdListModule
  ],
  providers: [AuthService, 
              {provide: AuthHttp, useFactory: authHttpServiceFactory, deps: [Http, RequestOptions]}, 
              PerilwiseService],
  bootstrap: [AppComponent],
  entryComponents: [ClaimStatusCloseDialog, ClaimStatusReopenDialog]
})
export class AppModule { }
