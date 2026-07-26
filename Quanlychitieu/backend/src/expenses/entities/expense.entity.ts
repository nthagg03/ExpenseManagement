import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  categoryId: number | null;

  @Column()
  userId: number;

  @Column({
    length: 255,
  })
  description: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'date',
  })
  expenseDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    () => Category,
    (category) => category.expenses,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'categoryId',
  })
  category: Category | null;

  @ManyToOne(
    () => User,
    (user) => user.expenses,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'userId',
  })
  user: User;
}