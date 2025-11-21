import { Test, TestingModule } from '@nestjs/testing';
import { ExamesService } from './exames.service';

describe('ExamesService', () => {
  let service: ExamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamesService],
    }).compile();

    service = module.get<ExamesService>(ExamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
