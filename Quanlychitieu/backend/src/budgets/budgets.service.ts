import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private readonly budgetsRepository: Repository<Budget>,
    ) {}

    create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
        const budget = this.budgetsRepository.create(createBudgetDto);
        return this.budgetsRepository.save(budget);
    }

    findAll(): Promise<Budget[]> {
        return this.budgetsRepository.find({ relations: ['user'] });
    }

    findByUser(userId: number): Promise<Budget[]> {
        return this.budgetsRepository.find({ where: { userId } });
    }

    async findOne(id: number): Promise<Budget> {
        const budget = await this.budgetsRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!budget) throw new NotFoundException(`Budget #${id} not found`);
        return budget;
    }

    async update(id: number, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
        await this.findOne(id);
        await this.budgetsRepository.update(id, updateBudgetDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.findOne(id);
        await this.budgetsRepository.delete(id);
        return { message: `Budget #${id} deleted successfully` };
    }
}
