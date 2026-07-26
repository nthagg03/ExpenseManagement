import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async create(
    dto: CreateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const duplicate = await this.repository.findOne({
      where: {
        name: dto.name.trim(),
        userId,
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Bạn đã có danh mục với tên này',
      );
    }

    const category = this.repository.create({
      ...dto,
      name: dto.name.trim(),
      userId,
    });

    return this.repository.save(category);
  }

  async findAll(
    userId: number,
  ): Promise<Category[]> {
    return this.repository.find({
      where: {
        userId,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(
    id: number,
    userId: number,
  ): Promise<Category> {
    const category = await this.repository.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException(
        'Không tìm thấy danh mục hoặc bạn không có quyền truy cập',
      );
    }

    return category;
  }

  async update(
    id: number,
    dto: UpdateCategoryDto,
    userId: number,
  ): Promise<Category> {
    const category = await this.findOne(id, userId);

    if (dto.name) {
      const duplicate = await this.repository
        .createQueryBuilder('category')
        .where('category.userId = :userId', {
          userId,
        })
        .andWhere('category.name = :name', {
          name: dto.name.trim(),
        })
        .andWhere('category.id != :id', {
          id,
        })
        .getOne();

      if (duplicate) {
        throw new BadRequestException(
          'Bạn đã có danh mục với tên này',
        );
      }
    }

    Object.assign(category, dto);

    if (dto.name) {
      category.name = dto.name.trim();
    }

    category.userId = userId;

    return this.repository.save(category);
  }

  async remove(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const category = await this.findOne(id, userId);

    await this.repository.remove(category);

    return {
      message: 'Xóa danh mục thành công',
    };
  }
}