import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {
  @Input() gameOver: boolean = false;

  public static videoShow: boolean = false;

  constructor() { }

  ngOnInit() {
    var video = document.getElementsByTagName('video')[0];

    if (this.gameOver){
      video.style.display ='none';
      video.setAttribute('autoplay','false');
      document.getElementById('text')!.innerHTML = 'Game Over';
    } else {
      video.setAttribute('autoplay','true');
      video.onended = function(e) {
        video.style.display ='none';
      };
    }

  }

  ngAfterViewInit(): void {
    var video = document.getElementsByTagName('video')[0];

    if (this.gameOver){
      video.style.display ='none';
      video.setAttribute('autoplay','false');
      document.getElementById('text')!.innerHTML = 'Game Over';
    } else {
      video.setAttribute('autoplay','true');
      video.onended = function(e) {
        video.style.display ='none';
      };
    }
  }


  public static powerSwitch() {
    let body = document.getElementById("wrapper");
    body!.className = (body!.className == "on") ? "off" : "on";
    if (!this.videoShow) document.getElementsByTagName('video')[0].style.display = 'none';

  }
}
