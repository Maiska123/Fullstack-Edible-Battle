/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GameStatsService } from './game-stats.service';

describe('Service: GameStats', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameStatsService]
    });
  });

  it('should ...', inject([GameStatsService], (service: GameStatsService) => {
    expect(service).toBeTruthy();
  }));
});
