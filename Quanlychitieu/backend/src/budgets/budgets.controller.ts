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

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(
    private readonly budgetsService: BudgetsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateBudgetDto,
    @Req() request: any,
  ) {
    return this.budgetsService.create(
      dto,
      request.user.userId,
    );
  }

  @Get()
  findAll(@Req() request: any) {
    return this.budgetsService.findAll(
      request.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.budgetsService.findOne(
      id,
      request.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBudgetDto,
    @Req() request: any,
  ) {
    return this.budgetsService.update(
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
    return this.budgetsService.remove(
      id,
      request.user.userId,
    );
  }
}