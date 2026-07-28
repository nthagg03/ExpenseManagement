import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repository: jest.Mocked<Repository<Expense>>;

  const mockExpense: Partial<Expense> = {
  id: 1,
  userId: 10,
  categoryId: 2,
  amount: 150000,
  description: 'Mua thực phẩm',
  expenseDate: '2026-07-29',
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
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repository = module.get(getRepositoryToken(Expense));
  });

  it('service phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('tạo khoản chi thành công', async () => {
    const dto = {
      amount: 150000,
      description: 'Mua thực phẩm',
      expenseDate: '2026-07-29',
      categoryId: 2,
    };

    repository.create.mockReturnValue(mockExpense as Expense);
    repository.save.mockResolvedValue(mockExpense as Expense);
    repository.find.mockResolvedValue([mockExpense as Expense]);
    repository.findOne.mockResolvedValue(mockExpense as Expense);
    repository.remove.mockResolvedValue(mockExpense as Expense);

    const result = await service.create(dto, 10);

    expect(repository.create).toHaveBeenCalledWith({
      ...dto,
      userId: 10,
      categoryId: 2,
    });

    expect(repository.save).toHaveBeenCalledWith(mockExpense);
    expect(result).toEqual(mockExpense);
  });

  it('lấy danh sách khoản chi theo userId', async () => {
    repository.create.mockReturnValue(mockExpense as Expense);
    repository.save.mockResolvedValue(mockExpense as Expense);
    repository.find.mockResolvedValue([mockExpense as Expense]);
    repository.findOne.mockResolvedValue(mockExpense as Expense);
    repository.remove.mockResolvedValue(mockExpense as Expense);

    const result = await service.findAll(10);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        userId: 10,
      },
      relations: {
        category: true,
      },
      order: {
        expenseDate: 'DESC',
        id: 'DESC',
      },
    });

    expect(result).toEqual([mockExpense]);
  });

  it('lấy một khoản chi thành công', async () => {
    repository.create.mockReturnValue(mockExpense as Expense);
    repository.save.mockResolvedValue(mockExpense as Expense);
    repository.find.mockResolvedValue([mockExpense as Expense]);
    repository.findOne.mockResolvedValue(mockExpense as Expense);
    repository.remove.mockResolvedValue(mockExpense as Expense);

    const result = await service.findOne(1, 10);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        userId: 10,
      },
      relations: {
        category: true,
      },
    });

    expect(result).toEqual(mockExpense);
  });

  it('ném lỗi khi không tìm thấy khoản chi', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99, 10)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cập nhật khoản chi thành công', async () => {
    repository.create.mockReturnValue(mockExpense as Expense);
    repository.save.mockResolvedValue(mockExpense as Expense);
    repository.find.mockResolvedValue([mockExpense as Expense]);
    repository.findOne.mockResolvedValue(mockExpense as Expense);
    repository.remove.mockResolvedValue(mockExpense as Expense);

    const result = await service.update(
      1,
      {
        amount: 200000,
      },
      10,
    );

    expect(repository.save).toHaveBeenCalled();
    expect(result.amount).toBe(200000);
  });

  it('xóa khoản chi thành công', async () => {
    repository.create.mockReturnValue(mockExpense as Expense);
    repository.save.mockResolvedValue(mockExpense as Expense);
    repository.find.mockResolvedValue([mockExpense as Expense]);
    repository.findOne.mockResolvedValue(mockExpense as Expense);
    repository.remove.mockResolvedValue(mockExpense as Expense);
    const result = await service.remove(1, 10);

    expect(repository.remove).toHaveBeenCalledWith(mockExpense);
    expect(result).toEqual({
      message: 'Xóa khoản chi thành công',
    });
  });
});