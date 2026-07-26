import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { Income } from '../../incomes/entities/income.entity';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    length: 255,
    nullable: true,
  })
  description?: string;

  /*
   * Để nullable true nhằm tránh lỗi khi database cũ
   * đang có category chưa gắn userId.
   * Dữ liệu tạo mới luôn được service gắn userId.
   */
  @Column({
    nullable: true,
  })
  userId: number | null;

  @ManyToOne(
    () => User,
    (user) => user.categories,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @OneToMany(
    () => Expense,
    (expense) => expense.category,
  )
  expenses: Expense[];

  @OneToMany(
    () => Income,
    (income) => income.category,
  )
  incomes: Income[];

  @OneToMany(
    () => Budget,
    (budget) => budget.category,
  )
  budgets: Budget[];
}