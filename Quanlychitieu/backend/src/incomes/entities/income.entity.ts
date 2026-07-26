import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('income')
export class Income {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
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
  incomeDate: string;

  @Column({
    nullable: true,
  })
  categoryId: number | null;

  @Column()
  userId: number;

  @ManyToOne(
    () => User,
    (user) => user.incomes,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @ManyToOne(
    () => Category,
    (category) => category.incomes,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'categoryId',
  })
  category: Category | null;
}