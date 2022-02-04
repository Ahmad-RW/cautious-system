import * as faker from 'faker';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { InvitationRepository } from 'src/invitations/invitations.repository';
import { RoleId } from 'src/auth/enums/role.enum';
import {
  TEST_EMAIL,
  TEST_PASSWORD,
  login,
  registerUser,
} from 'test/common/test-helpers';
import { UserRepository } from 'src/users/users.repository';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { getConnectionManager } from 'typeorm';

describe('Invitations (e2e)', () => {
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

  it('admin_should_be_able_to_read_invitations', async () => {
    await request(app.getHttpServer())
      .get('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);
  });

  it('player_should_not_be_able_to_read_invitations', async () => {
    await registerUser(app, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'test_username',
    });
    const res = await login(app, {
      username: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const accessToken = res.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/api/invitations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('admin_should_be_able_to_send_invitation_with_internal_user_role', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: faker.internet.email(),
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      });

    expect(response.status).toBe(HttpStatus.OK);
  });

  it('admin_should_not_be_able_to_send_invitation_with_admin_role', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: faker.internet.email(),
        type: 'admin',
        country: { id: 26 },
      });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('admin_cannot_send_invitation_to_existing_email', async () => {
    const email = faker.internet.email();
    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: email,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      })
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: email,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it('admin_should_be_able_to_resend_invitation_of_an_existing_invitation', async () => {
    const email = faker.internet.email();
    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: email,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      })
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .post('/api/invitations/resend/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('admin_should_be_able_to_cancel_invitation', async () => {
    const email = faker.internet.email();

    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: email,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      })
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .put('/api/invitations/cancel/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.OK);
  });

  it('user_should_be_able_to_register_through_valid_invitation', async () => {
    const mail = faker.internet.email();

    const invitationRepo = getConnectionManager()
      .get()
      .getCustomRepository(InvitationRepository);

    const userRepo = getConnectionManager()
      .get()
      .getCustomRepository(UserRepository);

    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: mail,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      })
      .expect(HttpStatus.OK);

    const { token, email } = await invitationRepo.findOne({ where: { id: 1 } });
    const response = await request(app.getHttpServer())
      .post('/api/invitations/accept')
      .send({
        username: 'imishadev',
        password: 'CTB20#_dd',
        token: token,
      });

    expect(response.status).toBe(HttpStatus.OK);
    const { status } = await invitationRepo.findOne({
      where: { id: 1 },
    });

    expect(status).toBe('accepted');
    const user = await userRepo.findOne({ where: { email: email } });
    expect(user).toBeDefined();
  });

  it('user_should_not_be_able_to_register_through_invalid_expired_invitation', async () => {
    const mail = faker.internet.email();

    await request(app.getHttpServer())
      .post('/api/invitations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: mail,
        role: { id: RoleId.technicalAdmin },
        country: { id: 26 },
      })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .put('/api/invitations/cancel/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(HttpStatus.OK);

    const invitationRepo = getConnectionManager()
      .get()
      .getCustomRepository(InvitationRepository);

    const { status, token } = await invitationRepo.findOne({
      where: { id: 1 },
    });
    expect(status).toBe('cancelled');

    const response = await request(app.getHttpServer())
      .post('/api/invitations/accept')
      .send({
        username: 'imishadev',
        password: 'CTB20#_dd',
        token: token,
      });

    expect(response.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);

    const userRepo = getConnectionManager()
      .get()
      .getCustomRepository(UserRepository);
    const user = await userRepo.findOne({ where: { email: mail } });

    expect(user).toBeUndefined();
  });
});
