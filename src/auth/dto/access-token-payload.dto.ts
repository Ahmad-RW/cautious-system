import { User } from 'src/users/entities/user.entity';

export class AccessTokenPayload {
  //add more info into jwt payload if necessary
  constructor(public user: User) {}
}
