export enum PermissionGroups {
  users = 'users',
  countries = 'countries',
  roles = 'roles',
  permissions = 'permissions',
}

export enum PermissionKeys {
  // User permissions
  userViewAll = 'userViewAll',
  userViewOwn = 'userViewOwn',
  userUpdateOwn = 'userUpdateOwn',
  userViewOne = 'userViewOne',
  userCreate = 'userCreate',
  userUpdate = 'userUpdate',
  userDelete = 'userDelete',
  userStatus = 'userStatus',
  userInvite = 'userInvite',

  // Country permissions
  countryCreate = 'countryCreate',
  countryUpdate = 'countryUpdate',
  countryDelete = 'countryDelete',

  // Role permissions
  roleViewAll = 'roleViewAll',
  roleViewOne = 'roleViewOne',
  roleCreate = 'roleCreate',
  roleUpdate = 'roleUpdate',
  roleDelete = 'roleDelete',
  roleAssignToUser = 'roleAssignToUser',

  // Permission permissions
  permissionViewAll = 'permissionViewAll',
  permissionViewOne = 'permissionViewOne',
  permissionAssignToRole = 'permissionAssignToRole',
}

export const permissionsDetails = [
  {
    group: PermissionGroups.users,
    permissions: [
      {
        nameAr: 'عرض جميع المستخدمين',
        nameEn: 'View All Users',
        descriptionAr: 'إعطاء صلاحية لعرض جميع المستخدمين',
        descriptionEn: 'Gives the ability to view all users',
        nameKey: PermissionKeys.userViewAll,
      },
      {
        nameAr: 'عرض مستخدم واحد',
        nameEn: 'View One User',
        descriptionAr: 'إعطاء صلاحية لعرض أي مستخدم معيّن',
        descriptionEn: 'Gives the ability to view any specific user',
        nameKey: PermissionKeys.userViewOne,
      },
      {
        nameAr: 'عرض معلومات المستخدم لنفسه',
        nameEn: "View User's Own Information",
        descriptionAr: 'إعطاء صلاحية لعرض معلومات السمتخدم لنفسه',
        descriptionEn: "Gives the ability to view users's own information",
        nameKey: PermissionKeys.userViewOwn,
      },
      {
        nameAr: 'إنشاء مستخدم',
        nameEn: 'Create User',
        descriptionAr: 'إعطاء صلاحية لإنشاء مستخدم',
        descriptionEn: 'Gives the ability to create a user',
        nameKey: PermissionKeys.userCreate,
      },
      {
        nameAr: 'تحديث مستخدم',
        nameEn: 'Update User',
        descriptionAr: 'إعطاء صلاحية لتحديث مستخدم',
        descriptionEn: 'Gives the ability to update a user',
        nameKey: PermissionKeys.userUpdate,
      },
      {
        nameAr: 'تحديث المستخدم لنفسه',
        nameEn: 'Update User Own Information',
        descriptionAr: 'إعطاء صلاحية لتحديث المستخدم لنفسه',
        descriptionEn: 'Gives the ability to update a own user information',
        nameKey: PermissionKeys.userUpdateOwn,
      },
      {
        nameAr: 'حذف مستخدم',
        nameEn: 'Delete User',
        descriptionAr: 'إعطاء صلاحية لحذف مستخدم',
        descriptionEn: 'Gives the ability to delete a user',
        nameKey: PermissionKeys.userDelete,
      },
      {
        nameAr: 'تغيير حالة مستخرم',
        nameEn: 'Change User Status',
        descriptionAr: 'إعطاء صلاحية لتغيير حالة المستخدم',
        descriptionEn: 'Gives the ability to change user status',
        nameKey: PermissionKeys.userStatus,
      },
      {
        nameAr: 'دعوة مستخدم',
        nameEn: 'Invite User',
        descriptionAr: 'إعطاء صلاحية لدعوة مستخدم جديد',
        descriptionEn: 'Gives the ability to invite a new user',
        nameKey: PermissionKeys.userInvite,
      },
    ],
  },

  {
    group: PermissionGroups.countries,
    permissions: [
      {
        nameAr: 'أنشاء دولة',
        nameEn: 'Create Country',
        descriptionAr: 'إعطاء صلاحية لإنشاء دولة',
        descriptionEn: 'Gives the ability to create a country',
        nameKey: PermissionKeys.countryCreate,
      },
      {
        nameAr: 'تحديث دولة',
        nameEn: 'Update Country',
        descriptionAr: 'إعطاء صلاحية لتحديث دولة',
        descriptionEn: 'Gives the ability to update a country',
        nameKey: PermissionKeys.countryUpdate,
      },
      {
        nameAr: 'حذف دولة',
        nameEn: 'Delete Country',
        descriptionAr: 'إعطاء صلاحية لحذف دولة',
        descriptionEn: 'Gives the ability to delete a country',
        nameKey: PermissionKeys.countryDelete,
      },
    ],
  },

  {
    group: PermissionGroups.roles,
    permissions: [
      {
        nameAr: 'عرض جميع الأدوار',
        nameEn: 'View All Role',
        descriptionAr: 'إعطاء صلاحية لعرض جميع الادوار',
        descriptionEn: 'Gives the ability to view all roles',
        nameKey: PermissionKeys.roleViewAll,
      },
      {
        nameAr: 'عرض دور واحد',
        nameEn: 'View One Role',
        descriptionAr: 'إعطاء صلاحية لعرض أي دور معيّن',
        descriptionEn: 'Gives the ability to view any specific role',
        nameKey: PermissionKeys.roleViewOne,
      },
      {
        nameAr: 'إنشاء دور',
        nameEn: 'Create Role',
        descriptionAr: 'إعطاء صلاحية لإنشاء دور',
        descriptionEn: 'Gives the ability to create a role',
        nameKey: PermissionKeys.roleCreate,
      },
      {
        nameAr: 'تحديث دور',
        nameEn: 'Update Role',
        descriptionAr: 'إعطاء صلاحية لتحديث دور',
        descriptionEn: 'Gives the ability to update a role',
        nameKey: PermissionKeys.roleUpdate,
      },
      {
        nameAr: 'حذف دور',
        nameEn: 'Delete Role',
        descriptionAr: 'إعطاء صلاحية لحذف دور',
        descriptionEn: 'Gives the ability to delete a role',
        nameKey: PermissionKeys.roleDelete,
      },
      {
        nameAr: 'تعيين دور لمستخدم',
        nameEn: 'Assign Role To User',
        descriptionAr: 'إعطاء صلاحية لتعيين أي دور لأي مستخدم',
        descriptionEn: 'Gives the ability to assign any role to any user',
        nameKey: PermissionKeys.roleAssignToUser,
      },
    ],
  },
  {
    group: PermissionGroups.permissions,
    permissions: [
      {
        nameAr: 'عرض جميع الصلاحيات',
        nameEn: 'View All Permissions',
        descriptionAr: 'إعطاء صلاحية لعرض جميع الصلاحيات',
        descriptionEn: 'Gives the ability to view all permissions',
        nameKey: PermissionKeys.permissionViewAll,
      },
      {
        nameAr: 'عرض صلاحية واحدة',
        nameEn: 'View One Permission',
        descriptionAr: 'إعطاء صلاحية لعرض صلاحية معيّنة',
        descriptionEn: 'Gives the ability to view any specific permission',
        nameKey: PermissionKeys.permissionViewOne,
      },
      {
        nameAr: 'تعيين صلاحية لدور',
        nameEn: 'Assign Permission To Role',
        descriptionAr: 'إعطاء صلاحية لتعيين أي صلاحية لأي دور',
        descriptionEn: 'Gives the ability to assign any permission to any role',
        nameKey: PermissionKeys.permissionAssignToRole,
      },
    ],
  },
];
