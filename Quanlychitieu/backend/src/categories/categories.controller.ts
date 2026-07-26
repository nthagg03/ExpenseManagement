import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @Req() request: any,
  ) {
    return this.categoriesService.create(
      dto,
      request.user.userId,
    );
  }

  @Get()
  findAll(@Req() request: any) {
    return this.categoriesService.findAll(
      request.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.categoriesService.findOne(
      id,
      request.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
    @Req() request: any,
  ) {
    return this.categoriesService.update(
      id,
      dto,
      request.user.userId,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.categoriesService.remove(
      id,
      request.user.userId,
    );
  }
}