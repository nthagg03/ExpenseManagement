import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'date',
  })
  startDate: string;

  @Column({
    type: 'date',
  })
  endDate: string;

  @Column()
  categoryId: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.budgets, {
    onDelete: 'CASCADE',
  })
  user: User;
}