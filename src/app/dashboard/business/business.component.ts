import { Component, OnInit } from '@angular/core';
import { PerilwiseService } from "./../../services/perilwise.service";
import { LazyLoadEvent } from 'primeng/primeng';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css']
})
export class BusinessComponent implements OnInit {
  insuranceData: any;
  cols: any[] = [];
  totalRecords: number;
  constructor(public perilwiseService: PerilwiseService) { }

  ngOnInit() {
    if (!this.insuranceData && !this.totalRecords){
      this.initialData();
    }
    this.cols = [
      {field: 'policyType', header: 'Policy Type'},
      {field: 'policyNumber', header: 'Policy Number'},
      {field: 'policySubType', header: 'Policy Sub Type'},      
      {field: 'policyHolderName', header: 'Policy Holder Name'},
      {field: 'insurerName', header: 'Insurer Name'},
      {field: 'sumInsured', header: 'Sum Insured'},
      {field: 'premium', header: 'Premium'},
      {field: 'commisions', header: 'Commisions'},
      {field: 'NCB', header: 'NCB'},
      {field: 'nominee', header: 'Nominee/Beneficiary'},
      {field: 'dependents', header: 'Dependents'},
      {field: 'claimMade', header: 'Claim Made'},
      {field: 'customerEmail', header: 'Customer Email'}      
    ];
  }

  initialData(){
    this.perilwiseService.getInsuranceData(0, 10).subscribe((data) => {
      this.insuranceData = data.results; 
      this.totalRecords = data.totalRecords;
    });
  }

  loadCarsLazy(event: LazyLoadEvent) {
    this.perilwiseService.getInsuranceData(event.first, event.rows).subscribe((data) => {
     this.insuranceData = data.results;
     this.totalRecords = data.totalRecords;
   });
  }
  
  convertToCSV() {
    this.perilwiseService.getExportData().subscribe(data => {
      let parsedResponse = data.text();
      var blob = new Blob([parsedResponse], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, "insuranceData.csv");
    });
  }

  fileChange(event) {
    this.insuranceData = null;
    let fileList: FileList = event.target.files;
    this.perilwiseService.postImportData(fileList).subscribe(data => {
      this.initialData();
    });
  }
}
