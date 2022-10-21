import { Injectable } from '@angular/core';
import { HowlerPlayer } from '../utils/HowlerPlayer';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

bgMusicPlaying: boolean = false;
bgMusicPlayer!: HowlerPlayer;

public viewDidLoad(twitchMode: boolean = false) {

  this.bgMusicPlayer =
  twitchMode ? new HowlerPlayer([
    "assets/audio/crickets.mp3",
    "assets/audio/crickets.mp3",
    "assets/audio/crickets.mp3",
    "assets/audio/crickets.mp3",
  ])
  : new HowlerPlayer([
    "assets/audio/ff7battle.mp3",
    "assets/audio/pokemonvswild.mp3",
    "assets/audio/ff7battle.mp3",
    "assets/audio/pokemongymbattle.mp3",
    "assets/audio/battleBG1.mp3",
    "assets/audio/battleBG2.mp3",
    "assets/audio/battleBG3.mp3",
    "assets/audio/battleBG4.mp3",
    "assets/audio/battleBG5.mp3",
    "assets/audio/battleBG6.mp3",
    "assets/audio/battleBG7.mp3",
    "assets/audio/battleBG8.mp3",
    "assets/audio/battleBG9.mp3",
    "assets/audio/battleBG10.mp3",
  ]);

}

constructor() { }

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
