import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Expense } from '../../expenses/entities/expense.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 255, nullable: true })
    description: string;

    @OneToMany(() => Expense, (expense) => expense.category)
    expenses: Expense[];
}
