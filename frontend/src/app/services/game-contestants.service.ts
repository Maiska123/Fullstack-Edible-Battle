import { DebugWindowComponent } from './../debug-window/debug-window.component';
import { GameStatsService } from './game-stats.service';
import { ConfigService } from './config.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs';

export interface IContestantStats {
  /**
   *  {
        "name": "titan Coconut Butter",
        "id": 552,
        "hp": 883.0570139108723,
        "attack": 0,
        "defence": 0,
        "speed": 99.9000015258789,
        "luck": 91.3171005249023
      }
   */
  name: string,
  id: number,
  hp: number,
  attack: number,
  defence: number,
  speed: number,
  luck: number
}
@Injectable({
  providedIn: 'root'
})
export class GameContestantsService {
  private readonly apiBaseUrl: string = '';
  private readonly serviceUrl: string = '/VeggieStats';

  public changes: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              // private debugWindow: DebugWindowComponent
              ) {
    this.apiBaseUrl = ConfigService.settings.apiUri;
  }


 /** VEGGIESTAT METHODS
  * Veggies are unique by their Id which correspods to their stats
  * fetched from public API by backend
  *   - hence veggies are unique by Id
  *
  * @returns
  */
  public getRandomContestant(): Observable<IContestantStats> {
    const path = `/createwarrior/random`
    return this.http.get<IContestantStats>(this.apiBaseUrl + this.serviceUrl + path);
  }

  public getContestantStatsById(veggieId: number): Observable<IContestantStats> {
    const path = `/${veggieId}`
    return this.http.get<IContestantStats>(this.apiBaseUrl + this.serviceUrl + path);
  }

}
