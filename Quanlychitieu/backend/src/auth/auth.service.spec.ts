import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    username: 'thang',
    email: 'thang@gmail.com',
    password: '$2b$10$hashedpassword',
    createdAt: new Date(),

    expenses: [],
    incomes: [],
    budgets: [],
    categories: [],
  };

  const queryBuilderMock = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(
      () => queryBuilderMock,
    ),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    queryBuilderMock.getOne.mockReset();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: getRepositoryToken(User),
            useValue: mockRepository,
          },
          {
            provide: JwtService,
            useValue: mockJwtService,
          },
        ],
      }).compile();

    service =
      module.get<AuthService>(AuthService);

    repository =
      module.get<
        jest.Mocked<Repository<User>>
      >(getRepositoryToken(User));

    jwtService =
      module.get<jest.Mocked<JwtService>>(
        JwtService,
      );
  });

  it('service phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  it('đăng ký tài khoản thành công', async () => {
    repository.findOne.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue(
      '$2b$10$hashedpassword',
    );

    repository.create.mockReturnValue(mockUser);
    repository.save.mockResolvedValue(mockUser);

    const result = await service.register({
      username: 'thang',
      email: 'thang@gmail.com',
      password: '123456',
    });

    expect(repository.findOne).toHaveBeenCalledWith({
      where: [
        {
          username: 'thang',
        },
        {
          email: 'thang@gmail.com',
        },
      ],
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(
      '123456',
      10,
    );

    expect(repository.create).toHaveBeenCalledWith({
      username: 'thang',
      email: 'thang@gmail.com',
      password: '$2b$10$hashedpassword',
    });

    expect(repository.save).toHaveBeenCalledWith(
      mockUser,
    );

    expect(result).toEqual({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      createdAt: mockUser.createdAt,
    });
  });

  it('không cho phép đăng ký trùng username hoặc email', async () => {
    repository.findOne.mockResolvedValue(
      mockUser,
    );

    await expect(
      service.register({
        username: 'thang',
        email: 'thang@gmail.com',
        password: '123456',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('đăng nhập thành công và trả về JWT', async () => {
    queryBuilderMock.getOne.mockResolvedValue(
      mockUser,
    );

    (bcrypt.compare as jest.Mock).mockResolvedValue(
      true,
    );

    jwtService.sign.mockReturnValue(
      'fake-jwt-token',
    );

    const result = await service.login({
      username: 'thang',
      password: '123456',
    });

    expect(
      repository.createQueryBuilder,
    ).toHaveBeenCalledWith('user');

    expect(
      queryBuilderMock.addSelect,
    ).toHaveBeenCalledWith('user.password');

    expect(
      queryBuilderMock.where,
    ).toHaveBeenCalledWith(
      'user.username = :username',
      {
        username: 'thang',
      },
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      '123456',
      mockUser.password,
    );

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
    });

    expect(result).toEqual({
      access_token: 'fake-jwt-token',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
      },
    });
  });

  it('ném lỗi khi không tìm thấy tài khoản', async () => {
    queryBuilderMock.getOne.mockResolvedValue(
      null,
    );

    await expect(
      service.login({
        username: 'khongtontai',
        password: '123456',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('ném lỗi khi mật khẩu không đúng', async () => {
    queryBuilderMock.getOne.mockResolvedValue(
      mockUser,
    );

    (bcrypt.compare as jest.Mock).mockResolvedValue(
      false,
    );

    await expect(
      service.login({
        username: 'thang',
        password: 'saimatkhau',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});