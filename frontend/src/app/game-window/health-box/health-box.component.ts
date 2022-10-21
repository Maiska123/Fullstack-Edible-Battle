import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-health-box',
  templateUrl: './health-box.component.html',
  styleUrls: ['./health-box.component.scss']
})
export class HealthBoxComponent implements OnInit {
  @Input() name: string = '';
  @Input() set amountIn(hpAmount: number) { this.displayHp(hpAmount) }
  @Input() maxAmount: number = 1;
  @Input() isEnemy: boolean = true;

  public amount: number = 1;
  constructor() { }

  ngOnInit() {
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
