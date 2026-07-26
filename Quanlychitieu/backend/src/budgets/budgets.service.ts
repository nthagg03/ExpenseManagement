import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly repository: Repository<Budget>,
  ) {}

  private validateDates(
    startDate?: string,
    endDate?: string,
  ): void {
    if (
      startDate &&
      endDate &&
      new Date(startDate) > new Date(endDate)
    ) {
      throw new BadRequestException(
        'Ngày bắt đầu không được sau ngày kết thúc',
      );
    }
  }

  async create(
    dto: CreateBudgetDto,
    userId: number,
  ): Promise<Budget> {
    this.validateDates(dto.startDate, dto.endDate);

    const budget = this.repository.create({
      ...dto,
      userId,
      categoryId: dto.categoryId ?? null,
    });

    return this.repository.save(budget);
  }

  async findAll(userId: number): Promise<Budget[]> {
    return this.repository.find({
      where: {
        userId,
      },
      relations: {
        category: true,
      },
      order: {
        startDate: 'DESC',
        id: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<Budget> {
    const budget = await this.repository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException(
        'Không tìm thấy ngân sách hoặc bạn không có quyền truy cập',
      );
    }

    return budget;
  }

  async update(
    id: number,
    dto: UpdateBudgetDto,
    userId: number,
  ): Promise<Budget> {
    const budget = await this.findOne(id, userId);

    const nextStartDate =
      dto.startDate ?? budget.startDate;

    const nextEndDate =
      dto.endDate ?? budget.endDate;

    this.validateDates(nextStartDate, nextEndDate);

    Object.assign(budget, dto);
    budget.userId = userId;

    return this.repository.save(budget);
  }

  async remove(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const budget = await this.findOne(id, userId);

    await this.repository.remove(budget);

    return {
      message: 'Xóa ngân sách thành công',
    };
  }
}