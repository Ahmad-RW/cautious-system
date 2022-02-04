import * as request from 'supertest';
import { EMAILS } from 'src/utils/queues/emails.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import {
  TEST_EMAIL,
  TEST_PASSWORD,
  login,
  registerUser,
} from 'test/common/test-helpers';
import { User } from 'src/users/entities/user.entity';
import { VerificationsRepository } from 'src/auth/verifications.repository';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { getConnectionManager } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initTestApp(app);
  });

  beforeEach(async () => {
    await clearDB(true);
  });

  afterAll(async () => {
    await tearDownAll(app);
  });

  it('should_not_send_email_if_invalid_email_but_still_return_valid_response', async () => {
    const email = 'test2@test.com';
    const { body: response } = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({
        email,
      })
      .expect(HttpStatus.OK);

    expect(response.data.message).toBe(`Link has been sent to email: ${email}`);
  });

  it('can_reset_password_with_valid_token', async () => {
    const user = await User.findOne({ email: 'superadmin@cylab.com' });
    const verificationRepo = getConnectionManager()
      .get()
      .getCustomRepository(VerificationsRepository);

    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({
        email: user.email,
      })
      .expect(HttpStatus.OK);

    const { token } = await verificationRepo.findVerificationByUser(
      user,
      EMAILS.RESET_PASSWORD,
    );

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        password: '123',
        token,
      })
      .expect(HttpStatus.OK);
  });

  it('cannot_reset_password_with_invalid_token', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        password: '123',
        token: '$2b$10$VdiaKLdmslXHyf33iorswO',
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('should_login_with_valid_Email', async () => {
    const {
      body: {
        data: { accessToken },
      },
    } = await login(app);
    expect(accessToken).toBeTruthy();
  });

  it('should_ignore_case_on_login', async () => {
    const {
      body: {
        data: { accessToken },
      },
    } = await login(app, {
      username: 'SuPerAdmin@CyLab.Com',
      password: '111',
    });
    expect(accessToken).toBeTruthy();
  });

  it('should_NOT_login_with_invalid_Email', async () => {
    const {
      body: { statusCode },
    } = await login(app, {
      username: 'fail@email.com',
      password: '111',
    });
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should_login_with_valid_Username', async () => {
    const { statusCode } = await login(app, {
      username: 'superadmin',
      password: '111',
    });
    expect(statusCode).toBe(HttpStatus.OK);
  });

  it('should_NOT_login_with_invalid_Username', async () => {
    const { statusCode } = await login(app, {
      username: 'invalidUserName',
      password: '111',
    });
    expect(statusCode).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should_fetch_me', async () => {
    const {
      body: {
        data: { accessToken },
      },
    } = await login(app);
    const {
      body: { data },
    } = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(data).toBeTruthy();
  });

  it('should_update_password', async () => {
    // create my test user
    const user = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    let res = await registerUser(app, user);
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    const {
      body: {
        data: { accessToken },
      },
    } = res;

    const { password: hashedPasswordBefore } = await User.findOne({
      email: TEST_EMAIL,
    });

    // submit update password request
    res = await request(app.getHttpServer())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: TEST_PASSWORD,
        newPassword: TEST_PASSWORD.concat('12'),
      });
    expect(res.status).toBe(HttpStatus.OK);

    const { password: hashedPasswordAfter } = await User.findOne({
      email: TEST_EMAIL,
    });

    expect(hashedPasswordBefore).not.toEqual(hashedPasswordAfter);
  });

  it('should_not_update_password_if_old_equals_new', async () => {
    // create my test user
    const user = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    let res = await registerUser(app, user);
    expect(res.status).toBe(HttpStatus.CREATED);
    const {
      body: {
        data: { accessToken },
      },
    } = res;
    // submit update password request
    res = await request(app.getHttpServer())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: TEST_PASSWORD,
        newPassword: TEST_PASSWORD,
      });
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('should_not_update_password_if_old_is_not_actual_user_password', async () => {
    //create my test user
    const user = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    let res = await registerUser(app, user);
    expect(res.status).toBe(201);
    const {
      body: {
        data: { accessToken },
      },
    } = res;
    // submit update password request
    res = await request(app.getHttpServer())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: 'NotMyRealPasswordlol',
        newPassword: TEST_PASSWORD,
      });
    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  });
  it('should_not_update_password_if_new_does_not_meet_requirements', async () => {
    //create my test user
    const user = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    let res = await registerUser(app, user);
    expect(res.status).toBe(201);
    const {
      body: {
        data: { accessToken },
      },
    } = res;
    // submit update password request
    res = await request(app.getHttpServer())
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: TEST_PASSWORD,
        newPassword: 'WeakPassword',
      });
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });
  it('should_require_auth_on_update_password', async () => {
    //create my test user
    const user = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'volcanic hatred',
    };

    let res = await registerUser(app, user);
    expect(res.status).toBe(201);
    // submit update password request without setting auth
    res = await request(app.getHttpServer()).put('/api/auth/password').send({
      oldPassword: TEST_PASSWORD,
      newPassword: 'WeakPassword',
    });
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
