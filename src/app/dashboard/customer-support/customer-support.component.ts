import { Component, OnInit, Inject } from '@angular/core';
import { PerilwiseService } from "./../../services/perilwise.service";
import { LazyLoadEvent } from 'primeng/primeng';
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-customer-support',
  templateUrl: './customer-support.component.html',
  styleUrls: ['./customer-support.component.css']
})
export class CustomerSupportComponent implements OnInit {
  customerData: any;
  cols: any[] = [];
  totalRecords: number;
  claimStatusCloseSelected: string;
  claimStatusReopenSelected: string;
  constructor(public perilwiseService: PerilwiseService, public dialog: MdDialog) { }

  ngOnInit() {
    if(!this.customerData && !this.totalRecords){
      this.perilwiseService.getCustomerData(0, 10).subscribe((data) => {
        this.customerData = data.results;
        this.totalRecords = data.totalRecords;
      });
    }
    this.cols = [
      {field: 'policyHolderName', header: 'Policy Holder Name'},      
      {field: 'policyType', header: 'Policy Type'},
      {field: 'policySubType', header: 'Policy Sub Type'},            
      {field: 'policyNumber', header: 'Policy Number'},
      {field: 'insurerName', header: 'Insurer Name'},
      {field: 'sumInsured', header: 'Sum Insured'},
      {field: 'premium', header: 'Premium'},
      {field: 'commisions', header: 'Commisions'},    
    ];
  }

  loadCarsLazy(event: LazyLoadEvent) {
    this.perilwiseService.getCustomerData(event.first, event.rows).subscribe((data) => {
      this.customerData = data.results;
      this.totalRecords = data.totalRecords;
    });
  }

  changeClaimStatusClose(customer: any){
    this.perilwiseService.updateClaimStatusClose(customer._id, customer).subscribe((data) => {
      if(data) this.customerData[this.customerData.indexOf(customer)].claimMade = "y";          
    });
  }

  changeClaimStatusReopen(customer: any){
    this.perilwiseService.updateClaimStatusReopen(customer._id).subscribe((data) => {
      if(data) this.customerData[this.customerData.indexOf(customer)].claimMade = "n";          
    });
  }

  openClaimStatusCloseDialog(customer: any) {
    let dialogRef = this.dialog.open(ClaimStatusCloseDialog, {
      data: customer,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.claimStatusCloseSelected = result;
      if(this.claimStatusCloseSelected == "change"){
        this.changeClaimStatusClose(customer);
      }
    });
  }

  openClaimStatusReopenDialog(customer: any) {
    let dialogRef = this.dialog.open(ClaimStatusReopenDialog, {
      data: customer,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.claimStatusReopenSelected = result;
      if(this.claimStatusReopenSelected == "change"){
        this.changeClaimStatusReopen(customer);
      }
    });
  }

}

@Component({
  selector: 'claim-status-close-dialog',
  templateUrl: 'claim-status-close-dialog.html',
})
export class ClaimStatusCloseDialog {
  constructor(@Inject(MD_DIALOG_DATA) public data: any, public dialogRef: MdDialogRef<ClaimStatusCloseDialog>) { }
}

@Component({
  selector: 'claim-status-reopen-dialog',
  templateUrl: 'claim-status-reopen-dialog.html',
})
export class ClaimStatusReopenDialog {
  constructor(@Inject(MD_DIALOG_DATA) public data: any, public dialogRef: MdDialogRef<ClaimStatusReopenDialog>) { }
}