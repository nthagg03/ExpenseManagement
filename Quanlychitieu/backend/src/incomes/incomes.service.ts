import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Income } from './entities/income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
  constructor(
    @InjectRepository(Income)
    private readonly repository: Repository<Income>,
  ) {}

  async create(
    dto: CreateIncomeDto,
    userId: number,
  ): Promise<Income> {
    const income = this.repository.create({
      ...dto,
      userId,
      categoryId: dto.categoryId ?? null,
    });

    return this.repository.save(income);
  }

  async findAll(userId: number): Promise<Income[]> {
    return this.repository.find({
      where: {
        userId,
      },
      relations: {
        category: true,
      },
      order: {
        incomeDate: 'DESC',
        id: 'DESC',
      },
    });
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<Income> {
    const income = await this.repository.findOne({
      where: {
        id,
        userId,
      },
      relations: {
        category: true,
      },
    });

    if (!income) {
      throw new NotFoundException(
        'Không tìm thấy khoản thu hoặc bạn không có quyền truy cập',
      );
    }

    return income;
  }

  async update(
    id: number,
    dto: UpdateIncomeDto,
    userId: number,
  ): Promise<Income> {
    const income = await this.findOne(id, userId);

    Object.assign(income, dto);
    income.userId = userId;

    return this.repository.save(income);
  }

  async remove(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const income = await this.findOne(id, userId);

    await this.repository.remove(income);

    return {
      message: 'Xóa khoản thu thành công',
    };
  }
}