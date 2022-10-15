import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface IAllContestantsImgs {
  // [
  //  {"count": 1},
  //  {
  //    "Name": "harry Tuna, In Oil, Canned",
  //    "url": "https://api.deepai.org/job-view-file/36ac697d-ff57-4fbb-855d-234aba71559e/outputs/output.jpg"
  //  }
  //  ]
  count: countAll; // number of all generated Contestant Images
  generated?: NameUrl[]; // name and url pair
}
export interface NameUrl {
  Name: string; // name
  url: string; // and image generated based on name
}
export interface countAll {
  count: number;
}

export interface IWaitingCounter {
  // public string CounterName { get; set; }
  // public int CounterValue { get; set; }
  // public int CounterMax { get; set; }
  // public string? Message { get; set; }
  CounterName: string; // name based on what AI is generating
  CounterValue: number; // where we are now
  CounterMax: number; // the 100% of work done
  Message?: string; // optional information if we want to provide it
}

@Injectable({
  providedIn: 'root'
})
export class GameImageService {
  private readonly apiBaseUrl: string = '';
  private readonly serviceUrl: string = '/VeggieImg';

  constructor(private http: HttpClient) {
    this.apiBaseUrl = ConfigService.settings.apiUri;
  }

 /** VEGGIEIMG METHODS
  * Veggies are unique by their Id which correspods to their Img
  * But images has 4 variants of contestant
  *   - hence we need to USE and ASK if we want different variants
  *   - all this cause you can ask for the same contestant twice...
  *     - BUT NOW WITH DIFFERENT PICTURE!
  *
  * @returns
  */
  public getAll(): Observable<IAllContestantsImgs> {
    const path = `/utils/getall`
    return this.http.get<IAllContestantsImgs>(this.apiBaseUrl + this.serviceUrl + path);
  }

  public generateImageWithName(veggieName: string): Observable<Blob> {
    const path = `/${veggieName}`
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.get<Blob>(this.apiBaseUrl + this.serviceUrl + path,
      {headers: headers, responseType: 'blob' as 'json' });
  }

  public getImageUsageCounterByName(veggieName: string): Observable<number> {
    const path = `/utils/counter/${veggieName}`
    return this.http.get<number>(this.apiBaseUrl + this.serviceUrl + path);
  }

  public getImageGenerationCounterByName(veggieName: string): Observable<IWaitingCounter> {
    const path = `/utils/waiting/counter/${veggieName}`
    return this.http.get<IWaitingCounter>(this.apiBaseUrl + this.serviceUrl + path);
  }

}
