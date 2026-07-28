import { Test, TestingModule } from '@nestjs/testing';

import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';

describe('IncomesController', () => {
  let controller: IncomesController;

  const mockIncomesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomesController],
      providers: [
        {
          provide: IncomesService,
          useValue: mockIncomesService,
        },
      ],
    }).compile();

    controller = module.get<IncomesController>(IncomesController);
  });

  it('controller phải được khởi tạo', () => {
    expect(controller).toBeDefined();
  });
});