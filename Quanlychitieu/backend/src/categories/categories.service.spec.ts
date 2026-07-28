import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;

  let repository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  let queryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

  const mockCategory: Category = {
    id: 1,
    name: 'Ăn uống',
    description: 'Chi phí ăn uống',
    userId: 10,
    user: undefined as any,
    expenses: [],
    incomes: [],
    budgets: [],
  };

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    repository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          CategoriesService,
          {
            provide: getRepositoryToken(Category),
            useValue: repository,
          },
        ],
      }).compile();

    service =
      module.get<CategoriesService>(CategoriesService);
  });

  it('service phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('tạo danh mục thành công', async () => {
    const dto = {
      name: '  Ăn uống  ',
      description: 'Chi phí ăn uống',
    };

    // create() dùng findOne() để kiểm tra tên trùng
    repository.findOne.mockResolvedValue(null);

    repository.create.mockReturnValue(mockCategory);
    repository.save.mockResolvedValue(mockCategory);

    const result = await service.create(dto, 10);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        name: 'Ăn uống',
        userId: 10,
      },
    });

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Ăn uống',
      description: 'Chi phí ăn uống',
      userId: 10,
    });

    expect(repository.save).toHaveBeenCalledWith(
      mockCategory,
    );

    expect(result).toEqual(mockCategory);
  });

  it('không cho phép tạo danh mục trùng tên', async () => {
    repository.findOne.mockResolvedValue(mockCategory);

    await expect(
      service.create(
        {
          name: 'Ăn uống',
          description: 'Chi phí ăn uống',
        },
        10,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('lấy danh sách danh mục theo người dùng', async () => {
    repository.find.mockResolvedValue([mockCategory]);

    const result = await service.findAll(10);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        userId: 10,
      },
      order: {
        name: 'ASC',
      },
    });

    expect(result).toEqual([mockCategory]);
  });

  it('lấy một danh mục thành công', async () => {
    repository.findOne.mockResolvedValue(mockCategory);

    const result = await service.findOne(1, 10);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
        userId: 10,
      },
    });

    expect(result).toEqual(mockCategory);
  });

  it('báo lỗi khi không tìm thấy danh mục', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.findOne(99, 10),
    ).rejects.toThrow(NotFoundException);
  });

  it('cập nhật danh mục thành công', async () => {
    const categoryBeforeUpdate: Category = {
      ...mockCategory,
    };

    // findOne() đầu tiên được gọi trong this.findOne()
    repository.findOne.mockResolvedValue(
      categoryBeforeUpdate,
    );

    // getOne() dùng để kiểm tra tên mới có trùng không
    queryBuilder.getOne.mockResolvedValue(null);

    repository.save.mockImplementation(
      async (category: Category) => category,
    );

    const result = await service.update(
      1,
      {
        name: '  Sinh hoạt  ',
        description: 'Chi phí sinh hoạt',
      },
      10,
    );

    expect(repository.createQueryBuilder)
      .toHaveBeenCalledWith('category');

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'category.userId = :userId',
      {
        userId: 10,
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'category.name = :name',
      {
        name: 'Sinh hoạt',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'category.id != :id',
      {
        id: 1,
      },
    );

    expect(result.name).toBe('Sinh hoạt');
    expect(result.description).toBe(
      'Chi phí sinh hoạt',
    );
    expect(result.userId).toBe(10);
  });

  it('không cho phép cập nhật thành tên đã tồn tại', async () => {
    repository.findOne.mockResolvedValue({
      ...mockCategory,
    });

    queryBuilder.getOne.mockResolvedValue({
      ...mockCategory,
      id: 2,
    });

    await expect(
      service.update(
        1,
        {
          name: 'Ăn uống',
        },
        10,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it('xóa danh mục thành công', async () => {
    repository.findOne.mockResolvedValue(mockCategory);
    repository.remove.mockResolvedValue(mockCategory);

    const result = await service.remove(1, 10);

    expect(repository.remove).toHaveBeenCalledWith(
      mockCategory,
    );

    expect(result).toEqual({
      message: 'Xóa danh mục thành công',
    });
  });
});