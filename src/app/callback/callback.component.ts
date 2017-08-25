import { Component, OnInit } from '@angular/core';
import { AuthService } from './../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {

  constructor(public auth: AuthService, public router: Router) { }

  ngOnInit() {
    if(this.auth.isAuthenticated()) this.router.navigate(['/dashboard/business']);
  }

}
