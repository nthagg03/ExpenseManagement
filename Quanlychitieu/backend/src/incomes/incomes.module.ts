import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IncomesService } from './incomes.service';
import { IncomesController } from './incomes.controller';
import { Income } from './entities/income.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Income,
      Category,
    ]),
  ],
  controllers: [IncomesController],
  providers: [IncomesService],
})
export class IncomesModule {}