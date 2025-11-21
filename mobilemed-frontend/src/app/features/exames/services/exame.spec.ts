import { TestBed } from '@angular/core/testing';

import { Exame } from './exame';

describe('Exame', () => {
  let service: Exame;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Exame);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
