import { HealthBoxComponent } from './game-window/health-box/health-box.component';
import { DialogBoxComponent } from './game-window/dialog-box/dialog-box.component';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
      GameWindowComponent,
      DebugWindowComponent,
      PrettyPrintPipe,
      VideoPlayerComponent,
      DialogBoxComponent,
      HealthBoxComponent
   ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
