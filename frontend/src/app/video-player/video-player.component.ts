import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {


  }

  public static powerSwitch() {
    let body = document.getElementById("wrapper");
    body!.className = (body!.className == "on") ? "off" : "on";
  }
}
