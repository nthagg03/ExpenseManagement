import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { BudgetsService } from './budgets.service';
import { Budget } from './entities/budget.entity';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let repository: jest.Mocked<Repository<Budget>>;

  const mockBudget: Partial<Budget> = {
  id: 1,
  userId: 10,
  categoryId: 2,
  amount: 5000000,
  startDate: '2026-07-01',
  endDate: '2026-07-31',
};

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: getRepositoryToken(Budget),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
    repository = module.get(getRepositoryToken(Budget));
  });

  it('service phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('tạo ngân sách thành công', async () => {
    const dto = {
      amount: 5000000,
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      categoryId: 2,
    };

    repository.create.mockReturnValue(mockBudget as Budget);
    repository.save.mockResolvedValue(mockBudget as Budget);
    repository.findOne.mockResolvedValue(mockBudget as Budget);
    repository.remove.mockResolvedValue(mockBudget as Budget);
    const result = await service.create(dto, 10);

    expect(result).toEqual(mockBudget);
  });

  it('không cho phép ngày bắt đầu sau ngày kết thúc', async () => {
    const dto = {
      amount: 5000000,
      startDate: '2026-08-01',
      endDate: '2026-07-01',
      categoryId: 2,
    };

    await expect(service.create(dto, 10)).rejects.toThrow(
      BadRequestException,
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('ném lỗi khi không tìm thấy ngân sách', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99, 10)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cập nhật ngân sách thành công', async () => {
    repository.create.mockReturnValue(mockBudget as Budget);
    repository.save.mockResolvedValue(mockBudget as Budget);
    repository.findOne.mockResolvedValue(mockBudget as Budget);
    repository.remove.mockResolvedValue(mockBudget as Budget);

    const result = await service.update(
      1,
      {
        amount: 6000000,
      },
      10,
    );

    expect(result.amount).toBe(6000000);
  }); 

  it('xóa ngân sách thành công', async () => {
    repository.create.mockReturnValue(mockBudget as Budget);
    repository.save.mockResolvedValue(mockBudget as Budget);
    repository.findOne.mockResolvedValue(mockBudget as Budget);
    repository.remove.mockResolvedValue(mockBudget as Budget);

    const result = await service.remove(1, 10);

    expect(result).toEqual({
      message: 'Xóa ngân sách thành công',
    });
  });
});