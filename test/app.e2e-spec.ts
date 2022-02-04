import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';
import { login } from 'test/common/test-helpers';

describe('AppController (e2e)', () => {
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

  it('should_get_hello_world', async () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.data).toBe('Hello World!');
      });
  });

  it('should_log_in', async () => {
    const response = await login(app);
    expect(response.body.data.accessToken).toBeTruthy();
  });

  it('should_fetch_me', async () => {
    let response = await login(app);
    const accessToken = response.body.data.accessToken;
    response = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.data).toBeTruthy();
  });
});
