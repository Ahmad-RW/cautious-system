import * as faker from 'faker';
import * as request from 'supertest';
import { EMAILS } from 'src/utils/queues/emails.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TEST_PASSWORD, registerUser } from 'test/common/test-helpers';
import { User } from 'src/users/entities/user.entity';
import { UserStatuses } from 'src/utils/state/constants/user.state';
import { Verification } from 'src/auth/entities/verification.entity';
import { VerificationsRepository } from 'src/auth/verifications.repository';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { getConnectionManager } from 'typeorm';

describe('Verifications_(e2e)', () => {
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
  it('should send active email token', async () => {
    const response = await registerTestUser(app);
    const accessToken = response.body.data.accessToken;
    sendActiveEmail(accessToken).expect(HttpStatus.OK);
  });

  it('should prevent resend active email token before 2 minutes', async () => {
    const response = await registerTestUser(app);
    const accessToken = response.body.data.accessToken;
    sendActiveEmail(accessToken).expect(HttpStatus.OK);

    // try to resend active email before 2 minutes
    sendActiveEmail(response.body.data.accessToken).expect(
      HttpStatus.TOO_MANY_REQUESTS,
    );
  });

  it('should_verify_account_by_verify_email', async () => {
    const response = await registerTestUser(app);
    const accessToken = response.body.data.accessToken;
    const user = await User.findOne({
      where: { email: response.body.data.user.email.toLowerCase() },
    });
    await sendActiveEmail(accessToken);
    const verification = await getVerificationByUser(user);
    await sendVerifyEmail(verification.token).expect(200);
    await user.reload();
    expect(user.emailVerifyAt).not.toBeNull();
    expect(user.status).toBe(UserStatuses.ACTIVE);
  });

  it('should not active account if token incorrect', async () => {
    const response = await registerTestUser(app);
    await sendVerifyEmail('anyToken').expect(HttpStatus.UNPROCESSABLE_ENTITY, {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      errors: [{ message: 'Invalid Token', property: 'token' }],
    });
    const user = await User.findOne({
      where: { email: response.body.data.user.email.toLowerCase() },
    });
    await user.reload();
    expect(user.emailVerifyAt).toBeNull();
  });

  function sendActiveEmail(accessToken: string) {
    return request(app.getHttpServer())
      .post('/api/auth/send-verification-email')
      .set('Authorization', `Bearer ${accessToken}`);
  }

  function sendVerifyEmail(token: string) {
    return request(app.getHttpServer())
      .post('/api/auth/verify-email')
      .send({ token: token });
  }

  async function getVerificationByUser(user: User): Promise<Verification> {
    const verificationRepo = getConnectionManager()
      .get()
      .getCustomRepository(VerificationsRepository);
    expect(user.emailVerifyAt).toBeNull();
    return verificationRepo.findVerificationByUser(
      user,
      EMAILS.EMAIL_VERIFICATION,
    );
  }

  async function registerTestUser(app) {
    const testEmail = faker.internet.email().toLowerCase();
    return await registerUser(app, {
      email: testEmail,
      password: TEST_PASSWORD,
      type: 'player',
      username: 'test username',
    });
  }
});
