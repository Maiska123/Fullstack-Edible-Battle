import { Howl } from 'howler';

import { Observable, Observer, Subject } from 'rxjs';

export interface SoundInterface {
  sourceUrl: string;
  howl: Howl;
}

export interface SoundProgressInterface {
  played: number;
  remaining: number;
  position: number;
}

export class HowlerPlayer {
  private _sounds: Array<SoundInterface>;
  private _index: number;

  private $progress: Subject<SoundProgressInterface>;

  /** */
  constructor(playlist: Array<String>) {
    this._index = 1;
    this._sounds = playlist.map((pSong: any) => ({
      sourceUrl: pSong,
      howl: null,
    } as unknown as SoundInterface )) as SoundInterface[];

    this.$progress = new Subject();
  }

  /** */
  public play(index: number = 0) {
    if (index == 0) index = this._index;
    else if (index < 0 || index >= this._sounds.length) index = 0;

    let sound = this._sounds[index];
    if (!sound.howl) {
      sound.howl = new Howl({
        src: [sound.sourceUrl],
        html5: true,
        autoplay: false,
        volume: 0,
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
    }
    this.index = index;

    let howl = sound.howl;
    howl.fade(0, 1, 500);
    howl.play();
  }

  /** */
  public pause(): void {
    let sound = this._sounds[this._index].howl;
    if (sound) {
      sound.fade(1, 0, 500);
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
      sound.fade(1, 0, 500);
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

    newIndex = newIndex == 0 ? newIndex + 1 : newIndex;

    this.skipTo(newIndex);
  }

  /***/
  public skipTo(index: number) {
    if (index < 0 || index >= this._sounds.length) index = 0;

    this.stop();
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
