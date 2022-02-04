import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { INVITATION_STATE_GRAPH } from 'src/utils/state/graphs/invitation.state-graph';
import { Role } from 'src/auth/entities/role.entity';
import { RootEntity } from 'src/common/root.entity';
import { StateStore } from '@depthlabs/nestjs-state-machine';

@Entity({ name: 'invitations' })
@Exclude()
export class Invitation extends RootEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  email: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
  })
  @Expose()
  role: Role;

  @Column()
  @Index()
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @StateStore(INVITATION_STATE_GRAPH)
  @Column({
    type: 'varchar',
  })
  @Expose()
  status = 'pending';
}
