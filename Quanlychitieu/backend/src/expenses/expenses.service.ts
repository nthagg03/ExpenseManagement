import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly repository: Repository<Expense>,
  ) {}

  async create(
    dto: CreateExpenseDto,
    userId: number,
  ): Promise<Expense> {
    const expense = this.repository.create({
      ...dto,
      userId,
      categoryId: dto.categoryId ?? null,
    });

    return this.repository.save(expense);
  }

  async findAll(userId: number): Promise<Expense[]> {
    return this.repository.find({
      where: {
        userId,
      },
      relations: {
        category: true,
      },
      order: {
        expenseDate: 'DESC',
        id: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<Expense> {
    const expense = await this.repository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        category: true,
      },
    });

    if (!expense) {
      throw new NotFoundException(
        'Không tìm thấy khoản chi hoặc bạn không có quyền truy cập',
      );
    }

    return expense;
  }

  async update(
    id: number,
    dto: UpdateExpenseDto,
    userId: number,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    Object.assign(expense, dto);
    expense.userId = userId;

    return this.repository.save(expense);
  }

  async remove(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const expense = await this.findOne(id, userId);

    await this.repository.remove(expense);

    return {
      message: 'Xóa khoản chi thành công',
    };
  }
}