import { Howl } from 'howler';

import { Observable, Observer, Subject } from 'rxjs';

export interface SoundInterface {
  sourceUrl: string;
  howl: Howl;
}

export interface SpriteInterface {
  src: string,
  sprite: {
    [key:string]: number[]
  }
}

export interface SoundProgressInterface {
  played: number;
  remaining: number;
  position: number;
}

export class HowlerPlayer {
  private _sounds: Array<SoundInterface>;
  private _sprites!: Howl;
  private _textSprites!: Howl;
  private _index: number;
  public currentlyPlaying$: Subject<string> = new Subject<string>();
  private $progress: Subject<SoundProgressInterface>;
  private _OkSprites: Howl;


  playTextSound(){
    this._textSprites.play('textinput');
  }

  playOkSound(){
    this._OkSprites.play('cursor');
  }

  dimMusic(){
    let sound = this._sounds[this._index]!.howl;
    if (sound) sound.volume(0.3)
  }

  bringTheBeatBack() {
    let sound = this._sounds[this._index]!.howl;
    if (sound) sound.volume(1)
    // sound.volume(1.5)
  }

  /** */
  constructor(playlist: Array<String>) {
    this._index = 2;
    this._sounds = playlist.map((pSong: any) => ({
      sourceUrl: pSong,
      howl: null,
    } as unknown as SoundInterface )) as SoundInterface[];

    this.$progress = new Subject();

    this._sprites = new Howl({
      src: ['assets/audio/button-click.wav'],
      sprite: {
        buttondown: [50, 200],
        buttonup: [300, 500]
      }
    });

    this._textSprites = new Howl({
      src: ['assets/audio/typewriter.mp3'],
      sprite: {
        textinput: [100, 200]
      }
    });

    this._OkSprites = new Howl({
      src: ['assets/audio/ff7cursor.mp3'],
      sprite: {
        cursor: [0, 200]
      }
    });


  }

  public playButtonSound(down: boolean): void {
    down ?
    this._sprites.play('buttondown')
    : this._sprites.play('buttonup');
  }

  /** */
  public play(index: number = 0, volDown?: boolean) {

    let sound = this._sounds[index];

    sound.howl = new Howl({
      src: [sound.sourceUrl],
      html5: true,
      autoplay: false,
      volume: volDown ? 0.5 : 1,

      onplay: () => {
        requestAnimationFrame(this.seekStep); //  PROGRESS STEP CALL
      },
      onseek: () => {
        // Start upating the progress of the track.
        requestAnimationFrame(this.seekStep);
      },
      onend: () => {
        this.skip('next');
      },
    });

    this.index = index;

    if (sound.howl == null) {
      this.skip();
    } else {
      let howl = sound.howl;
      howl.fade(0, 1, 200);
      howl.play();
    }
    this.currentlyPlaying$.next(sound.sourceUrl.match('\/(?!audio\/)(([a-z]).*)\..*')![0].replace('/',''));
  }

  public playGodsPlan(index: number = 0, volDown?: boolean) {

    let sound = this._sounds[index];

    sound.howl = new Howl({
      src: [sound.sourceUrl],
      html5: true,
      autoplay: false,
      volume: 1,

      onplay: () => {
        requestAnimationFrame(this.seekStep); //  PROGRESS STEP CALL
      },
      onseek: () => {
        // Start upating the progress of the track.
        requestAnimationFrame(this.seekStep);
      },
      onend: () => {
        // this.skip('next');
      },
    });

    this.index = index;

    if (sound.howl == null) {
      this.skip();
    } else {
      let howl = sound.howl;
      howl.fade(0, 1, 200);
      howl.play();
    }
    // this.currentlyPlaying$.next(sound.sourceUrl.match('\/(?!audio\/)(([a-z]).*)\..*')![0].replace('/',''));
  }

  /** */
  public pause(): void {
    let sound = this._sounds[this._index].howl;
    if (sound) {
      sound.fade(1, 0, 200);
      sound.once('fade', () => {
        sound.pause();
        sound.volume(1);
      });
    }
  }

  /** */
  public stop(): void {
    let sound = this._sounds[this._index].howl;
    if (sound) {
      sound.fade(1, 0, 100);
      sound.once('fade', () => {
        sound.stop();
        sound.volume(1);
      });
    }
  }

  /** */
  public get index(): number {
    return this._index;
  }

  /** */
  public set index(index: number) {
    this.stop();
    this._index = index;
  }

  /** */
  public skip(direction: string = 'next'): void {
    let newIndex: number = this._index;
    if (direction === 'next') {
      newIndex = newIndex + 1 >= this._sounds.length ? 0 : newIndex + 1;
    } else {
      newIndex = newIndex - 1 < 0 ? this._sounds.length - 1 : newIndex - 1;
    }

    this.skipTo(newIndex);
  }

  /***/
  public skipTo(index: number) {
    if (!index || index > this._sounds.length) index = 0;

    this.currentlyPlaying$.next(this._sounds[index].sourceUrl.match('\/(?!audio\/)(([a-z]).*)\..*')![0].replace('/',''));

    this.play(index);
  }

  /** */
  public fastforward(secs: number = 5): void {
    let sound = this._sounds[this._index].howl;
    let timeToSeek = sound.seek() + secs;

    if (timeToSeek >= sound.duration()) {
      this.skip();
    } else {
      sound.seek(timeToSeek);
    }
  }

  /** */
  public rewind(secs: number = 5): void {
    let sound = this._sounds[this._index].howl;
    let timeToSeek = sound.seek() - secs;

    timeToSeek = timeToSeek <= 0 ? 0 : timeToSeek;

    sound.seek(timeToSeek);
  }

  /** */
  private seekStep = () => {
    let sound = this._sounds[this._index].howl;

    if (sound.playing()) {
      let sSeek = sound.seek(),
        sDuration = sound.duration();
      let progress: SoundProgressInterface = {
        played: sSeek,
        remaining: sDuration - sSeek,
        position: Math.round((sSeek * 100) / sDuration),
      };
      this.$progress.next(progress);

      requestAnimationFrame(this.seekStep);
    }
  };

  /** */
  public onPlay(): Subject<SoundProgressInterface> {
    return this.$progress;
  }
}
