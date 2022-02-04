import {
  ArgumentMetadata,
  Injectable,
  NotImplementedException,
  PipeTransform,
} from '@nestjs/common';
import { Connection } from 'typeorm';
import { NotFoundException } from 'src/common/exceptions/not-found.exception';

@Injectable()
export class BindEntityPipe implements PipeTransform {
  constructor(protected readonly connection: Connection) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const { data: key, metatype } = metadata;
    const entityRepo = this.connection.getRepository(metatype.name);

    if (!entityRepo) {
      throw new NotImplementedException('error.notFound');
    }

    const entity = await entityRepo.findOne({ [key]: value });
    if (!entity) {
      throw new NotFoundException();
    }

    return entity;
  }
}
