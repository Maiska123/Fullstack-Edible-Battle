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
  nextOpponentIncoming
}

export interface BattleStatWithDescription{
  state: BattleState,
  message: string,
}

export enum AttackTurn{
  warrior1Attacked,
  warrior2Attacked,
}

export interface AttackQueueWithDescription{
  state: AttackTurn,
  message?: string,
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
  public bitmapCache!: ImageBitmap;
  public bitmapCache2!: ImageBitmap;
  readonly failoverCounter: number = 3;
  lastFetchedCounter: Date = new Date();
  accumulator: number = 1;
  private adjectivesToStart: string[] = ["angry","bold","brutal","cutthroat","dangerous","ferocious","fiery","furious","intense","murderous","passionate","powerful","raging","relentless","savage","stormy","strong","terrible","vehement","vicious","animal","ape","awful","barbarous","bloodthirsty","blustery","boisterous","brutish","cruel","enraged","fell","feral","flipped","frightening","horrible","howling","impetuous","infuriated","malevolent","malign","primitive","raving","tempestuous","threatening","tigerish","truculent","tumultous/tumultuous","uncontrollable","untamed","venomous","wild"];

  counterData1!: IWaitingCounter;

  warrior1Sprite: IWarriorSprite = {
    img: null,
    x: 200,
    y: 220,
    width: 250,
    height: 250,
    currentframe: 0,
    totalframes: 0,
  };

