import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ServicesService {

  private endpoint = '/api/get_reports';

  constructor(private http: HttpClient) { }

  public post(body:any){
    return this.http.post(this.endpoint,body,{responseType: 'arraybuffer'}).pipe(
      map((file: ArrayBuffer) => {
          return file;
      })
    );
  }
}
