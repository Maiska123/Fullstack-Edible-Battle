/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GameContestantsService } from './game-contestants.service';

describe('Service: GameContestants', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameContestantsService]
    });
  });

  it('should ...', inject([GameContestantsService], (service: GameContestantsService) => {
    expect(service).toBeTruthy();
  }));
});
