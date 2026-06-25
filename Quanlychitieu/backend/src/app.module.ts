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

    @Module({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.get<string>('DB_HOST', '127.0.0.1'),
            port: configService.get<number>('DB_PORT', 3306),
            username: configService.get<string>('DB_USER', 'root'),
            password: configService.get<string>('DB_PASSWORD', ''),
            database: configService.get<string>('DB_NAME'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false, // Chỉ dùng khi dev, tắt khi production
          }),
          inject: [ConfigService],
        }),
        UsersModule,
        CategoriesModule,
        ExpensesModule,
        BudgetsModule,
        AuthModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    })
    export class AppModule { }

