import { Injectable } from '@angular/core';
import { HowlerPlayer } from '../utils/HowlerPlayer';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

bgMusicPlaying: boolean = false;
bgMusicPlayer!: HowlerPlayer;

public viewDidLoad() {
  this.bgMusicPlayer = new HowlerPlayer([
    "assets/ff7battle.mp3",
    "assets/pokemonvswild.mp3",
    "assets/ff7battle.mp3",
    "assets/pokemongymbattle.mp3",
  ]);
}

constructor() { }

playTextSound(){
  this.bgMusicPlayer.playTextSound();
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
