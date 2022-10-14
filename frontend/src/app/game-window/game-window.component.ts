import { GameStatsService } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.css'],
})
export class GameWindowComponent implements OnInit {
  canvas!: HTMLCanvasElement;
  c!: CanvasRenderingContext2D | null;

  public flickerOn: boolean = true;

  constructor(private gameStatsService: GameStatsService) {}

  ngOnInit(): void {
    this.gameStatsService.startSth();
  }

  ngAfterViewInit(): void {
    this.canvas = <HTMLCanvasElement>document.querySelector('canvas');
    this.c = this.canvas.getContext('2d');
    this.canvas.width = 1024;
    this.canvas.height = 576;

    if (this.c) {
      this.c.fillStyle = 'white';
      this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const image = new Image();
      image.src = '../../assets/battleBackground.png';
      this.flickerOn = true;

      image.onload = () => {

        setTimeout(() => {if (this.c) this.c.drawImage(image, 0, 0);},1000)
        setTimeout(() => {this.flickerOn = false},3000)


      };
    }

    console.log(this.c);
  }
}
