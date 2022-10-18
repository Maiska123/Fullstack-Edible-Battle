import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent implements OnInit {
  @Input() inputData: string = '';
  @Input() inputEnded: boolean = false;
  constructor() { }

  ngOnInit() {
    // this.inputData.substring()
    // First Contestant enters the battlefield... Say hello to flamin Pear, With Skin!adsadsd
    // 87
    // more than that - advance lines
  }

}
