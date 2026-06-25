import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: dto.username },
        { email: dto.email },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(
        'Username hoặc Email đã tồn tại',
      );
    }

    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }
  async login(dto: LoginDto) {

  const user = await this.userRepository.findOne({
    where: {
      username: dto.username,
    },
  });

  if (!user) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu',
    );
  }

  const isMatch = await bcrypt.compare(
    dto.password,
    user.password,
  );

  if (!isMatch) {
    throw new UnauthorizedException(
      'Sai tài khoản hoặc mật khẩu',
    );
  }

  const payload = {
    sub: user.id,
    username: user.username,
  };

  return {
    access_token:
      this.jwtService.sign(payload),
  };
}
}