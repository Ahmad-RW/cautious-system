import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'blacklists' })
export class Blacklist extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  @Index()
  blacklistName: string;

  @Column()
  @Index()
  type: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
