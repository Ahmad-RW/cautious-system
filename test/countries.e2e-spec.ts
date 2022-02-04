import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { clearDB, initTestApp, tearDownAll } from 'test/common/test-setup';

describe('CountriesModule (e2e)', () => {
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

  it('should_get_list_of_countries', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/countries')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body.data.items)).toBe(true);
  });

  it('should_get_a_specific_country', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/countries/1')
      .expect(HttpStatus.OK);
    expect(Object.keys(response.body.data)).toEqual(
      expect.arrayContaining(['id', 'nameEn', 'nameAr', 'code']),
    );
  });

  it('should_not_get_a_non_existing_country', async () => {
    await request(app.getHttpServer())
      .get('/api/countries/9999999')
      .expect(HttpStatus.NOT_FOUND);
  });
});
