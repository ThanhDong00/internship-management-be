import { Test, TestingModule } from '@nestjs/testing';
import { InternsInformationService } from './interns-information.service';

describe('InternsInformationService', () => {
  let service: InternsInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InternsInformationService],
    }).compile();

    service = module.get<InternsInformationService>(InternsInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
