import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    username: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 255, select: false })
    password: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Expense, (expense) => expense.user)
    expenses: Expense[];

    @OneToMany(() => Budget, (budget) => budget.user)
    budgets: Budget[];
}
