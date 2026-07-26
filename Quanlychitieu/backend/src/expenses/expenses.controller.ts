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

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateExpenseDto,
    @Req() request: any,
  ) {
    return this.expensesService.create(
      dto,
      request.user.userId,
    );
  }

  @Get()
  findAll(@Req() request: any) {
    return this.expensesService.findAll(
      request.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.expensesService.findOne(
      id,
      request.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
    @Req() request: any,
  ) {
    return this.expensesService.update(
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
    return this.expensesService.remove(
      id,
      request.user.userId,
    );
  }
}