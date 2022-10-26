import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-health-box',
  templateUrl: './health-box.component.html',
  styleUrls: ['./health-box.component.scss'],
  animations: [
    trigger('openClose', [

      state('true', style({ width: '258px' , opacity: 1, height: '65px' })),
      state('false', style({ width: '0px' , opacity: 0, height: '0px' })),

      transition('false => true', [
        style({ opacity: 0, width: '0px', height: '0px'}),
        query(':self',[
          style({ padding: '0px', width: '0px' , opacity: 0 }),
           animate(300),
           stagger(150, [
            animate('300ms ease', style({ padding: '8px', width: '258px' , opacity: 1, height: '0px' })),
          ]),
          stagger(150, [
            animate('700ms ease-out', style({ padding: '8px', width: '258px' , opacity: 1, height: '65px' })),
          ]),
        ])
        ]),
      transition('true => false', [
        style({ width: '258px' , opacity: 1, height: '65px' }),
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
export class HealthBoxComponent implements OnInit {
  @Input() name: string = '';
  @Input() set amountIn(hpAmount: number) { this.displayHp(hpAmount) }
  @Input() maxAmount: number = 1;
  @Input() isEnemy: boolean = true;
  public isOpen: boolean = false;

  public amount: number = 1;
  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    setTimeout(() => {
       this.isOpen = true;
    }, 2000);

    if (this.isEnemy) document.getElementById('health-amount-enemy')!.style.width = ((this.amount / this.maxAmount) * 100).toFixed(0)+'%';
    else document.getElementById('health-amount-hero')!.style.width = ((this.amount / this.maxAmount) * 100).toFixed(0)+'%';

  }

  public displayHp(currentHp: number){
    // if() {
      console.log('currentHp');
      console.log(currentHp);
      console.log(this.amount);

      this.amount = currentHp;
      let calculatedAmount = this.amount > 0 ? ((this.amount / this.maxAmount) * 100) : 0;
      if (this.isEnemy) document.getElementById('health-amount-enemy')!.style.width = calculatedAmount.toFixed(0)+'%';
      else document.getElementById('health-amount-hero')!.style.width = calculatedAmount.toFixed(0)+'%';

    // }
  }

}
