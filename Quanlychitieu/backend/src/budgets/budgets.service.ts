import {
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
    private readonly budgetRepository: Repository<Budget>,
  ) {}

  create(createBudgetDto: CreateBudgetDto) {
    const budget = this.budgetRepository.create(
      createBudgetDto,
    );

    return this.budgetRepository.save(budget);
  }

  findAll() {
    return this.budgetRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findByUser(userId: number) {
    return this.budgetRepository.find({
      where: {
        userId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const budget = await this.budgetRepository.findOne({
      where: {
        id,
      },
    });

    if (!budget) {
      throw new NotFoundException(
        `Không tìm thấy ngân sách có id ${id}`,
      );
    }

    return budget;
  }

  async update(
    id: number,
    updateBudgetDto: UpdateBudgetDto,
  ) {
    const budget = await this.findOne(id);

    Object.assign(budget, updateBudgetDto);

    return this.budgetRepository.save(budget);
  }

  async remove(id: number) {
    const budget = await this.findOne(id);

    await this.budgetRepository.remove(budget);

    return {
      message: 'Xóa ngân sách thành công',
    };
  }
}