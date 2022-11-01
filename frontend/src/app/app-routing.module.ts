import { DebugWindowComponent } from './debug-window/debug-window.component';
import { GameWindowComponent } from './game-window/game-window.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // i know this is ugly and not the proper way but dang - made whole thing in 3 weeks (excluding few days)
  { path: 'game', component: GameWindowComponent },
  { path: 'game/survival', component: GameWindowComponent },
  { path: 'game/twitch/survival', component: GameWindowComponent },
  { path: 'game/twitch', component: GameWindowComponent },
  { path: 'game/debug', component: GameWindowComponent },
  { path: 'game/debug/survival', component: GameWindowComponent },
  { path: 'game/debug/twitch', component: GameWindowComponent },
  { path: 'debug', component: DebugWindowComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
