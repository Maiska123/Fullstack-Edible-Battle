import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {
  @Input() gameOver: boolean = false;
  @Input() gameOverText: string = '';

  public static videoShow: boolean = false;

  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    var video = document.getElementsByTagName('video')[0];

    if (video) {
      if (this.gameOver){
        video.style.display ='none';
        video.setAttribute('autoplay','false');
      } else {
        video.setAttribute('autoplay','true');
        video.onended = function(e) {
          video.style.display ='none';
        };
      }
    }
    if (this.gameOver) document.getElementById('text')!.innerHTML =
    '<span>Game Over</span><br><span>' + this.gameOverText + '</span>'
    // 'Game Over' + this.gameOverText;
  }


  public static powerSwitch() {
    let body = document.getElementById("wrapper");
    body!.className = (body!.className == "on") ? "off" : "on";
    if (!this.videoShow) document.getElementsByTagName('video')[0].style.display = 'none';

  }
}
