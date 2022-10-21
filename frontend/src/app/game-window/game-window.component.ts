import { IContestantStats, GameContestantsService } from './../services/game-contestants.service';
import { GameImageService, IWaitingCounter } from './../services/game-image.service';
import { AudioService } from './../services/audio.service';
import { GameStatsService, IDebugStat } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';
import { switchMap, Subject, BehaviorSubject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { Router, TitleStrategy } from '@angular/router';
import { Location } from '@angular/common';

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
  waitingForUser,
  calculating
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


export enum BattleState{
  warrior1Attacking,
  warrior2Attacking,
  dialogTextInput,
  waitingForUser,
}

export interface BattleStatWithDescription{
  state: BattleState,
  message: string,
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
  bitmapCache2!: ImageBitmap;
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
  warrior2Called: boolean = false;

  warrior1ImageBlob!: Blob;
  warrior2ImageBlob!: Blob;
  warrior1EvolveStage: imagePos = imagePos.first;

  public algorythmsMan: boolean = false;
  public flickerOn: boolean = false;

  private timer!: NodeJS.Timer;
  private counterTimer!: NodeJS.Timer;
  private dialogTextTimer!: NodeJS.Timer;
  loadingPercentage: number = 0;
  loadingbar!: HTMLDivElement;


  /******** ETC */
  public enemyName: string = '';
  public heroName: string = '';
  public enemyHpAmount: number = 0;
  public heroHpAmount: number = 0;
  public enemyMaxHp: number = 1;
  public heroMaxHp: number = 1;

  public enemyTrue: boolean = true;
  public enemyFalse: boolean = false;


  public dialogText: string = ''
  public textInputEnded: boolean = false;
  private dialogSubject: Subject<string> = new Subject<string>();

  public battleQueueStatus: QueueStatus = QueueStatus.stopped;
  public battleQueue: Array<BattleStatWithDescription> = [];
  public lastMessageWritten: string = '';
  currentGameState: BattleStatWithDescription | undefined;
  public lastMessageManuallyTriggered: boolean = false;
  private route: string = '';
  private twitchMode: boolean = false;
  private booleanFactor: boolean = true;
  private textCurrentlyRolling: boolean = false;
  public battleHasStarted: boolean = false;
  private lastRemaining1: number = 0;
  private lastRemaining2: number = 0;
  public gameOver: boolean = false;

  constructor(
    private gameStatsService: GameStatsService,
    private audioService: AudioService,
    private imageService: GameImageService,
    private contestantService: GameContestantsService,
    private router: Router,
    private location: Location
  ) {
    router.events.subscribe((val) => {
      this.route = location.path();

      if (this.route.includes('twitch')) this.twitchMode = true;
    });

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
    this.audioService.viewDidLoad(this.twitchMode);


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
private dialogTextInputEffect(text: string, textAt: number = 0, manuallyTriggered: boolean = true) {

  if (textAt == 0) {
    this.lastMessageWritten = text;
  }

  if (!manuallyTriggered && textAt <= text.length && !this.lastMessageManuallyTriggered){

    this.audioService.playTextSound();
    this.dialogSubject.next(text.substring(0,textAt));

    this.textInputEnded = false;
    this.textCurrentlyRolling = true;

     if (this.battleHasStarted) this.battleQueueStatus = QueueStatus.calculating;

    this.dialogTextTimer = setTimeout(() => this.dialogTextInputEffect(text, textAt + 1, false),50);

  } else if(textAt > text.length || this.lastMessageManuallyTriggered){
    // console.log('automatic textinput ended');

    this.dialogSubject.next(text);

    this.lastMessageManuallyTriggered = false;
    this.textInputEnded = true;
    if (this.battleHasStarted) this.battleQueueStatus = QueueStatus.waitingForUser;
    clearInterval(this.dialogTextTimer);


    this.dialogTextInput(text, true);
  }

}

public dialogTextInput(text: string, manuallyTriggered: boolean = false): void {
    // kun käyttäjä kutsuu tätä
    //  this.lastMessageManuallyTriggered = true;
    // muuten
    //  this.lastMessageManuallyTriggered = false;
    //
    if (this.textInputEnded && manuallyTriggered){
      this.textCurrentlyRolling = false;
      this.textInputEnded = true;

      this.audioService.playOkSound();

    } else if (!manuallyTriggered){
      this.lastMessageManuallyTriggered = false;
      this.dialogTextInputEffect(text, 0, false)

    } else if (this.battleQueueStatus == QueueStatus.calculating
      && !this.textInputEnded) {
        // void
      }


  // if ( manuallyTriggered
  //     && this.lastMessageManuallyTriggered ){
  //   this.textCurrentlyRolling = false;
  //   this.textInputEnded = true;

  //   clearInterval(this.dialogTextTimer);
  //   this.audioService.playOkSound();

  //   this.dialogSubject.next(this.lastMessageWritten);
  //   this.battleQueueStatus = QueueStatus.waitingForUser

  // } else if (this.textInputEnded){

  //   this.textCurrentlyRolling = false;
  //   this.dialogTextInput(text, true)

  // } else if (!manuallyTriggered) {
  //   this.dialogTextInputEffect(text, 0, false)
  // }


}

public evolveMyVeggie(){
  // this.warrior1ImageBlob = image;
  // let startX, startY, stopX, StopY;
  if (this.clicked && this.warrior1Ready){

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
}

private warrior1Hits(amount: number){
  this.battleQueue.push({ state: BattleState.warrior1Attacking,message:amount.toFixed(0)});
  this.battleQueue.push({ state: BattleState.dialogTextInput,message:`${this.warrior2Name} says: Ouch!`});

}

private warrior2Hits(amount: number){
  this.battleQueue.push({ state: BattleState.warrior2Attacking,message:amount.toFixed(0)});
  this.battleQueue.push({ state: BattleState.dialogTextInput,message:`${this.warrior1Name} says: Ouwie!`});

}

private battleCalculations(){

  // let count = 100;
// lets assume we have 100 seconds
// every round we have last remaining which are slowing next rounds down
// but we have variation with luck



let remaining1 = ((100 - (this.warrior1Stats.speed * /*Luck Factor*/((Math.floor(Math.random() * this.warrior1Stats.luck) + 1)/10))) + (this.lastRemaining1 - this.warrior1Stats.luck));
let remaining2 = ((100 - (this.warrior2Stats.speed * /*Luck Factor*/((Math.floor(Math.random() * this.warrior2Stats.luck) + 1)/10))) + (this.lastRemaining2  - this.warrior2Stats.luck));


this.lastRemaining1 = remaining1;
this.lastRemaining2 = remaining2;


  // while (this.warrior1Stats.hp > 0 && this.warrior2Stats.hp > 0) {

    if (remaining1 < remaining2){ // warrior 1 deals damage
      let damage = ((
        ((this.warrior1Stats.attack) / this.warrior2Stats.hp)
        * this.warrior1Stats.attack * this.warrior1Stats.luck)
        - ((this.warrior2Stats.defence * this.warrior2Stats.luck) / this.warrior2Stats.hp)
        );
      this.warrior1Hits(Math.ceil(damage));
      this.warrior1Stats.hp -= damage;
    }
    else { // warrior 2 deals damage
      let damage = ((
        (this.warrior2Stats.attack / this.warrior1Stats.hp)
        * this.warrior2Stats.attack * this.warrior2Stats.luck)
        - ((this.warrior1Stats.defence * this.warrior1Stats.luck) / this.warrior1Stats.hp)
        );
      this.warrior2Hits(Math.ceil(damage));
      this.warrior2Stats.hp -= damage;
    }
  // }

  this.heroHpAmount = this.warrior1Stats.hp;
  this.enemyHpAmount = this.warrior2Stats.hp;

  if (this.warrior1Stats.hp < 0 || this.warrior2Stats.hp < 0){
    this.gameOver = true;
  }
}

/**
 *
 *   PELIN HALLINTA!
 *
 */
public calculateAndAdvanceBattle(){
  // PÄÄTILANESITTÄJÄ
  // this.battleQueueStatus = QueueStatus.waitingForUser

  // lets calculate battle till the end
  // we determine things and "steps" by the warrior stats

  // while(this.warrior1Stats.hp > 0 || this.warrior2Stats.hp > 0){
  //   // now lets calculate things to happen

  // }

  this.battleCalculations();

  let gameState;

  if ((this.currentGameState == undefined || !this.battleQueue[0]) && this.gameOver)  {
    this.battleQueue.push({ state: BattleState.dialogTextInput,
      message:
      this.booleanFactor
      ? 'Game got to an end.'
      : '...'

    });
    this.booleanFactor = !this.booleanFactor;

    gameState = this.battleQueue.shift();

  } else if (this.gameOver) {
    this.battleQueue.push({ state: BattleState.dialogTextInput,
      message:
      (this.warrior1Stats.hp < 0 && this.warrior2Stats.hp > 0)
      ? 'Hero has fallen. You Lose.'
      : 'You did beat that ugly veggie to the ground, GONGRATULATIONS!'

    });
  }
  else{
    gameState = this.battleQueue[0];
  }

  console.table(gameState);
  console.table(this.battleQueueStatus);

  let advance: boolean = false;
  // annetaan edistää jonoa vain kun asiat ovat sillä mallilla

  // this.battleQueueStatus == QueueStatus.stopped
  //    -> kun ei haluta käyttäjän edistävän tilaa

  // this.battleQueueStatus == QueueStatus.started
  //    -> kun peli alkaa

  // this.battleQueueStatus == QueueStatus.waitingForUser
  //    -> kun halutaan käyttäjän edistävän tilaa

  // this.battleQueueStatus == QueueStatus.calculating
  //    -> kun ollaan tiloissa ja toisaalta ei haluta vielä siirtyä eteenpäin

  // 1. tullaan uuden viestin kanssa joka viiimeisin jonossa
  // 2. jos painetaan ennen viestin loppumista täytyy viesti tulostaa loppuun - turhaa, ei muuten lue viestiä
  // 3. jos painetaan kun viesti on loppu niin edistetään seuraavaan steppiin

  console.log('-------- BATTLE STATE LOGIC ----------');

  if(gameState?.state == BattleState.dialogTextInput){
    this.lastMessageManuallyTriggered = true;

    if (this.battleQueueStatus == QueueStatus.waitingForUser
       && ((gameState != this.currentGameState) || this.battleQueue[0] == undefined)) {

      this.dialogTextInput(gameState.message, false);

      advance = true;
    }
    else if (this.battleQueueStatus == QueueStatus.calculating) {

      // this.dialogTextInput(gameState.message, false);
    }

    // dialogTextInput modifies battleQueueStatus!
  }
  if(gameState?.state == BattleState.warrior1Attacking){
    // BATTLE ANIMATION!

    this.dialogTextInput(`Our hero did ${gameState.message} damage to opponent!`, false);
    advance = true;

  }
  if(gameState?.state == BattleState.warrior2Attacking){
    // BATTLE ANIMATION!

    this.dialogTextInput(`Opponent did ${gameState.message} damage to our hero!`, false);
    // this.battleQueue.push({ state: BattleState.dialogTextInput,message:`Opponent did ${gameState.message} damage to our hero!`});
    advance = true;

  }
  if(gameState?.state == BattleState.waitingForUser){

  }


  if (advance) this.currentGameState = this.battleQueue.shift();


  // this.battleQueueStatus = QueueStatus.waitingForUser; // always ends at waiting for user
}

public startBattle(){
  this.battleQueue.push({ state: BattleState.dialogTextInput, message: 'BATTLE HAS BEGUN!' });
  this.battleHasStarted = true;
  this.battleQueueStatus = QueueStatus.waitingForUser;

  this.heroHpAmount = this.warrior1Stats.hp;
  this.enemyHpAmount = this.warrior2Stats.hp;

  if (this.warrior1Stats.attack == 0) this.warrior1Stats.attack = 1;
  if (this.warrior2Stats.attack == 0) this.warrior2Stats.attack = 1;

  console.log('this.enemyHpAmount');
  console.log(this.enemyHpAmount);
  console.log('this.heroHpAmount');
  console.log(this.heroHpAmount);

  this.advanceBattle();

}

/**
 * Advance Battle 1 step at a time
 *  either started (going on its own)
 * or stopped (in HALT state)
 * or waiting for user (user clicks button to advance)
 */
public advanceBattle() {
  console.log('this.battleQueue.length');
  console.log(this.battleQueue.length);
  console.log('this.warrior1Ready && this.warrior2Ready');
  console.log(this.warrior1Ready && this.warrior2Ready);
  console.log('this.battleQueueStatus');
  console.log(this.battleQueueStatus);

  if (this.battleQueueStatus == QueueStatus.stopped) {
    let word = 'You sure are '+ this.adjectivesToStart[(Math.floor(Math.random() * this.adjectivesToStart.length) + 1)] +' button clicker...'
    this.battleQueue.push({ state: BattleState.dialogTextInput, message: word });

  } else {
    // take next value from this.battleQueue
    if (this.warrior1Ready && this.warrior2Ready
      && this.battleQueue.length > 0
      && this.battleQueueStatus == QueueStatus.started) {
      // battle begins
      console.log('startBattle');

      this.startBattle()
    } else if (this.battleQueueStatus == QueueStatus.waitingForUser && this.battleHasStarted) {
      // in battle
      console.log('in battle');

      this.calculateAndAdvanceBattle()
    }
  }
}

public pushedButton(callbackName?: string){


    switch (callbackName) {
      case 'red':
        if (!this.clicked) {
          this.battleQueueStatus = QueueStatus.calculating;

          this.addBattleStartClickHandler()
          let word = `Started ${this.adjectivesToStart[(Math.floor(Math.random() * this.adjectivesToStart.length) + 1)]} Battle...`;
          // this.battleQueue.push({ state: BattleState.dialogTextInput, message: word });
          this.dialogTextInput(word, false);
        } else {
          if (!this.warrior2Ready && !this.warrior2Called){
            this.audioService.playOkSound();
            this.addAnotherContestant();
          }
          else if (this.battleQueueStatus == QueueStatus.waitingForUser || this.battleQueueStatus == QueueStatus.started) {
            console.log('BattleAdvanced');
            this.advanceBattle();
          }
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
              console.log('value')
              console.log(value)
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

  public drawLoadingTopScreen(name: string, warrior1: boolean = true): void {
    this.loadingbar = <HTMLDivElement>document.getElementById('child');
    console.log('this.loadingbar');
    console.log(this.loadingbar);

    if (!this.loadingbar) this.loadingbar = <HTMLDivElement>document.getElementsByClassName('abc')[0];

    warrior1 ? this.warrior1Name = name : this.warrior2Name = name;

    this.counterTimer = setTimeout(() => {

      if (this.warrior1Name && warrior1) this.imageCounterClock(this.warrior1Name, 0)
      if (this.warrior2Name && !warrior1) this.imageCounterClock(this.warrior2Name, 0)


    },500)
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

  public addAnotherContestant() {
    this.warrior2Called = true;
    this.contestantService.getRandomContestant()
    .subscribe({
      next: (randomOne: IContestantStats) => {
      this.gameStatsService.observables$
        .push(new BehaviorSubject<IDebugStat>(
          <IDebugStat>{name: 'Opposing Veggie', data: new BehaviorSubject(randomOne) }
        ))

      },error: (err: HttpErrorResponse) =>{
        console.error(err.status,err);
      },complete: () => {
        this.contestantService.changes.next(!this.contestantService.changes.getValue());
        this.drawOpposingVeggie();
      }
    });


  }

  public drawOpposingVeggie(){

    this.gameStatsService.observables$
      .find((x) => x.getValue().name == 'Opposing Veggie')
      ?.getValue()
      .data.asObservable()
      .subscribe((Stats2: IContestantStats) => {
        /***************
         *  We Start Creating Veggie
         */
        this.warrior2Stats = Stats2;
        this.warrior2Name = Stats2.name;
        this.warrior2Ready = false;
        console.log('Contenstant 2');
        console.log(Stats2.name);
        this.drawLoadingTopScreen(Stats2.name, false)
        // enemyName , enemyHpAmount , enemyMaxHp
        this.enemyName = Stats2.name;
        this.enemyMaxHp = Stats2.hp;

        this.imageService
          .generateImageWithName(Stats2.name)
          .subscribe((image: Blob) => {
            this.warrior2ImageBlob = image;
            console.log('Got Image!');
            createImageBitmap(image, 0, 0, 512, 512, {
              resizeWidth: 150,
              resizeHeight: 150,
            })
              .then((imageBitmap: ImageBitmap) => {
                this.bitmapCache2 = imageBitmap;
              })
              .finally(() => {
                this.contestantService.setContestantStatsById(this.warrior2Stats.id, this.warrior2Stats)
                .subscribe(() => { // its void at backend so happens or not we continue
                  this.warrior2Ready = true;
                  console.log('Drawing Image');
                  if (this.c) {
                    this.warrior2Called = false;
                    this.c.drawImage(this.bitmapCache2, 700, 60);
                    if (this.warrior1Ready) this.battleQueueStatus = QueueStatus.started;
                    let message = `Enemy Contestant enters the battlefield... Say hello to ${this.warrior2Name}!`;

                    if (this.warrior2Ready) this.battleQueue.push({ state: BattleState.dialogTextInput,message: message});
                    else this.dialogTextInput(message,false);

                    //this.dialogTextInput(`First Contestant enters the battlefield... Say hello to ${this.warrior1Name}!`, false);
                  }
                  });
                });
            });
          })
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
               // enemyName , enemyHpAmount , enemyMaxHp
              this.heroName = Stats.name;
              this.heroMaxHp = Stats.hp;

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
                      this.contestantService.setContestantStatsById(this.warrior1Stats.id, this.warrior1Stats)
                      .subscribe(() => { // its void at backend so happens or not we continue
                        this.warrior1Ready = true;
                        console.log('Drawing Image');
                        if (this.c) {
                          this.c.drawImage(this.bitmapCache, 200, 220);
                          this.battleQueueStatus = QueueStatus.calculating;
                          if (this.warrior2Ready) this.battleQueueStatus = QueueStatus.started;
                          let message = `Our mighty hero enters the battlefield... Say hello to ${this.warrior1Name}!`;

                          if (this.warrior2Ready) this.battleQueue.push({ state: BattleState.dialogTextInput,message: message});
                          else this.dialogTextInput(message,false);
                        }
                      });
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
