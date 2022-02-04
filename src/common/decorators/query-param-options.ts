import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ISearchOptions } from 'src/utils/search/interfaces/search-options.interface';
import { SearchDto } from 'src/utils/search/dto/search.dto';
import { plainToClass } from 'class-transformer';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;

export interface IQueryParams extends IPaginationOptions, ISearchOptions {}

export const QueryParamOptions = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IQueryParams => {
    const { protocol, headers, originalUrl, query } = ctx
      .switchToHttp()
      .getRequest();

    const pathAndParams: string = originalUrl
      .split('&')
      .filter((e: string) => !(e.includes('page') || e.includes('limit')))
      .join('&');
    const searchOptions = plainToClass(SearchDto, query);
    const page = query.page || DEFAULT_PAGE;
    const limit = query.limit || DEFAULT_LIMIT;
    const route = `${protocol}://${headers.host}${
      pathAndParams || originalUrl
    }`;

    return { page, limit, route, ...searchOptions };
  },
);
