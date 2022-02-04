import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RootEntity } from 'src/common/root.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'verifications' })
export class Verification extends RootEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  token: string;

  @Column()
  type: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;
}
