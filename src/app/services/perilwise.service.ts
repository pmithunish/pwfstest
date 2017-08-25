import { Injectable } from "@angular/core";
import { AuthHttp } from 'angular2-jwt';
import { Http, RequestOptions, Headers } from "@angular/http";
import 'rxjs/add/operator/map';

@Injectable()
export class PerilwiseService{
    
    constructor(public authHttp: AuthHttp, public http: Http) { }

    postImportData(fileList){
        if(fileList.length > 0) {
            let file: File = fileList[0];
            let formData:FormData = new FormData();
            formData.append('uploadFile', file, file.name);
            let headers = new Headers();
            headers.append('Authorization', 'Bearer ' + localStorage.getItem('access_token') ); 
            headers.append('enctype', 'multipart/form-data');
            let options = new RequestOptions({ headers: headers });
            return this.http.post(`http://localhost:5000/importData`, formData, options)
                .map(res => res);
        }
    }

    getExportData(){
        return this.authHttp.get('http://localhost:5000/exportData').map(response => response);
    }

    getInsuranceData(skip: number, limit: number){
        return this.authHttp.get('http://localhost:5000/insuranceData?limit=' + limit + '&skip=' + skip).map(response => response.json());            
    }

    updateClaimStatusClose(key: string, data: any){
        return this.authHttp.put('http://localhost:5000/updateClaimStatusClose', JSON.stringify({'key': key, 'data': data})).map(response => response);
    }

    updateClaimStatusReopen(key: string){
        return this.authHttp.put('http://localhost:5000/updateClaimStatusReopen', JSON.stringify({'key': key})).map(response => response);
    }

    getCustomerData(skip: number, limit: number){
        return this.authHttp.get('http://localhost:5000/customerData?limit=' + limit + '&skip=' + skip).map(response => response.json());
    }
}