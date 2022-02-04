import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

export interface IRequestWithUser extends Request {
  user: User;
}
