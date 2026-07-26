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

import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('incomes')
@UseGuards(JwtAuthGuard)
export class IncomesController {
  constructor(
    private readonly incomesService: IncomesService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateIncomeDto,
    @Req() request: any,
  ) {
    return this.incomesService.create(
      dto,
      request.user.userId,
    );
  }

  @Get()
  findAll(@Req() request: any) {
    return this.incomesService.findAll(
      request.user.userId,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.incomesService.findOne(
      id,
      request.user.userId,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIncomeDto,
    @Req() request: any,
  ) {
    return this.incomesService.update(
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
    return this.incomesService.remove(
      id,
      request.user.userId,
    );
  }
}