import { Country } from 'src/countries/entities/country.entity';
import { CountryRepository } from 'src/countries/countries.repository';
import { IQueryParams } from 'src/common/decorators/query-param-options';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SearchService } from 'src/utils/search/search.service';

@Injectable()
export class CountriesService {
  constructor(
    private readonly searchService: SearchService<Country>,
    @InjectRepository(CountryRepository)
    private readonly countryRepo: CountryRepository,
  ) {}

  async findAll(queryParams: IQueryParams): Promise<Pagination<Country>> {
    return this.searchService.applySearch(Country, queryParams);
  }

  async findOne(id: number): Promise<Country> {
    return await this.countryRepo.findOne(id);
  }
}
