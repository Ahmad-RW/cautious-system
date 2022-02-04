import * as bcrypt from 'bcrypt';
import { AvatarTransformer } from 'src/users/avatar-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  EntitySubscriberInterface,
  EventSubscriber,
  Index,
  InsertEvent,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  UpdateEvent,
  VersionColumn,
} from 'typeorm';
import { Country } from 'src/countries/entities/country.entity';
import { Exclude, Expose } from 'class-transformer';
import { Permission } from 'src/auth/entities/permission.entity';
import { Role } from 'src/auth/entities/role.entity';
import { RootEntity } from 'src/common/root.entity';
import { StateStore } from '@depthlabs/nestjs-state-machine';
import { USER_STATE_GRAPH } from 'src/utils/state/graphs/user.state-graph';
import { UserStatuses } from 'src/utils/state/constants/user.state';
import { pluck } from 'src/common/helper-functions';

@Entity({ name: 'users' })
@Exclude()
export class User extends RootEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Index({ unique: true })
  @Expose()
  email: string;

  @Column()
  @Index({ unique: true })
  @Expose()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @VersionColumn()
  version: number;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    name: 'user_has_permission',
  })
  permissions: Permission[];

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({
    name: 'role_id',
    referencedColumnName: 'id',
  })
  @Expose()
  role: Role;

  @ManyToOne(() => Country, { eager: true })
  @JoinColumn({
    name: 'country_id',
    referencedColumnName: 'id',
  })
  @Expose()
  country: Country;

  @Column({ type: 'timestamp', nullable: true })
  @Expose()
  emailVerifyAt: Date;

  @StateStore(USER_STATE_GRAPH)
  @Column({
    type: 'varchar',
  })
  @Expose()
  status = UserStatuses.ACTIVE;

  @Column({ default: 'Asia/Riyadh' })
  @Expose()
  timeZone: string;

  @Column({
    nullable: true,
    transformer: new AvatarTransformer(),
  })
  @Expose()
  avatar: string;

  async verifyPassword(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  get totalPermissions(): Permission[] {
    return this.role ? this.role.permissions.concat(this.permissions) : [];
  }
}

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }
  async beforeInsert(event: InsertEvent<User>): Promise<void> {
    const { entity } = event;
    entity.salt = await bcrypt.genSalt(10);
    entity.password = await bcrypt.hash(entity.password, entity.salt);
  }

  async beforeUpdate(event: UpdateEvent<User>): Promise<void> {
    const { updatedColumns, entity } = event;

    const updatedColumnNames = pluck('propertyName', updatedColumns);
    if (updatedColumnNames.includes('password')) {
      entity.salt = await bcrypt.genSalt(10);
      entity.password = await bcrypt.hash(entity.password, entity.salt);
    }
  }
}
