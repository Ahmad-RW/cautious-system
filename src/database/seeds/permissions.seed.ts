import { Permission } from 'src/auth/entities/permission.entity';
import { Seeder } from 'typeorm-seeding';
import { permissionsDetails } from 'src/auth/enums/permission.enum';

export default class PermissionsSeeder implements Seeder {
  public async run(): Promise<any> {
    const permissionRecords: Partial<Permission>[] = [];
    permissionsDetails.map((details) => {
      const group = details.group;

      details?.permissions?.map((permission) => {
        const permissionEntity = new Permission();
        permissionEntity.permissionGroup = group;
        permissionEntity.nameAr = permission.nameAr;
        permissionEntity.nameEn = permission.nameEn;
        permissionEntity.nameKey = permission.nameKey;
        permissionEntity.descriptionAr = permission.descriptionAr;
        permissionEntity.descriptionEn = permission.descriptionEn;
        permissionRecords.push(permissionEntity);
      });
    });

    await Permission.upsert(permissionRecords, ['nameKey']);
  }
}
