import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Role } from 'src/auth/entities/role.entity';
import { RoleId } from 'src/auth/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { login, registerUser } from 'test/common/test-helpers';

describe('RolesPermissionsController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await initTestApp(app);
    adminToken = (await login(app)).body.data.accessToken;
  });

  beforeEach(async () => {
    await clearDB(true);
  });

  afterAll(async () => {
    await tearDownAll(app);
  });

  const getNewUserToken = async (): Promise<string> => {
    const newUser = {
      email: 'new@user.com',
      username: 'newUser',
      password: '@Bcd1234',
      type: 'player',
    };

    return (await registerUser(app, newUser)).body.data.accessToken;
  };

  it('should_allow_permitted_users_to_fitch_all_roles', async () => {
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
    expect(data.length).toBeTruthy();
  });

  it('should_NOT_allow_unpermitted_users_to_fetch_all_roles', async () => {
    await request(app.getHttpServer())
      .get('/api/roles')
      .set('Authorization', `Bearer ${await getNewUserToken()}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should_allow_permitted_users_to_fitch_one_role', async () => {
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get('/api/roles/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
    expect(data).toBeTruthy();
  });

  it('should_NOT_allow_unpermitted_users_to_fitch_one_role', async () => {
    await request(app.getHttpServer())
      .get('/api/roles/1')
      .set('Authorization', `Bearer ${await getNewUserToken()}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should_allow_permitted_users_to_fitch_all_permissions', async () => {
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
    expect(data.length).toBeTruthy();
  });

  it('should_allow_permitted_users_to_assign_role_to_user', async () => {
    const newUser = {
      email: 'new@user.com',
      username: 'newUser',
      password: '@Bcd1234',
      type: 'player',
    };

    const {
      body: {
        data: { user },
      },
    } = await registerUser(app, newUser);

    await request(app.getHttpServer())
      .put(`/api/roles/assign-to-user/${user.id}`)
      .send({
        role: {
          id: RoleId.technicalAdmin,
        },
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const userRole: Role = (await User.findOne(user.id)).role;
    expect(userRole.id).toEqual(RoleId.technicalAdmin);
  });

  it('should_allow_permitted_users_to_assign_permissions_to_role', async () => {
    const permissions = [
      {
        id: 1,
      },
      {
        id: 2,
      },
    ];

    const role: Role = await Role.findOne(RoleId.technicalAdmin);
    expect(role.permissions.length).not.toEqual(permissions.length);

    await request(app.getHttpServer())
      .put(`/api/roles/assign-permissions/${RoleId.technicalAdmin}`)
      .send({
        permissions,
      })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    await role.reload();
    expect(role.permissions.length).toEqual(permissions.length);
  });
});
