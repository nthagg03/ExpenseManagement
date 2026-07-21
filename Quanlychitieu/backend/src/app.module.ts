import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetsModule } from './budgets/budgets.module';
import { AuthModule } from './auth/auth.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false,

      ssl: {
        rejectUnauthorized: false,
      },
}),

    UsersModule,
    CategoriesModule,
    ExpensesModule,
    BudgetsModule,
    IncomesModule,
    AuthModule,

    ExpenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}