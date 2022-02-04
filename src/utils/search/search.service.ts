import { Connection, FindManyOptions, ILike, In, Repository } from 'typeorm';
import { IAdditionalSearchQueries } from 'src/utils/search/interfaces/extra-queries.interface';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { IQueryParams } from 'src/common/decorators/query-param-options';
import { Injectable, Type } from '@nestjs/common';
import { RootEntity } from 'src/common/root.entity';
import { entitiesFilterFields } from 'src/utils/search/constants/filterable-fields.constant';
import { entitiesSearchableFields } from 'src/utils/search/constants/searchable-fields.constants';
import { isEmpty } from 'lodash';

@Injectable()
export class SearchService<T extends RootEntity> {
  constructor(private readonly connection: Connection) {}

  async applySearch(
    { name: entityName }: Type<T>,
    {
      term,
      searchFields: givenFields,
      filters: givenFilters,
      orderBy: orderKey,
      order: orderValue,
      page,
      limit,
      route,
    }: IQueryParams,
    { extraFilters, relations }: IAdditionalSearchQueries = {},
  ): Promise<Pagination<T>> {
    const order: Record<string, any> = { [orderKey]: orderValue };
    const rolesFilter = givenFilters.find((field) => field['role']);

    if (extraFilters?.role && rolesFilter && !isEmpty(rolesFilter)) {
      const extractedRoles = this.extractPermittedRoles(
        rolesFilter,
        extraFilters.role,
      );
      extraFilters.role = In(extractedRoles);
    }

    const filterFields = {
      ...this.getFilterableFields(
        givenFilters,
        entitiesFilterFields[entityName],
      ),
      ...extraFilters,
    };

    const searchFields = this.getSearchableFields(
      givenFields,
      entitiesSearchableFields[entityName],
    );

    let relationsOptions: FindManyOptions<T> = {};
    if (!isEmpty(relations)) {
      relationsOptions = {
        loadEagerRelations: false,
        relations,
      };
    }

    const findQueryObj: FindManyOptions<T> = {
      ...relationsOptions,
      where: searchFields.length
        ? searchFields.map((field) => ({
            ...filterFields,
            [field]: ILike(`%${term}%`),
          }))
        : { ...filterFields },
      order,
    };

    // console.log(findQueryObj);

    const repository: Repository<T> =
      this.connection.getRepository<T>(entityName);

    const paginationOptions: IPaginationOptions = { limit, page, route };

    return paginate<T>(repository, paginationOptions, findQueryObj);
  }

  /**
   * Intersects the roles comming from filter and the user permitted roles
   * @param givenFilters all given filters
   * @param roles based on dependent roles
   * @returns FindOperator
   */
  private extractPermittedRoles(rolesToFind, permittedRoles) {
    return rolesToFind['role'].filter((roleId) =>
      permittedRoles.value.includes(Number(roleId)),
    );
  }

  private getFilterableFields(
    givenFilters: string[],
    filterables: string[],
  ): Record<string, any> {
    return givenFilters.reduce((res, current) => {
      if (filterables.includes(Object.keys(current)[0])) {
        const [key] = Object.keys(current);
        res[key] = In(current[key]);
      }
      return res;
    }, {});
  }

  private getSearchableFields(
    givenFields: string[],
    searchables: string[],
  ): string[] {
    return !isEmpty(givenFields) && !isEmpty(searchables)
      ? givenFields.filter((field) => searchables.includes(field))
      : searchables || [];
  }
}
