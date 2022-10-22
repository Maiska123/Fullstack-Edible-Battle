/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GameImageService } from './game-image.service';

describe('Service: GameImage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameImageService]
    });
  });

  it('should ...', inject([GameImageService], (service: GameImageService) => {
    expect(service).toBeTruthy();
  }));
});
