import { IContestantStats } from './../services/game-contestants.service';
import { GameImageService, IWaitingCounter } from './../services/game-image.service';
import { AudioService } from './../services/audio.service';
import { GameStatsService } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';
import { switchMap, Subject } from 'rxjs';
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

export enum imagePos{
  first,
  second,
  third,
  fourth
}

export enum QueueStatus{
  stopped,
  started,
  waitingForUser
}

export const imagePosDescription: {
  [key in imagePos]: number[];
} = {
  [imagePos.first]: [0, 0, 512, 512],
  [imagePos.second]: [512, 0, 512, 512],
  [imagePos.third]: [0, 512, 512, 512],
  [imagePos.fourth]: [512, 512, 512, 512]
};

export const BattleStateDescription: {
  [key in imagePos]: number[];
} = {
  [imagePos.first]: [0, 0, 512, 512],
  [imagePos.second]: [512, 0, 512, 512],
  [imagePos.third]: [0, 512, 512, 512],
  [imagePos.fourth]: [512, 512, 512, 512]
};


export enum battleState{
  warrior1Attacking,
  warrior2Attacking,
  dialogTextInput,
  waitingForUser,
}

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.scss'],
})
export class GameWindowComponent implements OnInit {
  canvas!: HTMLCanvasElement;
  c!: CanvasRenderingContext2D | null;
  clicked: boolean = false;
  bitmapCache!: ImageBitmap;
  readonly failoverCounter: number = 3;
  lastFetchedCounter: Date = new Date();
  accumulator: number = 1;
  private adjectivesToStart: string[] = ["angry","bold","brutal","cutthroat","dangerous","ferocious","fiery","furious","intense","murderous","passionate","powerful","raging","relentless","savage","stormy","strong","terrible","vehement","vicious","animal","ape","awful","barbarous","bloodthirsty","blustery","boisterous","brutish","cruel","enraged","fell","feral","flipped","frightening","horrible","howling","impetuous","infuriated","malevolent","malign","primitive","raving","tempestuous","threatening","tigerish","truculent","tumultous/tumultuous","uncontrollable","untamed","venomous","wild"]

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
  warrior1Stats!: IContestantStats;
  warrior2Stats!: IContestantStats;

  warrior1Name: string = '';
  warrior2Name: string = '';

  warrior1Ready: boolean = false;
  warrior2Ready: boolean = false;

  warrior1ImageBlob!: Blob;
  warrior1EvolveStage: imagePos = imagePos.first;

  public algorythmsMan: boolean = false;
  public flickerOn: boolean = false;

  private timer!: NodeJS.Timer;
  private counterTimer!: NodeJS.Timer;
  loadingPercentage: number = 0;
  loadingbar!: HTMLDivElement;


  /******** ETC */
  public dialogText: string = ''
  public textInputEnded: boolean = false;
  private dialogSubject: Subject<string> = new Subject<string>();

  public battleQueueStatus: QueueStatus = QueueStatus.stopped;
  public battleQueue: Array<battleState> = [];


  constructor(
    private gameStatsService: GameStatsService,
    private audioService: AudioService,
    private imageService: GameImageService
  ) {
    this.dialogSubject.subscribe((text) => {
      this.dialogText = text;
    })
  }

  ngOnInit(): void {
    this.gameStatsService.startSth();
  }

