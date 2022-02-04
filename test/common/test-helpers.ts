import * as faker from 'faker';
import * as request from 'supertest';
import { Country } from 'src/countries/entities/country.entity';
import { INestApplication } from '@nestjs/common';

export const TEST_PASSWORD = 'MyVery$ecurePa$$word196538';
export const TEST_EMAIL = faker.internet.email().toLowerCase();

export async function login(
  app: INestApplication,
  credentials = {
    username: 'superadmin@cylab.com',
    password: '111',
  },
) {
  const response = await request(app.getHttpServer())
    .post('/api/auth')
    .send(credentials);
  return response;
}

export async function registerUser(
  app: INestApplication,
  { email, password, type, username },
) {
  const response = await request(app.getHttpServer())
    .post('/api/users')
    .send({
      email,
      password,
      type,
      username,
      country: await Country.findOne({}),
    });
  return response;
}
