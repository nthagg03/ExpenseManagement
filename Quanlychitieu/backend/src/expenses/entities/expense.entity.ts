import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    categoryId: number;

    @Column({ nullable: true })
    userId: number;

    @Column({ length: 255, nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'date' })
    expenseDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Category, (category) => category.expenses, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @ManyToOne(() => User, (user) => user.expenses, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}
