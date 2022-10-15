import { IContestantStats } from './../services/game-contestants.service';
import { GameImageService } from './../services/game-image.service';
import { AudioService } from './../services/audio.service';
import { GameStatsService } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.css'],
})
export class GameWindowComponent implements OnInit {
  canvas!: HTMLCanvasElement;
  c!: CanvasRenderingContext2D | null;
  clicked: boolean = false;
  bitmapCache: any;

  public flickerOn: boolean = false;

  constructor(private gameStatsService: GameStatsService,
              private audioService: AudioService,
              private imageService: GameImageService) {}

  ngOnInit(): void {
    this.gameStatsService.startSth();
  }

  ngAfterViewInit(): void {
    this.audioService.viewDidLoad();

    this.canvas = <HTMLCanvasElement>document.querySelector('canvas');
    this.c = this.canvas.getContext('2d');
    this.canvas.width = 1024;
    this.canvas.height = 576;

    if (this.c) {
      this.c.fillStyle = 'white';
      this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const image = new Image();
      image.src = '../../assets/veggie.png';

      image.onload = () => {

        setTimeout(() => {if (this.c) this.c.drawImage(image, 0, 0,this.canvas.width, this.canvas.height);},1000)

      }

    }

    addEventListener('click', () => {

      if(!this.clicked) {
        this.audioService.toggleBgMusicPlaying();


        this.clicked = true;

        if (this.gameStatsService.observables$.some(x => x.getValue().name == 'Random Veggie')){

          this.gameStatsService.observables$.find(x => x.getValue().name == 'Random Veggie')?.getValue().data.asObservable()
          .subscribe((Stats: IContestantStats) => {
            console.log('Contenstant')
            console.log(Stats.name)
            this.imageService.generateImageWithName(Stats.name)
            .subscribe((image: Blob) => {
              console.log('Got Image!')
              createImageBitmap(image)
              .then(imageBitmap => {
                  this.bitmapCache = imageBitmap;
                }).finally(() => {

                  console.log('Drawing Image');
                  if (this.c) {this.c.drawImage(this.bitmapCache, 0, 0)}

                } );

            })
          })

        }

        setTimeout(() => { // music has delay
          this.flickerOn = true;
          const image = new Image();
          image.src = '../../assets/battleBackground.png';

          image.onload = () => {

            setTimeout(() => {if (this.c) this.c.drawImage(image, 0, 0);},1000)
            setTimeout(() => {this.flickerOn = false},3000)
          }
        },2000);

      };
    })

    console.log(this.c);
  }

  public animateBattle() {
    window.requestAnimationFrame(this.animateBattle)

  }
}
