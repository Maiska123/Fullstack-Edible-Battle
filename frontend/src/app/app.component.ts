import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'VeggieBattleFrontend';
  isDebug: boolean = false;
  isDebugMiniview: boolean = false;
  route: string = '';
  /**
   *
   */
  constructor(private router: Router,
              private location: Location) {
                router.events.subscribe((val) => {
                  if(location.path() != ''){
                    this.route = location.path();
                  } else {
                    this.route = '/game'
                  }
                  if (this.route.includes('debug') && !this.route.includes('game')) this.isDebug = true;
                  if (this.route.includes('debug') && this.route.includes('game')) this.isDebugMiniview = true;
                });}
}
