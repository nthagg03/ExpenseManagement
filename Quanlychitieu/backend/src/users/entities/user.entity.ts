import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Expense } from '../../expenses/entities/expense.entity';
import { Income } from '../../incomes/entities/income.entity';
import { Budget } from '../../budgets/entities/budget.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    unique: true,
  })
  username: string;

  @Column({
    length: 100,
    unique: true,
  })
  email: string;

  @Column({
    length: 255,
    select: false,
  })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => Expense,
    (expense) => expense.user,
  )
  expenses: Expense[];

  @OneToMany(
    () => Income,
    (income) => income.user,
  )
  incomes: Income[];

  @OneToMany(
    () => Budget,
    (budget) => budget.user,
  )
  budgets: Budget[];

  @OneToMany(
    () => Category,
    (category) => category.user,
  )
  categories: Category[];
}