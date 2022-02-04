import * as faker from 'faker';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TEST_PASSWORD, login, registerUser } from 'test/common/test-helpers';
import { User } from 'src/users/entities/user.entity';
import { UserStatuses } from 'src/utils/state/constants/user.state';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { factory } from 'typeorm-seeding';

describe('UsersController (e2e)', () => {
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

  it('should_register_user', async () => {
    const user = await factory(User)().make();

    const response = await registerUser(app, {
      email: user.email,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    });
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  it('should_register_user_with_active_status', async () => {
    const user = {
      email: faker.internet.email(),
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };
    const response = await registerUser(app, user);

    expect(response.status).toBe(HttpStatus.CREATED);
    const createdUser = await User.findOne({
      where: { email: user.email.toLowerCase() },
    });
    expect(createdUser.status).toBe(UserStatuses.ACTIVE);
  });

  it('should_not_create_duplicate_email', async () => {
    const email = faker.internet.email();
    const firstUser = {
      email: email,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    await registerUser(app, firstUser);

    const anotherUser = {
      email: email,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred2',
    };

    const { body, status } = await registerUser(app, anotherUser);

    expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body.errors).toEqual([
      {
        property: 'email',
        message: "User with the same 'email' already exist",
      },
    ]);
  });

  it('should_not_create_duplicate_username', async () => {
    const firstUser = {
      email: faker.internet.email(),
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    await registerUser(app, firstUser);

    const anotherUser = {
      email: faker.internet.email(),
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    const { body, status } = await registerUser(app, anotherUser);

    expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body.errors).toEqual([
      {
        property: 'username',
        message: "User with the same 'username' already exist",
      },
    ]);
  });

  it('should_ignore_case_on_email', async () => {
    const user = {
      email: 'My@EmAiL.CoM',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'someuser',
    };

    const { status, body } = await registerUser(app, user);
    expect(status).toBe(HttpStatus.CREATED);
    expect(body.data.user.email).toBe(user.email.toLowerCase());
  });

  it('should_ignore_case_on_username', async () => {
    const user = {
      email: 'my@email.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'SoMeUsEr',
    };

    const { status, body } = await registerUser(app, user);
    expect(status).toBe(HttpStatus.CREATED);
    expect(body.data.user.username).toBe(user.username.toLowerCase());
  });

  it('should_ignore_spaces_on_username', async () => {
    const user = {
      email: 'my@email.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'Some User',
    };

    const { status, body } = await registerUser(app, user);
    expect(status).toBe(HttpStatus.CREATED);
    expect(body.data.user.username).toBe(
      user.username.toLowerCase().replace(' ', ''),
    );
  });

  it('admin_should_be_able_change_user_status_to_suspended', async () => {
    const user = {
      email: 'my@email.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'imishadev',
    };

    await registerUser(app, user);

    const { body } = await request(app.getHttpServer())
      .put('/api/users/suspend/imishadev')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(body.data.status).toEqual(UserStatuses.SUSPENDED);
  });

  it('should_check_for_username_availability_and_allow', async () => {
    const username = 'cc_frigjie';
    const { body: response } = await request(app.getHttpServer())
      .post('/api/users/username-exists')
      .send({
        username,
      })
      .expect(HttpStatus.OK);

    expect(response.data.message).toBe(`Username available`);
  });

  it('should_check_for_username_availability_and_disallow', async () => {
    const username: string = (await User.findOne()).username;
    const { body } = await request(app.getHttpServer())
      .post('/api/users/username-exists')
      .send({
        username,
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(body.errors).toEqual([
      {
        message: "User with the same 'username' already exist",
        property: 'username',
      },
    ]);
  });

  it('should_check_for_email_availability_and_allow', async () => {
    const email = 'test@cylab.com';
    const { body } = await request(app.getHttpServer())
      .post('/api/users/email-exists')
      .send({
        email,
      })
      .expect(HttpStatus.OK);

    expect(body.data.message).toBe(`Email available`);
  });

  it('should_check_for_email_availability_and_disallow', async () => {
    const email = 'superadmin@cylab.com';
    const { body } = await request(app.getHttpServer())
      .post('/api/users/email-exists')
      .send({
        email,
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(body.errors).toEqual([
      {
        message: "User with the same 'email' already exist",
        property: 'email',
      },
    ]);
  });

  it('should_update_user_data', async () => {
    const { body } = await request(app.getHttpServer())
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'my@email.com',
        username: 'new_username',
        country: { id: 27 },
        timeZone: 'Iceland',
      })
      .expect(HttpStatus.OK);

    expect(body.data).toBeTruthy();
  });

  it('admin_should_be_able_change_user_status_to_active', async () => {
    const user = {
      email: 'my@email.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'imishadev',
    };
    await registerUser(app, user);

    let response = await request(app.getHttpServer())
      .put('/api/users/suspend/imishadev')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
    expect(response.body.data.status).toEqual(UserStatuses.SUSPENDED);

    response = await request(app.getHttpServer())
      .put('/api/users/activate/imishadev')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.data.status).toEqual(UserStatuses.ACTIVE);
  });

  it('should_not_allow_admins_to_change_status_not_under_their_management', async () => {
    const technicalAdminToken: string = (
      await login(app, {
        username: 'technicaladmin',
        password: '111',
      })
    ).body.data.accessToken;

    await request(app.getHttpServer())
      .put('/api/users/suspend/accountmanager')
      .set('Authorization', `Bearer ${technicalAdminToken}`)
      .expect(HttpStatus.FORBIDDEN);

    const {
      body: {
        data: { status },
      },
    } = await request(app.getHttpServer())
      .put('/api/users/suspend/labmanager')
      .set('Authorization', `Bearer ${technicalAdminToken}`)
      .expect(HttpStatus.OK);

    expect(status).toEqual(UserStatuses.SUSPENDED);
  });

  it('should_fail_to_update_user_data_because_existing_credentials', async () => {
    const user = {
      email: 'test@gmail.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'someuser',
    };
    await registerUser(app, user);

    const { body } = await request(app.getHttpServer())
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'test@gmail.com',
        country: { id: 27 },
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(body.errors[0].message).toEqual(
      "User with the same 'email' already exist",
    );
  });

  it('Admin_should_update_user_data', async () => {
    const user = {
      email: 'My@EmAiL.CoM',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'someuser',
      country: { id: 7 },
    };

    await registerUser(app, user);

    const { body } = await request(app.getHttpServer())
      .put('/api/users/profile/someuser')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'my44@email.com',
        username: 'another_player',
        country: { id: 27 },
        timeZone: 'Iceland',
      })
      .expect(HttpStatus.OK);

    expect(body.data).toBeTruthy();
  });

  it('Other_user_cannot__update_other_user_data', async () => {
    const user = {
      email: faker.internet.email(),
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic_hatred',
    };
    const {
      body: {
        data: { accessToken },
      },
    } = await registerUser(app, user);

    const AnotherUser = {
      email: 'My@EmAiL.CoM',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'someuser',
      country: { id: 7 },
    };

    await registerUser(app, AnotherUser);

    await request(app.getHttpServer())
      .put('/api/users/profile/someuser')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'my@email.com',
        username: 'player',
        country: { id: 27 },
        timeZone: 'Iceland',
      })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('users_should_not_be_able_change_user_status_to_suspended', async () => {
    const user = {
      email: 'my@email.com',
      password: TEST_PASSWORD,
      type: 'player',
      username: 'imishadev',
    };
    const {
      body: {
        data: { accessToken },
      },
    } = await registerUser(app, user);

    await request(app.getHttpServer())
      .put('/api/users/suspend/imishadev')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });
});