  warrior2Sprite: IWarriorSprite = {
    img: null,
    x: 700,
    y: 60,
    width: 150,
    height: 150,
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

  public dialogText: string = '';
  public textInputEnded: boolean = false;
  private dialogSubject: Subject<string> = new Subject<string>();

  public battleQueueStatus: QueueStatus = QueueStatus.stopped;
  public battleQueue: Array<BattleStatWithDescription> = [];
  public attackQueue: Array<AttackQueueWithDescription> = [];
  public lastMessageWritten: string = '';
  private currentGameState: BattleStatWithDescription | undefined;
  public lastMessageManuallyTriggered: boolean = false;
  private route: string = '';
  private twitchMode: boolean = false;
  private booleanFactor: boolean = true;
  private textCurrentlyRolling: boolean = false;
  public battleHasStarted: boolean = false;
  private lastRemaining1: number = 0;
  private lastRemaining2: number = 0;
  public gameOver: boolean = false;
  private hpLoss: number = 0;
  public haveSeenEnd: any;
  public warrior1haswon: boolean = false;
  public warrior1Won: boolean = false;
  public x: number = 50;
  public y: number = 50;
  public lastRender: number = Date.now();
  public renderCalled: boolean = false;
  public animationInterval: NodeJS.Timer | undefined;
  public backgroundImage: HTMLImageElement | undefined;
  public heroAttacking: boolean = true;

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
    });

    this.audioService.currentlyPlaying$.subscribe((value) => {
      this.gameStatsService.observables$.find((x) => x.value.name == 'Currently Playing')?.next({
        name: 'Currently Playing',
        data: new BehaviorSubject(value),
      }
      );
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
      document
        .getElementsByClassName('button')
        .item(Number(key))!
        .addEventListener('mousedown', () => {
          this.audioService.playButtonSound();
        });

      document
        .getElementsByClassName('button')
        .item(Number(key))!
        .addEventListener('mouseup', () => {
          this.audioService.playButtonSound(false);
        });
    }
  }

  private dialogTextInputEffect(
    text: string,
    textAt: number = 0,
    manuallyTriggered: boolean = true
  ) {
    if (textAt == 0) {
      this.lastMessageWritten = text;
    }

    if (
      this.textCurrentlyRolling &&
      !manuallyTriggered &&
      textAt <= text.length &&
      !this.lastMessageManuallyTriggered
    ) {
      this.audioService.playTextSound();
      this.dialogSubject.next(text.substring(0, textAt));

      this.textInputEnded = false;
      this.textCurrentlyRolling = true;

      if (this.battleHasStarted)
        this.battleQueueStatus = QueueStatus.calculating;

      this.dialogTextTimer = setTimeout(
        () => this.dialogTextInputEffect(text, textAt + 1, false),
        50
      );
    } else if (textAt > text.length || this.lastMessageManuallyTriggered || !this.textCurrentlyRolling) {
      // console.log('automatic textinput ended');

      this.dialogSubject.next(text);

      this.lastMessageManuallyTriggered = false;
      this.textInputEnded = true;
      if (this.battleHasStarted)
        this.battleQueueStatus = QueueStatus.waitingForUser;
      clearInterval(this.dialogTextTimer);

      this.dialogTextInput(text, true);
    }
  }

  public dialogTextInput(
    text: string,
    manuallyTriggered: boolean = false
  ): void {
    // kun käyttäjä kutsuu tätä
    //  this.lastMessageManuallyTriggered = true;
    // muuten
    //  this.lastMessageManuallyTriggered = false;
    //

    if (this.textInputEnded && manuallyTriggered) {
      this.textCurrentlyRolling = false;
      this.textInputEnded = true;

      this.audioService.playOkSound();
    } else if (!manuallyTriggered) {
      this.textCurrentlyRolling = true;

      this.lastMessageManuallyTriggered = false;
      this.dialogTextInputEffect(text, 0, false);
    } else if (
      this.battleQueueStatus == QueueStatus.calculating &&
      !this.textInputEnded
    ) {
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

  public evolveMyVeggie() {
    // this.warrior1ImageBlob = image;
    // let startX, startY, stopX, StopY;
    if (this.clicked && this.warrior1Ready) {
      this.warrior1EvolveStage = this.warrior1EvolveStage + 1;
      if (this.warrior1EvolveStage == 3) this.disableEvolve();
      if (this.warrior1EvolveStage <= 3) {
        createImageBitmap(
          this.warrior1ImageBlob,
          imagePosDescription[this.warrior1EvolveStage][0],
          imagePosDescription[this.warrior1EvolveStage][1],
          imagePosDescription[this.warrior1EvolveStage][2],
          imagePosDescription[this.warrior1EvolveStage][3],
          {
            resizeWidth: 250,
            resizeHeight: 250,
          }
        )
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

  private warrior1Hits(amount: number) {
    this.battleQueue.push({state: BattleState.warrior1Attacking,message: amount.toFixed(0)});
    this.battleQueue.push({state: BattleState.waitingForUser,message: `${this.warrior2Name} says: Ouch!`});
    this.attackQueue.push({state: AttackTurn.warrior1Attacked });
  }

  private warrior2Hits(amount: number) {
    this.battleQueue.push({state: BattleState.warrior2Attacking,message: amount.toFixed(0),});
    this.battleQueue.push({state: BattleState.waitingForUser,message: `${this.warrior1Name} says: Ouwie!`});
    this.attackQueue.push({state: AttackTurn.warrior2Attacked });

  }

  private battleCalculations() {
    // let count = 100;
    // lets assume we have 100 seconds
    // every round we have last remaining which are slowing next rounds down
    // but we have variation with luck

    let remaining1 =
      100 -
      this.warrior1Stats.speed *
        /*Luck Factor*/ ((Math.floor(Math.random() * (Math.ceil(this.warrior1Stats.luck))) +1) /10) +
      (this.lastRemaining1 - (Math.ceil(this.warrior1Stats.luck)));

    let remaining2 =
      100 -
      this.warrior2Stats.speed *
        /*Luck Factor*/ ((Math.floor(Math.random() * (Math.ceil(this.warrior2Stats.luck))) + 1) /10) +
      ((this.lastRemaining2 - (Math.ceil(this.warrior2Stats.luck))) % 100);


    console.log(['this.lastRemaining1',this.lastRemaining1]);
    console.log(['this.lastRemaining2',this.lastRemaining2]);
    console.log(['remaining1',remaining1]);
    console.log(['remaining2',remaining2]);

    this.lastRemaining1 = (remaining1 % 100);
    this.lastRemaining2 = (remaining2 % 100);

    // while (this.warrior1Stats.hp > 0 && this.warrior2Stats.hp > 0) {

    let warrior1Chance = false;
    let inequalityInBattle = false;

    if (this.attackQueue.length > 2) {
      let stabilization1 = this.attackQueue.filter((x) => x.state == AttackTurn.warrior1Attacked).length;
      let stabilization2 = this.attackQueue.filter((x) => x.state == AttackTurn.warrior2Attacked).length;


      if (stabilization1 !== stabilization2){
        inequalityInBattle = true;

        if ( (stabilization1 / stabilization2) >= (this.warrior1Stats.speed / this.warrior2Stats.speed)  )  {
          // lets give another one a chance
          warrior1Chance = false;
        }
        else {
          warrior1Chance = true;
        }
      }
    }

    if (!this.gameOver) {
      if ( (!inequalityInBattle && remaining1 < remaining2)
      || (inequalityInBattle && warrior1Chance)
      ) {
        // warrior 1 deals damage
        let damage =
          (this.warrior1Stats.attack / this.warrior2Stats.hp) *
            this.warrior1Stats.attack *
            (Math.ceil(this.warrior1Stats.luck)) -
          ((this.warrior2Stats.defence/10) * (Math.ceil(this.warrior2Stats.luck))) /
            this.warrior2Stats.hp;
        this.warrior1Hits(damage < 1 ? 1 : (Math.ceil(damage)*10));
      } else {
        // warrior 2 deals damage
        let damage =
          (this.warrior2Stats.attack / this.warrior1Stats.hp) *
            this.warrior2Stats.attack *
            (Math.ceil(this.warrior2Stats.luck)) -
          ((this.warrior1Stats.defence/10) * (Math.ceil(this.warrior1Stats.luck))) /
            this.warrior1Stats.hp;
        this.warrior2Hits(damage < 1 ? 1 : (Math.ceil(damage)*10));
      }
      // }
    }

    this.heroHpAmount = this.warrior1Stats.hp;
    this.enemyHpAmount = this.warrior2Stats.hp;

  }

  /**
   *
   *   PELIN HALLINTA!
   *
   */
  public calculateAndAdvanceBattle() {
    // PÄÄTILANESITTÄJÄ
    // this.battleQueueStatus = QueueStatus.waitingForUser

    // lets calculate battle till the end
    // we determine things and "steps" by the warrior stats

    // while(this.warrior1Stats.hp > 0 || this.warrior2Stats.hp > 0){
    //   // now lets calculate things to happen

    // }


    let gameState;

    if (
      (this.currentGameState == undefined || !this.battleQueue[0])
       && this.haveSeenEnd
    ) {
      this.battleQueue.push({
        state: BattleState.dialogTextInput,
        message: this.booleanFactor ? 'Game got to an end.' : '...',
      });
      this.booleanFactor = !this.booleanFactor;

      gameState = this.battleQueue.shift();
    } else if (this.gameOver  && this.haveSeenEnd) {
      this.battleQueue.push({
        state: BattleState.dialogTextInput,
        message:
          this.warrior1Stats.hp < 0 && this.warrior2Stats.hp > 0
            ? 'Hero has fallen. You Lose.'
            : 'You did beat that ugly veggie to the ground, GONGRATULATIONS!',
      });
    } else {
      gameState = this.battleQueue[0];
    }



    if (
      gameState?.state != BattleState.warrior1Attacking &&
      gameState?.state != BattleState.warrior2Attacking &&
      gameState?.state != BattleState.nextOpponentIncoming

    ) {
      this.battleCalculations();
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

    if (gameState?.state == BattleState.dialogTextInput) {
      this.lastMessageManuallyTriggered = true;

      if (
        this.battleQueueStatus == QueueStatus.waitingForUser &&
        (gameState != this.currentGameState || this.battleQueue[0] == undefined)
      ) {
        this.dialogTextInput(gameState.message, false);

        advance = true;
      } else if (this.battleQueueStatus == QueueStatus.calculating) {
        // this.dialogTextInput(gameState.message, false);
      }

      // dialogTextInput modifies battleQueueStatus!
    }
    if (gameState?.state == BattleState.warrior1Attacking) {
      // BATTLE ANIMATION!
      this.hpLoss = Number(gameState?.message);

      setTimeout(() => {
        this.warrior2Stats.hp -= this.hpLoss;
      }, 1100);

      this.dialogTextInput(
        `Our hero did ${gameState.message} damage to opponent!`,
        false
      );
      if ((this.warrior2Stats.hp < 0) && !this.warrior1Won) {
        this.battleQueue.push({
          state: BattleState.nextOpponentIncoming,
          message: 'New Rival incoming!',
        });
        this.warrior1Won = true;
      }
      advance = true;

      if ((this.warrior1Stats.hp < 0 )) {
        this.gameOver = true;
      }
    }
    if (gameState?.state == BattleState.warrior2Attacking) {
      // BATTLE ANIMATION!

      this.hpLoss = Number(gameState?.message);

      setTimeout(() => {
        this.warrior1Stats.hp -= this.hpLoss;
      }, 1100);

      this.dialogTextInput(
        `Opponent did ${gameState.message} damage to our hero!`,
        false
      );
      // this.battleQueue.push({ state: BattleState.dialogTextInput,message:`Opponent did ${gameState.message} damage to our hero!`});
      advance = true;
      if ((this.warrior1Stats.hp < 0 )) {
        this.gameOver = true;
      }
    }
    if (gameState?.state == BattleState.waitingForUser) {

      if (this.attackQueue.at(-1)?.state == AttackTurn.warrior1Attacked){
        this.animateAttackWarrior1();
      } else {
        this.animateAttackWarrior2();
      }
      advance = true
    }
    if (gameState?.state == BattleState.nextOpponentIncoming)
    {
      this.dialogTextInput(
        `${gameState.message}`,
        false
      );
        this.warrior2Called = false;
        this.warrior2Ready = false;
        this.battleHasStarted = false;
        this.battleQueueStatus = QueueStatus.calculating;
        this.warrior2Stats.hp = 1;
        this.battleQueue = [];
        this.attackQueue = [];
        this.addAnotherContestant();

    }

    if (advance) this.currentGameState = this.battleQueue.shift();

    // this.battleQueueStatus = QueueStatus.waitingForUser; // always ends at waiting for user
  }


  public startBattle() {
    this.battleQueue.push({
      state: BattleState.dialogTextInput,
      message: 'BATTLE HAS BEGUN!',
    });
    this.battleHasStarted = true;
    this.battleQueueStatus = QueueStatus.waitingForUser;

    this.heroHpAmount = this.warrior1Stats.hp;
    this.enemyHpAmount = this.warrior2Stats.hp;

    this.warrior1Won = false;

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
      let word =
        'You sure are ' +
        this.adjectivesToStart[
          Math.floor(Math.random() * this.adjectivesToStart.length) + 1
        ] +
        ' button clicker...';
      this.battleQueue.push({
        state: BattleState.dialogTextInput,
        message: word,
      });
    } else {
      // take next value from this.battleQueue
      if (
        this.warrior1Ready &&
        this.warrior2Ready &&
        this.battleQueue.length > 0 &&
        this.battleQueueStatus == QueueStatus.started
      ) {
        // battle begins
        console.log('startBattle');

        this.startBattle();
      } else if (
        this.battleQueueStatus == QueueStatus.waitingForUser &&
        this.battleHasStarted && !this.gameOver
      ) {
        // in battle
        console.log('in battle');

        this.calculateAndAdvanceBattle();
      } else if (this.gameOver) {
        if (!this.haveSeenEnd) {

          this.pushedButton('green');
        } else {
          this.calculateAndAdvanceBattle();
          let word = `Game has ended. You ${this.warrior1Stats.hp < this.warrior2Stats.hp ? 'lost' : 'won'}.`
          setTimeout(() => {
            this.dialogTextInput(word, false);
            this.haveSeenEnd = true;
          }, 500);
        }
      }
    }
  }

  public pushedButton(callbackName?: string) {
    switch (callbackName) {
      case 'red':
        if (!this.clicked) {
          // first time clicking
          this.battleQueueStatus = QueueStatus.calculating;

          this.addBattleStartClickHandler();
          let word = `Started ${
            this.adjectivesToStart[
              Math.floor(Math.random() * this.adjectivesToStart.length) + 1
            ]
          } Battle...`;
          // this.battleQueue.push({ state: BattleState.dialogTextInput, message: word });
          setTimeout(() => {
            this.dialogTextInput(word, false);
          }, 2000);
        } else {
          // all the rest
          if (!this.warrior2Ready && !this.warrior2Called && !this.warrior1Won) {
            this.audioService.playOkSound();
            this.addAnotherContestant();
          } else if (
            ( this.battleQueueStatus == QueueStatus.waitingForUser ||
            this.battleQueueStatus == QueueStatus.started ) || (!this.haveSeenEnd && this.gameOver)
          ) {
            console.log('BattleAdvanced');
            this.advanceBattle();
          } else if (
            this.battleQueueStatus == QueueStatus.calculating
          ){
            if (this.textCurrentlyRolling){
              this.textCurrentlyRolling = false;
            }
          }
        }

        break;
      case 'green':
        this.wannaBeAlgoExpert();
        break;
      case 'blue':
        this.evolveMyVeggie();
        break;
      default:
        break;
    }
  }

  public disableEvolve() {
    document.getElementById('disabled-button2')?.setAttribute('disabled', '');
  }

  public wannaBeAlgoExpert() {

    if (!this.gameOver) {
      if (this.algorythmsMan) {
        VideoPlayerComponent.videoShow = false;

        VideoPlayerComponent.powerSwitch();

        setTimeout(() => {
          this.algorythmsMan = false;
          this.audioService.bringTheBeatBack();

          document
            .getElementById('disabled-button1')
            ?.removeAttribute('disabled');
          if (!(this.warrior1EvolveStage == 3))
            document
              .getElementById('disabled-button2')
              ?.removeAttribute('disabled');
        }, 500);
      }
    }

    this.algorythmsMan = true;

    if (this.gameOver) {
      this.audioService.bgMusicPlayer.stop() ;
    document.getElementById('disabled-button3')?.setAttribute('disabled', '');

    } else this.audioService.dimBGMusic();

    document.getElementById('disabled-button1')?.setAttribute('disabled', '');
    document.getElementById('disabled-button2')?.setAttribute('disabled', '');

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
    if (this.c) {
      if (this.loadingbar) {
        if (Number(this.loadingbar.style.width) >= this.c.canvas.width)
          this.accumulator = 0;
        else this.accumulator += 1;
      }
    }

    this.activateLoadingBar();

    if ((new Date().getTime()) - this.lastFetchedCounter.getTime() > 1000) {
      this.imageService.getImageGenerationCounterByName(name).subscribe({
        next: (counterData: IWaitingCounter) => {
          this.counterData1 = counterData;
          if (this.loadingPercentage == NaN) this.loadingPercentage = 0;
          if (this.loadingPercentage < 1) {
            let value = this.loadingPercentage;
            value = counterData.counterValue / counterData.counterMax;
            console.log('value');
            console.log(value);
            this.loadingPercentage = value;
          }
          this.loadingPercentage += 0.01;
        },
        error: (err: HttpErrorResponse) => {
          console.error(err.status, err);
          if (this.warrior1Name && this.failoverCounter > count) {
            this.imageCounterClock(this.warrior1Name, count + 1);
          } else {
            if (this.loadingPercentage >= 1 || this.failoverCounter < count) {
              clearInterval(this.counterTimer);
            } else {
              if (!(this.failoverCounter <= count))
                this.imageCounterClock(this.warrior1Name, count + 1);
            }
          }
        },
        complete: () => {
          if (
            this.failoverCounter <= count ||
            this.counterData1.counterValue == this.counterData1.counterMax
          ) {
            clearInterval(this.counterTimer);
            clearTimeout(this.timer);
          } else {
            this.counterTimer = setTimeout(() => {
              if (this.failoverCounter <= count) {
                clearTimeout(this.timer);
                clearInterval(this.counterTimer);
              } else {
                if (this.warrior1Name && this.failoverCounter > count)
                  this.imageCounterClock(this.warrior1Name, count);
              }
            }, 100);
          }
        },
      });
      this.lastFetchedCounter = new Date();
    }
  }

  public drawLoadingTopScreen(name: string, warrior1: boolean = true): void {
    this.loadingbar = <HTMLDivElement>document.getElementById('child');
    console.log('this.loadingbar');
    console.log(this.loadingbar);

    if (!this.loadingbar)
      this.loadingbar = <HTMLDivElement>(
        document.getElementsByClassName('abc')[0]
      );

    warrior1 ? (this.warrior1Name = name) : (this.warrior2Name = name);

    this.counterTimer = setTimeout(() => {
      if (this.warrior1Name && warrior1)
        this.imageCounterClock(this.warrior1Name, 0);
      if (this.warrior2Name && !warrior1)
        this.imageCounterClock(this.warrior2Name, 0);
    }, 500);
  }

  public activateLoadingBar() {
    if (!this.loadingbar)
      this.loadingbar = <HTMLDivElement>(
        document.getElementsByClassName('abc')[0]
      );
    else {
      this.loadingbar.style.width =
        (this.loadingPercentage * 6 * 170.66 + this.accumulator).toFixed(0) +'px'; // 10,24
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
    if (!this.warrior2Called) {
      this.warrior2Called = true;
      this.contestantService.getRandomContestant().subscribe({
        next: (randomOne: IContestantStats) => {
          if (!this.gameStatsService.observables$.find((x) => x.value.name == 'Opposing Veggie')){
            this.gameStatsService.observables$.push(
              new BehaviorSubject<IDebugStat>(<IDebugStat>{
                name: 'Opposing Veggie',
                data: new BehaviorSubject(randomOne),
              })
            );
          } else {
            this.gameStatsService.observables$.find((x) => x.value.name == 'Opposing Veggie')?.next(
              {
                name: 'Opposing Veggie',
                data: new BehaviorSubject(randomOne),
              }
            )
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error(err.status, err);
        },
        complete: () => {
          this.contestantService.changes.next(
            !this.contestantService.changes.getValue()
          );
          this.drawOpposingVeggie();
        },
      });
    }
  }

  public drawOpposingVeggie() {
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
        this.drawLoadingTopScreen(Stats2.name, false);
        // enemyName , enemyHpAmount , enemyMaxHp
        this.enemyName = Stats2.name;
        this.enemyMaxHp = Stats2.hp;

        this.imageService.generateImageWithName(Stats2.name).subscribe({
          next: (image: Blob) => {
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
                this.contestantService
                  .setContestantStatsById(
                    this.warrior2Stats.id,
                    this.warrior2Stats
                  )
                  .subscribe(() => {
                    // its void at backend so happens or not we continue
                    this.warrior2Ready = true;
                    console.log('Drawing Image');
                    if (this.c) {
                      this.warrior2Called = false;
                      this.c.drawImage(this.bitmapCache2, 700, 60);
                      if (this.warrior1Ready)
                        this.battleQueueStatus = QueueStatus.started;
                      let message = `Enemy Contestant enters the battlefield... Say hello to ${this.warrior2Name}!`;

                      if (this.warrior2Ready && this.warrior1Ready)
                        this.battleQueue.push({
                          state: BattleState.dialogTextInput,
                          message: message,
                        });
                      else this.dialogTextInput(message, false);

                      //this.dialogTextInput(`First Contestant enters the battlefield... Say hello to ${this.warrior1Name}!`, false);
                    }
                  });
              });
          },
          error: () => {
            let placeholderImage = new Image();
            placeholderImage.src = 'assets/placeholder_vegetable.jpg';

            placeholderImage.onload = () => {
              this.warrior2Ready = true;
              console.log('Drawing Image');
              if (this.c) {
                this.warrior2Called = false;
                this.c.drawImage(placeholderImage, 700, 60);
                if (this.warrior1Ready)
                  this.battleQueueStatus = QueueStatus.started;
                let message = `Enemy Contestant enters the battlefield... Say hello to ${this.warrior2Name}!`;

                if (this.warrior2Ready)
                  this.battleQueue.push({
                    state: BattleState.dialogTextInput,
                    message: message,
                  });
                else this.dialogTextInput(message, false);

                //this.dialogTextInput(`First Contestant enters the battlefield... Say hello to ${this.warrior1Name}!`, false);
              }
            };
          },
          complete: () => {
            // this.startBattle();
          },
        });
      });
  }

  public addBattleStartClickHandler(): void {
    if (!this.algorythmsMan) {
      if (
        !this.clicked &&
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
              this.drawLoadingTopScreen(Stats.name);
              // enemyName , enemyHpAmount , enemyMaxHp
              this.heroName = Stats.name;
              this.heroMaxHp = Stats.hp;

              this.imageService.generateImageWithName(Stats.name).subscribe({
                next: (image: Blob) => {
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
                      this.contestantService
                        .setContestantStatsById(
                          this.warrior1Stats.id,
                          this.warrior1Stats
                        )
                        .subscribe(() => {
                          // its void at backend so happens or not we continue
                          this.warrior1Ready = true;
                          console.log('Drawing Image');
                          if (this.c) {
                            this.c.drawImage(this.bitmapCache, 200, 220);
                            this.battleQueueStatus = QueueStatus.calculating;
                            if (this.warrior2Ready)
                              this.battleQueueStatus = QueueStatus.started;
                            let message = `Our mighty hero enters the battlefield... Say hello to ${this.warrior1Name}!`;

                            if (this.warrior2Ready)
                              this.battleQueue.push({
                                state: BattleState.dialogTextInput,
                                message: message,
                              });
                            else this.dialogTextInput(message, false);
                          }
                        });
                    });
                },
                error: () => {
                  let placeholderImage = new Image();
                  placeholderImage.src = 'assets/placeholder_vegetable.jpg';

                  placeholderImage.onload = () => {
                    this.contestantService
                      .setContestantStatsById(
                        this.warrior1Stats.id,
                        this.warrior1Stats
                      )
                      .subscribe(() => {
                        // its void at backend so happens or not we continue
                        this.warrior1Ready = true;
                        console.log('Drawing Image');
                        if (this.c) {
                          this.c.drawImage(placeholderImage, 200, 220);
                          this.battleQueueStatus = QueueStatus.calculating;
                          if (this.warrior2Ready)
                            this.battleQueueStatus = QueueStatus.started;
                          let message = `Our mighty hero enters the battlefield... Say hello to ${this.warrior1Name}!`;

                          if (this.warrior2Ready)
                            this.battleQueue.push({
                              state: BattleState.dialogTextInput,
                              message: message,
                            });
                          else this.dialogTextInput(message, false);
                        }
                      });
                  };
                },
                complete: () => {},
              });
            });
        }

        setTimeout(() => {
          // music has delay
          this.flickerOn = true;
          const image = new Image();
          image.src = 'assets/battleBackground.png';

          image.onload = () => {
            this.backgroundImage = image;
            setTimeout(() => {
              if (this.c) this.c.drawImage(image, 0, 0);
            }, 1000);
            setTimeout(() => {
              this.flickerOn = false;
            }, 2000);
          };
        }, 2000);
      }
    }
  }

  public render() {

      let delta = Date.now() - this.lastRender;
      this.x += delta;
      this.y += delta;
      this.c!.fillStyle = 'black';
      this.c!.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.c!.drawImage(this.backgroundImage!,0,0,this.canvas.width,this.canvas.height);
      /* Animations
       */
      if (this.heroAttacking){
        this.warrior1AttackingSpritesUpdate();
        this.warrior1AttackingSpritesDraw();
        this.c!.drawImage(this.bitmapCache2, 700, 60);
      } else {
        this.warrior2AttackingSpritesUpdate();
        this.warrior2AttackingSpritesDraw();
        this.c!.drawImage(this.bitmapCache, 200, 220);
      }

      if (this.renderCalled) window.requestAnimationFrame(() => this.render());
  }

  private warrior1AttackingSpritesUpdate() {
    /* Päivitetään liikehdintä muuttujasta this.warrior1Sprite
        x: 200,
        y: 220,
        width: 250,
        height: 250,
     */
    if (this.warrior1Sprite.currentframe < 50){
      if (this.warrior1Sprite.x > 150) this.warrior1Sprite.x--;

    } else if (this.warrior1Sprite.currentframe >= 50 &&
                this.warrior1Sprite.currentframe < 200 ) {
      if (this.warrior1Sprite.x < 190) this.warrior1Sprite.x += 3;
      if (this.warrior1Sprite.y < 200) this.warrior1Sprite.y += 3;

    } else if (this.warrior1Sprite.currentframe >= 200 &&
                this.warrior1Sprite.currentframe < 350 ) {
      if (this.warrior1Sprite.x > 200) this.warrior1Sprite.x -= 3;
      if (this.warrior1Sprite.y < 220) this.warrior1Sprite.y += 3;
      }
    console.table([
      this.warrior1Sprite.currentframe,
      this.warrior1Sprite.x,
      this.warrior1Sprite.y]);

    this.warrior1Sprite.currentframe++;

  }
  private warrior1AttackingSpritesDraw() {
    /* Piirretään liikehdintä muuttujasta this.warrior1Sprite
     */
    this.c!.drawImage(this.bitmapCache, this.warrior1Sprite.x, this.warrior1Sprite.y);

  }

  private warrior2AttackingSpritesUpdate() {
    /* Päivitetään liikehdintä muuttujasta this.warrior2Sprite
        x: 700,
        y: 60,
        width: 150,
        height: 150,
     */
        if (this.warrior2Sprite.currentframe < 25){
          if (this.warrior2Sprite.x < 730) this.warrior2Sprite.x++;
        } else if (this.warrior2Sprite.currentframe >= 25 &&
                    this.warrior2Sprite.currentframe < 200 ) {
          if (this.warrior2Sprite.x > 600) this.warrior2Sprite.x -= 3;
          if (this.warrior2Sprite.y < 150) this.warrior2Sprite.y += 3;
        } else if (this.warrior2Sprite.currentframe >= 200 &&
                    this.warrior2Sprite.currentframe < 350 ) {
          if (this.warrior2Sprite.x < 700) this.warrior2Sprite.x += 3;
          if (this.warrior2Sprite.y > 60) this.warrior2Sprite.y -= 3;
          }
    console.table([
      this.warrior2Sprite.currentframe,
      this.warrior2Sprite.x,
      this.warrior2Sprite.y]);

        this.warrior2Sprite.currentframe++;

  }
  private warrior2AttackingSpritesDraw() {
    /* Piirretään liikehdintä muuttujasta this.warrior1Sprite
     */
    this.c!.drawImage(this.bitmapCache2, this.warrior2Sprite.x, this.warrior2Sprite.y);

  }

  /* MAIN ANIMATE CALL */
  public animateBattle(heroAttacking: boolean) {

    this.renderCalled = true;
    this.heroAttacking = heroAttacking;

    /* Back to origin with timeout
    */
    setTimeout(() => {
      this.renderCalled = false;
      this.c!.fillStyle = 'black';
      this.c!.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.c!.drawImage(this.backgroundImage!,0,0,this.canvas.width,this.canvas.height);
      this.c!.drawImage(this.bitmapCache, 200, 220);
      this.c!.drawImage(this.bitmapCache2, 700, 60);
      this.warrior1Sprite = {
        img: null,
        x: 200,
        y: 220,
        width: 250,
        height: 250,
        currentframe: 0,
        totalframes: 0,
      };

      this.warrior2Sprite = {
        img: null,
        x: 700,
        y: 60,
        width: 150,
        height: 150,
        currentframe: 0,
        totalframes: 0,
      };
    }, 3000);

    this.render();

  }

  public animateAttackWarrior1() {

    this.animateBattle(true);
  }

  public animateAttackWarrior2() {

    this.animateBattle(false);

  }

}
