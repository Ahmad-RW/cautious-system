import { IRolePermission } from 'src/auth/interfaces/role-permission.interface';
import { PermissionKeys } from 'src/auth/enums/permission.enum';

export enum RoleId {
  admin = 1,
  technicalAdmin = 2,
  businessAdmin = 3,
  accountManager = 4,
  labManager = 5,
  player = 6,
}

// to be used like:  DependentRoles[RoleId.admin]
// returns list of visible roles to admin
export const DependentRoles = {
  // Admin can update the follwoing roles
  [RoleId.admin]: [
    RoleId.technicalAdmin,
    RoleId.businessAdmin,
    RoleId.accountManager,
    RoleId.labManager,
    RoleId.player,
    RoleId.admin,
  ],
  // Technical Admins can update the follwoing roles
  [RoleId.technicalAdmin]: [RoleId.labManager],
  // Business Admins can update the follwoing roles
  [RoleId.businessAdmin]: [RoleId.accountManager],
  [RoleId.labManager]: [],
  [RoleId.accountManager]: [],
  [RoleId.player]: [],
};

// Mapping roles to permissions (used for seeding)
export const RolePermissions: IRolePermission[] = [
  {
    id: RoleId.technicalAdmin,
    name: 'technicalAdmin',
    permissions: [
      PermissionKeys.userViewAll,
      PermissionKeys.userViewOne,
      PermissionKeys.userViewOwn,
      PermissionKeys.userUpdateOwn,
      PermissionKeys.userStatus,
      PermissionKeys.userInvite,
      PermissionKeys.roleViewAll,
      PermissionKeys.roleAssignToUser,
    ],
  },
  {
    id: RoleId.businessAdmin,
    name: 'businessAdmin',
    permissions: [
      PermissionKeys.userViewAll,
      PermissionKeys.userViewOne,
      PermissionKeys.userViewOwn,
      PermissionKeys.userUpdateOwn,
      PermissionKeys.userStatus,
      PermissionKeys.userInvite,
      PermissionKeys.roleViewAll,
      PermissionKeys.roleAssignToUser,
    ],
  },
  {
    id: RoleId.accountManager,
    name: 'accountManager',
    permissions: [
      PermissionKeys.userViewOne,
      PermissionKeys.userViewOwn,
      PermissionKeys.userUpdateOwn,
    ],
  },
  {
    id: RoleId.labManager,
    name: 'labManager',
    permissions: [
      PermissionKeys.userViewOne,
      PermissionKeys.userViewOwn,
      PermissionKeys.userUpdateOwn,
    ],
  },
  {
    id: RoleId.player,
    name: 'player',
    permissions: [
      PermissionKeys.userViewOne,
      PermissionKeys.userViewOwn,
      PermissionKeys.userUpdateOwn,
    ],
  },
];
