import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { HowlerPlayer } from '../utils/HowlerPlayer';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

bgMusicPlaying: boolean = false;
bgMusicPlayer!: HowlerPlayer;
inspirationPlayer!: HowlerPlayer;
public currentlyPlaying$: BehaviorSubject<string> = new BehaviorSubject<string>('null');

public viewDidLoad(twitchMode: boolean = false) {

  this.bgMusicPlayer =
  twitchMode ? new HowlerPlayer([
    "assets/audio/crickets.mp3",
    "assets/audio/crickets.mp3",
  ])
  : new HowlerPlayer([
    "assets/audio/battleBG7.mp3",
    "assets/audio/battleBG8.mp3",
    "assets/audio/battleBG9.mp3",
    "assets/audio/battleBG10.mp3",
    "assets/audio/pokemonvswild.mp3",
    "assets/audio/ff7battle.mp3",
    "assets/audio/battleBG1.mp3",
    "assets/audio/battleBG2.mp3",
    "assets/audio/battleBG3.mp3",
    "assets/audio/battleBG4.mp3",
    "assets/audio/pokemongymbattle.mp3",
    "assets/audio/battleBG5.mp3",
    "assets/audio/battleBG6.mp3",
  ]);

  this.bgMusicPlayer.currentlyPlaying$.subscribe((value) => {
    this.currentlyPlaying$.next(value);

  })

  this.inspirationPlayer =
   new HowlerPlayer([
    "assets/audio/inspiration1.mp3",
    "assets/audio/inspiration2.mp3",
    "assets/audio/inspiration3.mp3",
    "assets/audio/inspiration4.mp3",
    "assets/audio/inspiration5.mp3",
    "assets/audio/inspiration6.mp3",
    "assets/audio/inspiration7.mp3",
    "assets/audio/inspiration8.mp3",
    "assets/audio/inspiration9.mp3",
    "assets/audio/inspiration10.mp3",
    "assets/audio/inspiration11.mp3",
    "assets/audio/inspiration12.mp3",
    "assets/audio/inspiration13.mp3",
    "assets/audio/inspiration14.mp3",
    "assets/audio/inspiration15.mp3",
    "assets/audio/inspiration16.mp3"
  ]);

}

constructor() {


 }

 playThatOneSound(){
  this.inspirationPlayer.playGodsPlan(( Math.floor(Math.random() * (Math.ceil(16)) ) ));
 }

playTextSound(){
  this.bgMusicPlayer.playTextSound();
}

playOkSound(){
  this.bgMusicPlayer.playOkSound();
}

bringTheBeatBack() {
  this.bgMusicPlayer.bringTheBeatBack();
}

dimBGMusic() {
  this.bgMusicPlayer.dimMusic();
}


public playButtonSound(down: boolean = true){
  this.bgMusicPlayer.playButtonSound(down);
}

public toggleBgMusicPlaying(): void {
  if ( this.bgMusicPlaying )
    this.bgMusicPlayer.pause();
  else
    this.bgMusicPlayer.play();
  this.bgMusicPlaying = !this.bgMusicPlaying;
}

public skipBackward() {
  this.bgMusicPlayer.skip('prev');
}

public skipForward(){
  this.bgMusicPlayer.skip('next');
}



}
