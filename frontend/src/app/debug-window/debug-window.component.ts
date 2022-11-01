import { GameContestantsService } from './../services/game-contestants.service';
import { NameUrl } from './../services/game-image.service';
import { GameStatsService, IDebugStat } from './../services/game-stats.service';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { finalize, Subscription, switchMap } from 'rxjs';
import { PrettyPrintPipe } from '../utils/pipes/PrettyPrint.pipe';
import { AudioService } from '../services/audio.service';

export interface IDebugStatTemplate {
  name: string;
  data: any;
}

const enum Status {
  OFF = 0,
  RESIZE = 1,
  MOVE = 2,
}

@Component({
  selector: 'app-debug-window',
  templateUrl: './debug-window.component.html',
  styleUrls: ['./debug-window.component.scss']
})
export class DebugWindowComponent implements OnInit {
  public $Observables: Array<IDebugStatTemplate> = [];

  private subscriptions = new Subscription();

  item: IDebugStatTemplate = {
    name: '',
    data: undefined,
  };

  itemArray: IDebugStatTemplate[] = [];

  time!: number;

  public ngOnInit() : void {}

  public ngAfterViewInit() : void {
    this.loadBox();
    this.loadContainer();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public initSubs(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.handleSubscriptions();

  }
  public something() {
    // this.loading = true;
    // this.a2vService.getNetworkTemplate().pipe(

    //   filter(response => !!response),
    //   switchMap(resp => this.service.createImage(resp.link)),
    //   finalize(() => this.loading = false)

    // ).subscribe(resp => this.image = resp);

  }

  private handleSubscriptions(): void {
    this.gameStatsService.observables$.forEach(BehaviousSubject => {
      let name: string;
      this.subscriptions.add(
          BehaviousSubject.pipe(
            switchMap(resp => {
                name = resp.name
                return resp.data
            }),finalize(() => {/* VOID */}))
          .subscribe(data => {
            //
            let index = this.itemArray.findIndex(z => z.name == name);
            if (index > -1) this.itemArray[index].data = data
            else this.itemArray.push({name: name, data: data});
          })
        )
    });
  }

  constructor(private gameStatsService: GameStatsService,
              private statService: GameContestantsService,
              private audioService: AudioService) {

    this.statService.changes.subscribe((change: boolean) => {
      this.initSubs()
    })

  }

  public ItemTypeIs(item: IDebugStatTemplate): string  {
    if (item.name === 'clock') {return 'date'};
    if (typeof(item.data) == typeof(1)) return 'number';
    if (typeof(item.data) == typeof('test')) return 'string';
    if (typeof(item.data) == typeof({})) return 'object';
    return 'none';
  }

  public stringify(item: any): string {
    return JSON.stringify(item);
  }

  public playPauseAndNext(){
    if (!this.audioService.bgMusicPlaying) {
      // this.audioService.toggleBgMusicPlaying();
      this.audioService.skipForward();
    }
    else {
      this.audioService.toggleBgMusicPlaying();
    }

  }

  /**
   *
   *  EVERYTHING UNDERNEATH IS TO JUST HANDLE DEBUG BOX!!!
   *
   *
   *
   *
   *
   *
   */
  @Input('width')
  public width!: number;
  @Input('height')
  public height!: number;
  @Input('left')
  public left!: number;
  @Input('top')
  public top!: number;
  @ViewChild('box')
  public box!: ElementRef;
  private boxPosition!: { left: number; top: number };
  private containerPos!: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  public mouse!: { x: number; y: number };
  public status: Status = Status.OFF;
  private mouseClick!: { x: number; y: number; left: number; top: number };

  private loadBox() {
    const { left, top } = this.box.nativeElement.getBoundingClientRect();
    this.boxPosition = { left, top };
  }

  private loadContainer() {
    const left = this.boxPosition.left - this.left;
    const top = this.boxPosition.top - this.top;
    const right = left + 600;
    const bottom = top + 450;
    this.containerPos = { left, top, right, bottom };
  }

  setStatus(event: MouseEvent, status: number) {
    if (status === 1) event.stopPropagation();
    else if (status === 2)
      this.mouseClick = {
        x: event.clientX,
        y: event.clientY,
        left: this.left,
        top: this.top,
      };
    else this.loadBox();
    this.status = status;
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse = { x: event.clientX, y: event.clientY };

    if (this.status === Status.RESIZE) this.resize();
    else if (this.status === Status.MOVE) this.move();
  }

  private resize() {
    if (this.resizeCondMeet()) {
      this.width = Number(this.mouse.x > this.boxPosition.left)
        ? this.mouse.x - this.boxPosition.left
        : 0;
      this.height = Number(this.mouse.y > this.boxPosition.top)
        ? this.mouse.y - this.boxPosition.top
        : 0;
    }
  }

  private resizeCondMeet() {
    return (
      this.mouse.x < this.containerPos.right &&
      this.mouse.y < this.containerPos.bottom
    );
  }

  private move() {
    if (this.moveCondMeet()) {
      this.left = this.mouseClick.left + (this.mouse.x - this.mouseClick.x);
      this.top = this.mouseClick.top + (this.mouse.y - this.mouseClick.y);
    }
  }

  private moveCondMeet() {
    const offsetLeft = this.mouseClick.x - this.boxPosition.left;
    const offsetRight = this.width - offsetLeft;
    const offsetTop = this.mouseClick.y - this.boxPosition.top;
    const offsetBottom = this.height - offsetTop;
    return (
      this.mouse.x > this.containerPos.left + offsetLeft &&
      this.mouse.x < this.containerPos.right - offsetRight &&
      this.mouse.y > this.containerPos.top + offsetTop &&
      this.mouse.y < this.containerPos.bottom - offsetBottom
    );
  }
}
