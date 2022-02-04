import { ISearchOptions } from 'src/utils/search/interfaces/search-options.interface';
import { IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

const DEFAULT_ORDER = 'DESC';
const ORDERS = ['ASC', 'DESC'];
export class SearchDto implements ISearchOptions {
  @IsString()
  term = '';

  @IsArray()
  @Transform(({ value }) => value.split(','))
  searchFields: string[] = [];

  @IsString()
  orderBy = 'createdAt';

  @IsString()
  @Transform(({ value }) => {
    const result = value.toUpperCase();
    if (!ORDERS.includes(result)) return DEFAULT_ORDER;
    return result;
  })
  order = DEFAULT_ORDER;

  @IsArray()
  @Transform(
    ({ value }): Record<string, any> =>
      value.map((v: string): Record<string, any> => {
        const [key, ...values] = v.split(',');
        return { [key]: values };
      }),
  )
  filters: string[] = [];
}
