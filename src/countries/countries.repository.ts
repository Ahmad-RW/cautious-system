import { Country } from 'src/countries/entities/country.entity';
import { EntityRepository, Repository } from 'typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@EntityRepository(Country)
export class CountryRepository extends Repository<Country> {
  async getAll(
    paginationOptions: IPaginationOptions,
  ): Promise<Pagination<Country>> {
    return await paginate<Country>(this, paginationOptions);
  }
}
