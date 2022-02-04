import { CountriesController } from 'src/countries/countries.controller';
import { CountriesService } from 'src/countries/countries.service';
import { CountryRepository } from 'src/countries/countries.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CountryRepository])],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
