import { GameContestantsService, IContestantStats } from './game-contestants.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ConfigService } from './config.service';

export interface IDebugStat {
  name: string;
  data: BehaviorSubject<any>;
}

@Injectable({
  providedIn: 'root',
})
export class GameStatsService {
  private readonly apiBaseUrl: string = '';

  get observables$(): Array<BehaviorSubject<IDebugStat>> {
    return this._observables$;
  }

  // public Observables$!: BehaviorSubject<IDebugStat>[];
  // BehaviorSubject<{ [k: string]: any }>

  // uusi subjecti - eli se data tarjottimella mitä ikinä halutaankaan
  // private _mySubj: Subject<{ [k: string]: any }> = new Subject<{ [k: string]: any }>();
  private _mySubj: BehaviorSubject<{ [k: string]: any }> = new BehaviorSubject<{[k: string]: any; }>({});

  // Sitten luodaan se yksittäinen behaviourSubjekti jolle annetaan nimi ja se data joka juuri alustettiin
  public clockData: BehaviorSubject<IDebugStat> =
    new BehaviorSubject<IDebugStat>({ name: 'clock', data: this._mySubj });
  // public data: IDebugStat = { name: 'clock', data: this._mySubj }

  private _observables$: Array<BehaviorSubject<IDebugStat>> = new Array(
    this.clockData
  );

  private _id!: NodeJS.Timer;
  private _RndNr: number = 0;
  public asd = new BehaviorSubject<number>(this._RndNr);
  private startDate = new Date();
  private endDate = new Date();
  private seconds = (this.endDate.getTime() - this.startDate.getTime()) / 1000;

  constructor(private statsService: GameContestantsService) {
    this.apiBaseUrl = ConfigService.settings.apiUri;

    this._observables$[0].getValue().data.next(0);

    // this._observables$.push(newSubject);
  }

  ngOnInit() {
    // console.table(this._observables$);
  }

  startSth(): void {
    if (!this._id) {
      console.log('STARTED CLOCK');

      this._id = setInterval(() => {
        this.endDate = new Date();
        this._RndNr = this.endDate.getTime() - this.startDate.getTime();
        this._observables$[0].getValue().data.next(this._RndNr);
      }, 1000);

      this.statsService.getRandomContestant()
      .subscribe({
        next: (randomOne: IContestantStats) => {
        this._observables$
          .push(new BehaviorSubject<IDebugStat>(
            <IDebugStat>{name: 'Random Veggie', data: new BehaviorSubject(randomOne) }
          ))

          // console.table(this._observables$)

        },error: (err: HttpErrorResponse) =>{
          console.error(err.status,err);
        },complete: () => {
          this.statsService.changes.next(!this.statsService.changes.getValue());
            // console.log('we got the stuff');
        }
      });
    }
  }

  stopSth(): void {
    clearInterval(this._id);
  }
}
