import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './entities/income.entity';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomesService {
    constructor(
        @InjectRepository(Income)
        private readonly incomesRepository: Repository<Income>,
    ) {}

    create(createIncomeDto: CreateIncomeDto): Promise<Income> {
        const income = this.incomesRepository.create(createIncomeDto);
        return this.incomesRepository.save(income);
    }

    findAll(): Promise<Income[]> {
        return this.incomesRepository.find({ relations: ['user'] });
    }

    findByUser(userId: number): Promise<Income[]> {
        return this.incomesRepository.find({ where: { userId } });
    }

    async findOne(id: number): Promise<Income> {
        const income = await this.incomesRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!income) throw new NotFoundException(`Income #${id} not found`);
        return income;
    }

    async update(id: number, updateIncomeDto: UpdateIncomeDto): Promise<Income> {
        await this.findOne(id);
        await this.incomesRepository.update(id, updateIncomeDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.findOne(id);
        await this.incomesRepository.delete(id);
        return { message: `Income #${id} deleted successfully` };
    }
}
