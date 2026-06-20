import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  category: string;
  @Column()
  description: string;
  @Column('decimal')
  amount: number;
  @Column()
  expenseDate: string;
}