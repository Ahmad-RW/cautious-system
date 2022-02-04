import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from 'src/auth/entities/permission.entity';
import { RoleId } from 'src/auth/enums/role.enum';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryColumn()
  id: RoleId;

  @Column()
  name: string;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_has_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
