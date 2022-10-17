import { IContestantStats } from './../services/game-contestants.service';
import { GameImageService, IWaitingCounter } from './../services/game-image.service';
import { AudioService } from './../services/audio.service';
import { GameStatsService } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { VideoPlayerComponent } from '../video-player/video-player.component';

export interface IWarriorSprite {
  img: ImageBitmap | null;
  x: number;
  y: number;
  width: number;
  height: number;
  currentframe: number;
  totalframes: number;
}

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.css'],
})
export class GameWindowComponent implements OnInit {
  canvas!: HTMLCanvasElement;
  c!: CanvasRenderingContext2D | null;
  clicked: boolean = false;
  bitmapCache!: ImageBitmap;
  readonly failoverCounter: number = 3;
  lastFetchedCounter: Date = new Date();
  accumulator: number = 1;
  counterData1!: IWaitingCounter;
  warrior1Image: IWarriorSprite = {
    img: null,
    x: 0,
    y: 0,
    width: 28,
    height: 42,
    currentframe: 0,
    totalframes: 0,
  };

  warrior2Image: IWarriorSprite = {
    img: null,
    x: 0,
    y: 0,
    width: 28,
    height: 42,
    currentframe: 0,
    totalframes: 0,
  };
  warrior1Name: string = '';

  warrior1Ready: boolean = false;
  warrior2Ready: boolean = false;

  public algorythmsMan: boolean = false;
  public flickerOn: boolean = false;

  private timer!: NodeJS.Timer;
  private counterTimer!: NodeJS.Timer;
  loadingPercentage: number = 0;
  loadingbar!: HTMLDivElement;

  constructor(
    private gameStatsService: GameStatsService,
    private audioService: AudioService,
    private imageService: GameImageService
  ) {}

  ngOnInit(): void {
    this.gameStatsService.startSth();
  }

  ngAfterViewInit(): void {
    this.audioService.viewDidLoad();

    this.initializeCanvas();

    if (this.c) {
      this.drawLobbyImgToCanvas();

      console.log(this.c);
    }
  }

   public wannaBeAlgoExpert() {

    if(this.algorythmsMan) {
      VideoPlayerComponent.powerSwitch();

      setTimeout(() => {
         this.algorythmsMan = false;

      }, 2000);
    }

    this.algorythmsMan = true;


   }

  public imageCounterClock(name: string, count: number): void {
    if (this.c){
      if (this.loadingbar){
        if (Number(this.loadingbar.style.width) >= this.c.canvas.width) this.accumulator = 0;
        else this.accumulator +=1;
      }
    }

    this.activateLoadingBar();

    if ( ((new Date().getTime()) - this.lastFetchedCounter.getTime()) > 5000)
    {

      this.imageService.getImageGenerationCounterByName(name).subscribe(
        {
          next: (counterData: IWaitingCounter) => {
            this.counterData1 = counterData;
            if (this.loadingPercentage == NaN) this.loadingPercentage = 0;
            if (this.loadingPercentage < 1) {
              let value = this.loadingPercentage;
              value = (counterData.counterValue / counterData.counterMax);
              this.loadingPercentage = value;
            }
            this.loadingPercentage += 0.01;

          },error: (err: HttpErrorResponse) =>{
            console.error(err.status,err);
            if (this.warrior1Name && this.failoverCounter > count  ) {
              this.imageCounterClock(this.warrior1Name, count +1);
            } else {
              if (this.loadingPercentage  >= 1 || this.failoverCounter < count ) {
                clearInterval(this.counterTimer);

              } else {
                if (!(this.failoverCounter <= count)) this.imageCounterClock(this.warrior1Name, count +1);

              }
            }
          },complete: () => {

            if (this.failoverCounter <= count || (this.counterData1.counterValue == this.counterData1.counterMax)) {
              clearInterval(this.counterTimer);
              clearTimeout(this.timer);
            } else {
            this.counterTimer = setTimeout(() => {
                if (this.failoverCounter <= count ) {
                  clearTimeout(this.timer);
                  clearInterval(this.counterTimer);
                } else {
                  if (this.warrior1Name && (this.failoverCounter > count)) this.imageCounterClock(this.warrior1Name, count)
                }
              },100)
            }
          }
      })
      this.lastFetchedCounter = new Date();
    }

  }

