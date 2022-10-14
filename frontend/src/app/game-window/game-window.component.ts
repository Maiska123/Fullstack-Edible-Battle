import { GameStatsService, IDebugStat } from './../services/game-stats.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-window',
  templateUrl: './game-window.component.html',
  styleUrls: ['./game-window.component.css']
})
export class GameWindowComponent implements OnInit {

  constructor(private gameStatsService: GameStatsService) { }

  ngOnInit(): void {
    this.gameStatsService.startSth();

  }


}
