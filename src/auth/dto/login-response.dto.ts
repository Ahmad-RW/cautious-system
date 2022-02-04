import { User } from 'src/users/entities/user.entity';

export class LoginResponseDto {
  accessToken: string;
  user: User;
}