  public drawLoadingTopScreen(name: string): void {
    this.loadingbar = <HTMLDivElement>document.getElementById('child');
    console.log('this.loadingbar');
    console.log(this.loadingbar);

    if (!this.loadingbar) this.loadingbar = <HTMLDivElement>document.getElementsByClassName('abc')[0];

    this.warrior1Name = name;

    this.counterTimer = setTimeout(() => {

      if (this.warrior1Name) this.imageCounterClock(this.warrior1Name, 0)


    })


  }

  public activateLoadingBar() {
    if (!this.loadingbar) this.loadingbar = <HTMLDivElement>document.getElementsByClassName('abc')[0];
    else {
      this.loadingbar.style.width = (((this.loadingPercentage * 6) * 170.66) + this.accumulator).toFixed(0)+'px' // 10,24
    }
      // if (this.loadingPercentage >= 1 || this.counterData1.counterMax == this.counterData1.counterValue) clearInterval(this.timer);
  }

  public initializeCanvas(): void {
    this.canvas = <HTMLCanvasElement>document.querySelector('canvas');
    this.c = this.canvas.getContext('2d');
    this.canvas.width = 1024;
    this.canvas.height = 576;
  }

  public drawLobbyImgToCanvas(): void {
    if (this.c) {
      this.c.fillStyle = 'white';
      this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const image = new Image();
      image.src = '../../assets/veggie.png';

      image.onload = () => {
        setTimeout(() => {
          if (this.c)
            this.c.drawImage(
              image,
              0,
              0,
              this.canvas.width,
              this.canvas.height
            );
        }, 1000);
      };
    }
  }

  public addBattleStartClickHandler(): void {

    if (!this.clicked &&
      this.gameStatsService.observables$.some(
        (x) => x.getValue().name == 'Random Veggie'
      )
      ) {
      this.audioService.toggleBgMusicPlaying();
      console.log(this.audioService);

      this.clicked = true;

      if (
        this.gameStatsService.observables$.some(
          (x) => x.getValue().name == 'Random Veggie'
        )
      ) {
        this.gameStatsService.observables$
          .find((x) => x.getValue().name == 'Random Veggie')
          ?.getValue()
          .data.asObservable()
          .subscribe((Stats: IContestantStats) => {
            /***************
             *  We Start Creating Veggie
             */
            console.log('Contenstant');
            console.log(Stats.name);
            this.drawLoadingTopScreen(Stats.name)

            this.imageService
              .generateImageWithName(Stats.name)
              .subscribe((image: Blob) => {
                console.log('Got Image!');
                createImageBitmap(image, 0, 0, 512, 512, {
                  resizeWidth: 250,
                  resizeHeight: 250,
                })
                  .then((imageBitmap: ImageBitmap) => {
                    this.bitmapCache = imageBitmap;
                  })
                  .finally(() => {
                    this.warrior1Ready = true;
                    console.log('Drawing Image');
                    if (this.c) {
                      this.c.drawImage(this.bitmapCache, 200, 220);
                    }
                  });
              });
          });
      }

      setTimeout(() => {
        // music has delay
        this.flickerOn = true;
        const image = new Image();
        image.src = '../../assets/battleBackground.png';

        image.onload = () => {
          setTimeout(() => {
            if (this.c) this.c.drawImage(image, 0, 0);
          }, 1000);
          setTimeout(() => {
            this.flickerOn = false;
          }, 3000);
        };
      }, 2000);
    }

  }

  public animateBattle() {
    window.requestAnimationFrame(this.animateBattle);
  }
}
