import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { PermissionKeys } from 'src/auth/enums/permission.enum';

@Entity({ name: 'permissions' })
@Exclude()
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column()
  @Expose()
  nameAr: string;

  @Column()
  @Expose()
  nameEn: string;

  @Column()
  @Expose()
  descriptionAr: string;

  @Column()
  @Expose()
  descriptionEn: string;

  @Column({ unique: true })
  @Expose()
  @Index()
  nameKey: PermissionKeys;

  @Column()
  @Expose()
  @Index()
  permissionGroup: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
