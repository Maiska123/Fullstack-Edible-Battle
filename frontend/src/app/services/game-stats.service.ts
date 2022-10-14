import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface IDebugStat {
  name: string;
  data: Subject<any>;
}

@Injectable({
  providedIn: 'root'
})
export class GameStatsService {

  private _observables$: Array<BehaviorSubject<IDebugStat>>= new Array();

  get observables$(): Array<Observable<IDebugStat>> { return this._observables$ }

  public Observables$!: BehaviorSubject<IDebugStat>[];
  // BehaviorSubject<{ [k: string]: any }>
  private _mySubj: Subject<IDebugStat> = new Subject<IDebugStat>();
  public clockData: Observable<IDebugStat> = this._mySubj.asObservable();

  public data: IDebugStat = { name: 'clock', data: this._mySubj }

  private _id!: NodeJS.Timer;
  private _RndNr!: number;
  private startDate = new Date();
  private endDate   = new Date();
  private seconds = (this.endDate.getTime() - this.startDate.getTime()) / 1000;

  constructor() {
    let user = new BehaviorSubject<IDebugStat>(this.data);
    this._observables$.push(user);
  }

  ngOnInit() {
    console.table(this._observables$);
  }


  startSth(): void {
    if (!this._id) {
      this._id = setInterval(
        () => {
          // this._RndNr = Math.floor(Math.random() * 10000000 )/100000;
          this.endDate = new Date();
          this._RndNr = (this.endDate.getTime() - this.startDate.getTime())

          let asd = new BehaviorSubject<number>(this._RndNr);
          let stat: IDebugStat = {name: 'clock', data: asd}

          this._mySubj.next(stat)
        }, 1000);


    }
  }

  stopSth(): void {
    clearInterval(this._id);
  }


}
