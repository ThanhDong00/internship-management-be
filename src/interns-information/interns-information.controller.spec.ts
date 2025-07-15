import { Test, TestingModule } from '@nestjs/testing';
import { InternsInformationController } from './interns-information.controller';

describe('InternsInformationController', () => {
  let controller: InternsInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternsInformationController],
    }).compile();

    controller = module.get<InternsInformationController>(InternsInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
