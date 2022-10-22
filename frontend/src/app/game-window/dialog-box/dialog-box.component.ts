import { trigger, state, style, transition, animate, stagger, group, query } from '@angular/animations';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css'],
  animations: [
    trigger('openClose', [

      state('true', style({ width: '250px' , opacity: 1, height: '28px' })),
      state('false', style({ width: '0px' , opacity: 0, height: '0px' })),

      transition('false => true', [
        style({ opacity: 0, width: '0px', height: '0px'}),
        query(':self',[
          style({ padding: '0px', width: '0px' , opacity: 0 }),
           animate(300),
           stagger(150, [
            animate('300ms ease', style({ padding: '8px', width: '250px' , opacity: 1, height: '0px' })),
          ]),
          stagger(150, [
            animate('700ms ease-out', style({ padding: '8px', width: '250px' , opacity: 1, height: '28px' })),
          ]),
        ])
        ]),
      transition('true => false', [
        style({ width: '250px' , opacity: 1, height: '28px' }),
        query(':self',[
          style({ height: '0px'  , opacity: 0}),
            animate(300),
            stagger(150, [
            animate('300ms ease-out', style({ width: '0px' })),
          ]),
        ])
      ]),
    ]),

  ],
})
export class DialogBoxComponent implements OnInit {
  @Input() inputData: string = '';
  @Input() inputEnded: boolean = false;
  public isOpen: boolean = false;

  constructor() { }

  ngOnInit() {
    // this.inputData.substring()
    // First Contestant enters the battlefield... Say hello to flamin Pear, With Skin!adsadsd
    // 87
    // more than that - advance lines
    this.isOpen = false;
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    setTimeout(() => {
      this.isOpen = true;
   }, 1000);
  }

}
