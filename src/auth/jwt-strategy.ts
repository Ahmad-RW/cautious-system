import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtModuleOptions } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { plainToClass } from 'class-transformer';

interface IJWT {
  user: User;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAuthenticationStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<JwtModuleOptions>('auth').secret,
    });
  }

  async validate(jwtToken: IJWT): Promise<User> {
    const { user: userFromJWT } = jwtToken;
    const user = plainToClass(User, userFromJWT);
    await user.reload();
    return user;
  }
}
