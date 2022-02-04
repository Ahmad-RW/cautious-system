import { CountriesModule } from 'src/countries/countries.module';
import { CountryRepository } from 'src/countries/countries.repository';
import { InvitationRepository } from 'src/invitations/invitations.repository';
import { InvitationsController } from 'src/invitations/invitations.controller';
import { InvitationsService } from 'src/invitations/invitations.service';
import { Module } from '@nestjs/common';
import { QueuesModule } from 'src/utils/queues/queues.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvitationRepository, CountryRepository]),
    UsersModule,
    QueuesModule,
    CountriesModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
