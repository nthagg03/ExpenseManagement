import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private readonly categoriesRepository: Repository<Category>,
    ) {}

    create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const category = this.categoriesRepository.create(createCategoryDto);
        return this.categoriesRepository.save(category);
    }

    findAll(): Promise<Category[]> {
        return this.categoriesRepository.find();
    }

    async findOne(id: number): Promise<Category> {
        const category = await this.categoriesRepository.findOneBy({ id });
        if (!category) throw new NotFoundException(`Category #${id} not found`);
        return category;
    }

    async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        await this.findOne(id);
        await this.categoriesRepository.update(id, updateCategoryDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<{ message: string }> {
        await this.findOne(id);
        await this.categoriesRepository.delete(id);
        return { message: `Category #${id} deleted successfully` };
    }
}
