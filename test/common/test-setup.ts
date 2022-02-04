import { AppModule } from 'src/app.module';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnection } from 'typeorm';
import {
  runSeeder,
  tearDownDatabase,
  useRefreshDatabase,
  useSeeding,
} from 'typeorm-seeding';
import { setAppGlobals } from 'src/common-bootup';

import MainSeeder from 'src/database/seeds/main.seed';

export const initTestApp = async (
  app: INestApplication,
  withInitialSeed = true,
): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  setAppGlobals(app);

  await app.init();
  await useRefreshDatabase({ configName: 'src/database/connection-export.ts' });
  await useSeeding({ configName: 'src/database/connection-export.ts' });

  if (withInitialSeed) await runInitialSeeders();

  return app;
};

export const runInitialSeeders = async () => {
  await runSeeder(MainSeeder);
};

export const tearDownAll = async (app: INestApplication) => {
  await tearDownDatabase();
  await app.close();
};

export const clearDB = async (runInitialSeed = true) => {
  const entities = getConnection().entityMetadatas;
  for (const entity of entities) {
    const repository = getConnection().getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }

  if (runInitialSeed) await runInitialSeeders();
};
