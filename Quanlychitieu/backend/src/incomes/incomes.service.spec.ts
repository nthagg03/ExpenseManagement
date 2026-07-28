import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { IncomesService } from './incomes.service';
import { Income } from './entities/income.entity';

describe('IncomesService', () => {
  let service: IncomesService;
  let repository: jest.Mocked<Repository<Income>>;

  const mockIncome: Partial<Income> = {
  id: 1,
  userId: 10,
  categoryId: 3,
  amount: 10000000,
  description: 'Lương tháng 7',
  incomeDate: '2026-07-29',
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
        IncomesService,
        {
          provide: getRepositoryToken(Income),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<IncomesService>(IncomesService);
    repository = module.get(getRepositoryToken(Income));
  });

  it('service phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('tạo khoản thu thành công', async () => {
    const dto = {
      amount: 10000000,
      description: 'Lương tháng 7',
      incomeDate: '2026-07-29',
      categoryId: 3,
    };

    repository.create.mockReturnValue(mockIncome as Income);
    repository.save.mockResolvedValue(mockIncome as Income);
    repository.find.mockResolvedValue([mockIncome as Income]);
    repository.findOne.mockResolvedValue(mockIncome as Income);
    repository.remove.mockResolvedValue(mockIncome as Income);

    const result = await service.create(dto, 10);

    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      userId: 10,
      categoryId: 3,
    });

    expect(result).toEqual(mockIncome);
  });

  it('lấy danh sách khoản thu theo userId', async () => {
    repository.create.mockReturnValue(mockIncome as Income);
    repository.save.mockResolvedValue(mockIncome as Income);
    repository.find.mockResolvedValue([mockIncome as Income]);
    repository.findOne.mockResolvedValue(mockIncome as Income);
    repository.remove.mockResolvedValue(mockIncome as Income);

    const result = await service.findAll(10);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        userId: 10,
      },
      relations: {
        category: true,
      },
      order: {
        incomeDate: 'DESC',
        id: 'DESC',
      },
    });

    expect(result).toEqual([mockIncome]);
  });

  it('ném lỗi khi không tìm thấy khoản thu', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99, 10)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cập nhật khoản thu thành công', async () => {
    repository.create.mockReturnValue(mockIncome as Income);
    repository.save.mockResolvedValue(mockIncome as Income);
    repository.find.mockResolvedValue([mockIncome as Income]);
    repository.findOne.mockResolvedValue(mockIncome as Income);
    repository.remove.mockResolvedValue(mockIncome as Income);

    const result = await service.update(
      1,
      {
        amount: 12000000,
      },
      10,
    );

    expect(result.amount).toBe(12000000);
  });

  it('xóa khoản thu thành công', async () => {
    repository.create.mockReturnValue(mockIncome as Income);
    repository.save.mockResolvedValue(mockIncome as Income);
    repository.find.mockResolvedValue([mockIncome as Income]);
    repository.findOne.mockResolvedValue(mockIncome as Income);
    repository.remove.mockResolvedValue(mockIncome as Income);

    const result = await service.remove(1, 10);

    expect(result).toEqual({
      message: 'Xóa khoản thu thành công',
    });
  });
});