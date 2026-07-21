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
    private readonly incomeRepository: Repository<Income>,
  ) {}

  create(createIncomeDto: CreateIncomeDto) {
    const income = this.incomeRepository.create(
      createIncomeDto,
    );

    return this.incomeRepository.save(income);
  }

  findAll() {
    return this.incomeRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  findByUser(userId: number) {
    return this.incomeRepository.find({
      where: {
        userId,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const income = await this.incomeRepository.findOne({
      where: {
        id,
      },
    });

    if (!income) {
      throw new NotFoundException(
        `Không tìm thấy khoản thu có id ${id}`,
      );
    }

    return income;
  }

  async update(
    id: number,
    updateIncomeDto: UpdateIncomeDto,
  ) {
    const income = await this.findOne(id);

    Object.assign(income, updateIncomeDto);

    return this.incomeRepository.save(income);
  }

  async remove(id: number) {
    const income = await this.findOne(id);

    await this.incomeRepository.remove(income);

    return {
      message: 'Xóa khoản thu thành công',
    };
  }
}