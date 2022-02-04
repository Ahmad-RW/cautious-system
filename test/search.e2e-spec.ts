import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { In } from 'typeorm';
import { RoleId } from 'src/auth/enums/role.enum';
import { User } from 'src/users/entities/user.entity';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { login, registerUser } from 'test/common/test-helpers';

describe('Search (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await initTestApp(app);
    adminToken = await getToken();
  });

  beforeEach(async () => {
    await clearDB(true);
  });

  afterAll(async () => {
    await tearDownAll(app);
  });

  const getToken = async (): Promise<string> =>
    (await login(app)).body.data.accessToken;

  it('should_not_allow_player_to_search_users', async () => {
    const newUser = {
      username: 'someone',
      email: 'some@one.com',
      password: '1@34Abcd',
      type: 'player',
    };
    const {
      body: {
        data: { accessToken: token },
      },
    } = await registerUser(app, newUser);

    const queryParam = '?term=ali&searchFields=username';

    await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('should_search_users_by_username', async () => {
    let queryParam = '?term=superadmin&searchFields=username';

    const {
      body: {
        data: {
          items: [user],
        },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(user).toBeTruthy();

    // A user that does not exist
    queryParam = '?term=someone-doesnt-exist&searchFields=username';
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(data.length).toBeFalsy();
  });

  it('should_search_users_by_email', async () => {
    let queryParam = '?term=super&searchFields=email';

    const {
      body: {
        data: {
          items: [user],
        },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(user).toBeTruthy();

    // A user that does not exist
    queryParam = '?term=someone-doesnt-exist&searchFields=email';
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(data.length).toBeFalsy();
  });

  it('should_search_by_all_searchable_fields_if_not_given', async () => {
    let queryParam = '?term=super';

    const {
      body: {
        data: {
          items: [user],
        },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(user).toBeTruthy();

    // A user that does not exist
    queryParam = '?term=someone-doesnt-exist';
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(data.length).toBeFalsy();
  });

  it('should_allow_filtering_by_user_role_based_on_logged_in_user_role', async () => {
    // Fetch the following roles as Superadmin
    let queryParam = `?filters[0]=role,${[
      RoleId.admin,
      RoleId.technicalAdmin,
      RoleId.businessAdmin,
      RoleId.accountManager,
    ].join(',')}`;
    const {
      body: {
        data: { items: usersCalledBySuperadmin },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(usersCalledBySuperadmin.length).toEqual(4);

    const businessAdmin = { username: 'businessAdmin', password: '111' };
    const {
      body: {
        data: { accessToken },
      },
    } = await login(app, businessAdmin);

    // Fetch the following roles as BusinessAdmin
    queryParam = `?filters[0]=role,${[
      RoleId.admin,
      RoleId.technicalAdmin,
      RoleId.businessAdmin,
      RoleId.accountManager,
    ].join(',')}`;
    const {
      body: {
        data: { items: usersCalledByBusinessadmin },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(usersCalledByBusinessadmin.length).toEqual(1);
  });

  it('should_filter_users_by_given_property', async () => {
    let queryParam = '?filters[0]=status,active';

    const {
      body: {
        data: { items },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const activeUsers = await User.find({
      where: { status: 'active' },
    });
    expect(items.length).toEqual(activeUsers.length);

    // A user that does not exist
    queryParam = '?filters[1]=status,active';
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(data.length).toBeFalsy();
  });

  it('should_filter_users_by_multiple_values_of_given_property', async () => {
    await registerUser(app, {
      email: 'new@user.com',
      username: 'newuser',
      password: '111',
      type: 'player',
    });

    let queryParam = '?filters[0]=status,active,pending';

    const {
      body: {
        data: { items },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const pendingAndActiveUsers = await User.find({
      where: { status: In(['active', 'pending']) },
    });
    expect(items.length).toEqual(pendingAndActiveUsers.length);

    // A user that does not exist
    queryParam = '?filters[1]=status,active';
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(data.length).toBeFalsy();
  });

  it('should_ignore_invalid_filter_properties', async () => {
    const queryParam = '?filters[0]=not-applicable-property,aValue';

    const {
      body: {
        data: {
          items: [user],
        },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(user).toBeTruthy();
  });

  it('should_sort_users_by_given_order', async () => {
    const newUserInfo = {
      username: 'someone',
      email: 'some@one.com',
      password: '1@34Abcd',
      type: 'player',
    };

    const {
      body: {
        data: { user: newUser },
      },
    } = await registerUser(app, newUserInfo);

    const queryParam = '?order=desc&orderBy=createdAt';

    const {
      body: {
        data: {
          items: [user],
        },
      },
    } = await request(app.getHttpServer())
      .get(`/api/users${queryParam}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(user).toEqual(newUser);
  });
});
