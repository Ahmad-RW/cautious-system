import { BindEntityPipe } from 'src/common/pipes/bind-entity.pipe';
import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from 'src/countries/countries.service';
import { Country } from 'src/countries/entities/country.entity';
import {
  IQueryParams,
  QueryParamOptions,
} from 'src/common/decorators/query-param-options';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';

@Controller('countries')
@SkipAuth()
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async findAll(
    @QueryParamOptions() queryOptions: IQueryParams,
  ): Promise<Pagination<Country>> {
    return await this.countriesService.findAll(queryOptions);
  }

  @Get(':id')
  findOne(@Param('id', BindEntityPipe) country: Country): Country {
    return country;
  }
}
