import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly expensesRepository: Repository<Expense>,
    ) {}

    create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = this.expensesRepository.create(createExpenseDto);
        return this.expensesRepository.save(expense);
    }

    findAll(): Promise<Expense[]> {
        return this.expensesRepository.find({ relations: ['category', 'user'] });
    }

    findByUser(userId: number): Promise<Expense[]> {
        return this.expensesRepository.find({
            where: { userId },
            relations: ['category'],
        });
    }

    async findOne(id: number): Promise<Expense> {
        const expense = await this.expensesRepository.findOne({
            where: { id },
            relations: ['category', 'user'],
        });
        if (!expense) throw new NotFoundException(`Expense #${id} not found`);
        return expense;
    }

    async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
        await this.findOne(id);
        await this.expensesRepository.update(id, updateExpenseDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.findOne(id);
        await this.expensesRepository.delete(id);
        return { message: `Expense #${id} deleted successfully` };
    }
}
