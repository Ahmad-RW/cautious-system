import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { RootEntity } from 'src/common/root.entity';

@Entity({ name: 'countries' })
@Exclude()
export class Country extends RootEntity {
  @PrimaryColumn()
  @Expose()
  id: number;

  @Column()
  @Index()
  @Expose()
  nameEn: string;

  @Column()
  @Index()
  @Expose()
  phone: string;

  @Column()
  @Index()
  @Expose()
  nameAr: string;

  @Column()
  @Index()
  @Expose()
  code: string;

  @Column({
    nullable: true,
  })
  nicCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