  ngAfterViewInit(): void {

    this.initializeCanvas();

    if (this.c) {
      this.drawLobbyImgToCanvas();

      console.log(this.c);
    }
    this.audioService.viewDidLoad();


    for (const key in document.getElementsByClassName('button')) {
      document.getElementsByClassName('button').item(Number(key))!
      .addEventListener('mousedown', () => {
        this.audioService.playButtonSound();
      });

      document.getElementsByClassName('button').item(Number(key))!
      .addEventListener('mouseup', () => {
        this.audioService.playButtonSound(false);
      });

    }
  }

public dialogTextInputEffect(text: string, textAt: number = 0): void {

  if (textAt <= text.length) {
    this.textInputEnded = false;

    this.audioService.playTextSound();

    this.dialogSubject.next(text.substring(0,textAt));

    setTimeout(() => this.dialogTextInputEffect(text, textAt + 1),50)

  }
  else {
    this.textInputEnded = true;
  }

}


public evolveMyVeggie(){
  // this.warrior1ImageBlob = image;
  // let startX, startY, stopX, StopY;
  this.warrior1EvolveStage = this.warrior1EvolveStage+1;
  if (this.warrior1EvolveStage == 3) this.disableEvolve();
  if (this.warrior1EvolveStage <= 3){

    createImageBitmap(this.warrior1ImageBlob,
                        imagePosDescription[this.warrior1EvolveStage][0],
                        imagePosDescription[this.warrior1EvolveStage][1],
                        imagePosDescription[this.warrior1EvolveStage][2],
                        imagePosDescription[this.warrior1EvolveStage][3],
                        {
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
      if (this.c) {
        this.c.drawImage(this.bitmapCache, 200, 220);
      }
  }
}

public calculateAndAdvanceBattle(){

  // lets calculate battle till the end
  // we determine things and "steps" by the warrior stats



  while(this.warrior1Stats.hp > 0 || this.warrior2Stats.hp > 0){
    // now lets calculate things to happen

  }


  let gameState = this.battleQueue.shift();

  if(gameState == battleState.dialogTextInput){

  }
  if(gameState == battleState.warrior1Attacking){

  }
  if(gameState == battleState.warrior2Attacking){

  }
  if(gameState == battleState.waitingForUser){

  }




  this.battleQueueStatus = QueueStatus.waitingForUser; // always ends at waiting for user
}

public startBattle(){
  this.battleQueue.push(battleState.dialogTextInput);
  this.calculateAndAdvanceBattle();

}

/**
 * Advance Battle 1 step at a time
 *  either started (going on its own)
 * or stopped (in HALT state)
 * or waiting for user (user clicks button to advance)
 */
public advanceBattle() {
  if (this.battleQueueStatus == QueueStatus.stopped) {
  let word = 'You sure are '+ this.adjectivesToStart[(Math.floor(Math.random() * this.adjectivesToStart.length) + 1)] +' button clicker...'
  this.dialogTextInputEffect(word);
  } else {
    // take next value from this.battleQueue
    if (this.warrior1Ready && this.warrior2Ready
      && this.battleQueue.length == 0
      && this.battleQueueStatus == QueueStatus.started) {
      // battle begins
      this.startBattle()
    } else if (this.battleQueueStatus == QueueStatus.waitingForUser) {
      // in battle
      this.calculateAndAdvanceBattle()
    }
  }
}

  public pushedButton(callbackName?: string){


    switch (callbackName) {
      case 'red':
        if (!this.clicked) {
          this.addBattleStartClickHandler()
          let word = 'Started '+ this.adjectivesToStart[(Math.floor(Math.random() * this.adjectivesToStart.length) + 1)] +' Battle...'
          this.dialogTextInputEffect(word);
        } else {
          this.advanceBattle();
        }

        break;
      case 'green':
        this.wannaBeAlgoExpert()
        break;
      case 'blue':
        this.evolveMyVeggie()
        break;
      default:
        break;
    }
  }


  public disableEvolve(){
    document.getElementById('disabled-button2')?.setAttribute('disabled','')
  }


   public wannaBeAlgoExpert() {

    if(this.algorythmsMan) {

      VideoPlayerComponent.videoShow = false;

      VideoPlayerComponent.powerSwitch();

      setTimeout(() => {

         this.algorythmsMan = false;
         this.audioService.bringTheBeatBack();

         document.getElementById('disabled-button1')?.removeAttribute('disabled')
         if (!(this.warrior1EvolveStage == 3)) document.getElementById('disabled-button2')?.removeAttribute('disabled')
      }, 500);
    }
    this.algorythmsMan = true;

    this.audioService.dimBGMusic();

    document.getElementById('disabled-button1')?.setAttribute('disabled','')
    document.getElementById('disabled-button2')?.setAttribute('disabled','')


    // element1!.addEventListener('mouseover', function() {
    //   console.log('Event triggered');
    // });

    // element2!.addEventListener('mouseover', function() {
    //   console.log('Event triggered');
    // });

    // var event = new MouseEvent('mouseover', {
    //   'view': window,
    //   'bubbles': false,
    //   'cancelable': false
    // });

    // element1!.dispatchEvent(event);
    // element2!.dispatchEvent(event);




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
    this.canvas.height = 600;
  }

  public drawLobbyImgToCanvas(): void {
    if (this.c) {
      this.c.fillStyle = 'black';
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
    if (!this.algorythmsMan) {
      if (!this.clicked &&
        this.gameStatsService.observables$.some(
          (x) => x.getValue().name == 'Random Veggie'
        )
        ) {
        this.clicked = true;
        this.audioService.toggleBgMusicPlaying();

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
              this.warrior1Stats = Stats;
              console.log('Contenstant');
              console.log(Stats.name);
              this.drawLoadingTopScreen(Stats.name)

              this.imageService
                .generateImageWithName(Stats.name)
                .subscribe((image: Blob) => {
                  this.warrior1ImageBlob = image;
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
                        this.dialogTextInputEffect(`First Contestant enters the battlefield... Say hello to ${this.warrior1Name}!`);

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
  }

  public animateBattle() {
    window.requestAnimationFrame(this.animateBattle);
  }
}
