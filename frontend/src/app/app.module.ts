import { PrettyPrintPipe } from './utils/pipes/PrettyPrint.pipe';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameWindowComponent } from './game-window/game-window.component';
import { DebugWindowComponent } from './debug-window/debug-window.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { VideoPlayerComponent } from './video-player/video-player.component';

@NgModule({
  declarations: [	
    AppComponent,
      GameWindowComponent,
      DebugWindowComponent,
      PrettyPrintPipe,
      VideoPlayerComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
