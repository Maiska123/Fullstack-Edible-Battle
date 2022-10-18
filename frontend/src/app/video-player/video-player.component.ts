import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {

  public static videoShow: boolean = false;

  constructor() { }

  ngOnInit() {


  }

  ngAfterViewInit(): void {
    var video = document.getElementsByTagName('video')[0];

    video.onended = function(e) {
      video.style.display ='none';
    };
  }


  public static powerSwitch() {
    let body = document.getElementById("wrapper");
    body!.className = (body!.className == "on") ? "off" : "on";
    if (!this.videoShow) document.getElementsByTagName('video')[0].style.display = 'none';

  }
}
