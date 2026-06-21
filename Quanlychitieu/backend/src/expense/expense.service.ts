import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpenseService {
  constructor(@InjectRepository(Expense) private expenseRepository: Repository<Expense>) {}

  create(createExpenseDto: CreateExpenseDto) {
    return this.expenseRepository.save(createExpenseDto);
  }

  findAll() {
    return this.expenseRepository.find();
  }

  findOne(id: number) {
    return this.expenseRepository.findOneBy({
      id,
    });
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    return this.expenseRepository.update(
      id,
      updateExpenseDto,
    );
  }

  remove(id: number) {
    return this.expenseRepository.delete(id);
  }
}